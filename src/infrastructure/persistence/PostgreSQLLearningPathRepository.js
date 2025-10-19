/**
 * PostgreSQL Learning Path Repository - Infrastructure Layer
 * Implementa acceso a datos para rutas de aprendizaje y progreso de cursos
 */

import dbPool from '../database/connection.js';
import { LearningPathRepository } from '../../domain/repositories/LearningPathRepository.js';

const mapPathRow = (row) => ({
  path_id: row.path_id,
  name: row.name,
  description: row.description,
  status: row.status,
  progress_percentage: Number(row.progress_percentage ?? 0),
  target_hours_per_week: row.target_hours_per_week,
  target_completion_date: row.target_completion_date,
  priority: row.priority,
  is_public: row.is_public,
  created_at: row.created_at,
  updated_at: row.updated_at,
  completed_at: row.completed_at,
});

const mapCourseRow = (row) => ({
  progress_id: row.progress_id,
  mongodb_course_id: row.mongodb_course_id,
  status: row.status,
  progress_percentage: Number(row.progress_percentage ?? 0),
  time_invested_minutes: row.time_invested_minutes,
  user_rating: row.user_rating,
  personal_notes: row.personal_notes,
  sequence_order: row.sequence_order,
  dependencies_completed: row.dependencies_completed,
  started_at: row.started_at,
  completed_at: row.completed_at,
  last_activity: row.last_activity,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export class PostgreSQLLearningPathRepository extends LearningPathRepository {
  async findAllByUserId(userId) {
    const client = await dbPool.connect();
    try {
      const { rows: pathRows } = await client.query(
        `
          SELECT
            path_id,
            name,
            description,
            status,
            progress_percentage,
            target_hours_per_week,
            target_completion_date,
            priority,
            is_public,
            created_at,
            updated_at,
            completed_at
          FROM user_learning_paths
          WHERE user_id = $1
          ORDER BY created_at DESC
        `,
        [userId],
      );

      if (pathRows.length === 0) {
        return [];
      }

      const pathIds = pathRows.map((row) => row.path_id);

      const { rows: courseRows } = await client.query(
        `
          SELECT
            progress_id,
            path_id,
            mongodb_course_id,
            status,
            progress_percentage,
            time_invested_minutes,
            user_rating,
            personal_notes,
            sequence_order,
            dependencies_completed,
            started_at,
            completed_at,
            last_activity,
            created_at,
            updated_at
          FROM course_progress
          WHERE user_id = $1 AND path_id = ANY($2::uuid[])
          ORDER BY path_id, sequence_order
        `,
        [userId, pathIds],
      );

      const coursesByPath = courseRows.reduce((acc, row) => {
        const key = row.path_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(mapCourseRow(row));
        return acc;
      }, {});

      return pathRows.map((row) => ({
        ...mapPathRow(row),
        courses: coursesByPath[row.path_id] || [],
      }));
    } finally {
      client.release();
    }
  }

  async findById(userId, pathId) {
    const client = await dbPool.connect();
    try {
      const { rows: pathRows } = await client.query(
        `
          SELECT
            path_id,
            name,
            description,
            status,
            progress_percentage,
            target_hours_per_week,
            target_completion_date,
            priority,
            is_public,
            created_at,
            updated_at,
            completed_at
          FROM user_learning_paths
          WHERE user_id = $1 AND path_id = $2
          LIMIT 1
        `,
        [userId, pathId],
      );

      if (pathRows.length === 0) {
        return null;
      }

      const path = mapPathRow(pathRows[0]);

      const { rows: courseRows } = await client.query(
        `
          SELECT
            progress_id,
            path_id,
            mongodb_course_id,
            status,
            progress_percentage,
            time_invested_minutes,
            user_rating,
            personal_notes,
            sequence_order,
            dependencies_completed,
            started_at,
            completed_at,
            last_activity,
            created_at,
            updated_at
          FROM course_progress
          WHERE user_id = $1 AND path_id = $2
          ORDER BY sequence_order
        `,
        [userId, pathId],
      );

      return {
        ...path,
        courses: courseRows.map(mapCourseRow),
      };
    } finally {
      client.release();
    }
  }

  async updateCourseProgress({
    userId,
    pathId,
    courseId,
    status,
    progressPercentage,
    timeInvestedMinutes,
    userRating,
    personalNotes,
  }) {
    const client = await dbPool.connect();

    const normalizedStatus = status ?? 'in_progress';
    let normalizedPercentage = progressPercentage;
    if (normalizedPercentage == null) {
      if (normalizedStatus === 'completed') {
        normalizedPercentage = 100;
      } else if (normalizedStatus === 'not_started') {
        normalizedPercentage = 0;
      }
    }
    if (normalizedPercentage == null) {
      normalizedPercentage = 0;
    }

    try {
      await client.query('BEGIN');

      const { rows: updatedRows } = await client.query(
        `
          UPDATE course_progress
          SET
            status = $4,
            progress_percentage = $5,
            time_invested_minutes = COALESCE($6, time_invested_minutes),
            user_rating = COALESCE($7, user_rating),
            personal_notes = COALESCE($8, personal_notes),
            dependencies_completed = CASE
              WHEN $4 = 'completed' THEN TRUE
              ELSE dependencies_completed
            END,
            started_at = CASE
              WHEN $4 IN ('in_progress', 'completed') AND started_at IS NULL THEN NOW()
              WHEN $4 = 'not_started' THEN NULL
              ELSE started_at
            END,
            completed_at = CASE
              WHEN $4 = 'completed' THEN NOW()
              WHEN $4 IN ('not_started', 'in_progress') THEN NULL
              ELSE completed_at
            END,
            last_activity = NOW(),
            updated_at = NOW()
          WHERE user_id = $1
            AND path_id = $2
            AND mongodb_course_id = $3
          RETURNING *
        `,
        [
          userId,
          pathId,
          courseId,
          normalizedStatus,
          normalizedPercentage,
          timeInvestedMinutes,
          userRating,
          personalNotes,
        ],
      );

      if (updatedRows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query(
        `
          UPDATE user_learning_paths
          SET
            progress_percentage = COALESCE((
              SELECT AVG(progress_percentage)
              FROM course_progress
              WHERE path_id = $1
            ), 0),
            status = CASE
              WHEN NOT EXISTS (
                SELECT 1 FROM course_progress
                WHERE path_id = $1
                  AND status NOT IN ('completed', 'skipped')
              ) THEN 'completed'
              ELSE
                CASE
                  WHEN EXISTS (
                    SELECT 1 FROM course_progress
                    WHERE path_id = $1 AND status = 'in_progress'
                  ) THEN 'active'
                  ELSE 'active'
                END
            END,
            completed_at = CASE
              WHEN NOT EXISTS (
                SELECT 1 FROM course_progress
                WHERE path_id = $1
                  AND status NOT IN ('completed', 'skipped')
              ) THEN COALESCE(completed_at, NOW())
              ELSE NULL
            END,
            updated_at = NOW()
          WHERE path_id = $1 AND user_id = $2
        `,
        [pathId, userId],
      );

      await client.query('COMMIT');
      return this.findById(userId, pathId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async computeUserProgress(userId) {
    const client = await dbPool.connect();
    try {
      const { rows: summaryRows } = await client.query(
        `
          SELECT
            COUNT(*) FILTER (WHERE status IN ('completed', 'skipped')) AS completed_courses,
            COUNT(*) AS total_courses,
            COALESCE(SUM(time_invested_minutes), 0) AS minutes
          FROM course_progress
          WHERE user_id = $1
        `,
        [userId],
      );

      const summary = summaryRows.length ? summaryRows[0] : {
        completed_courses: 0,
        total_courses: 0,
        minutes: 0,
      };

      const { rows: pathRows } = await client.query(
        `
          SELECT status, updated_at
          FROM user_learning_paths
          WHERE user_id = $1
          ORDER BY COALESCE(updated_at, created_at) DESC
          LIMIT 1
        `,
        [userId],
      );

      const latestStatus = pathRows.length ? pathRows[0].status : null;
      let level = 'Sin datos';
      if (latestStatus === 'completed') {
        level = 'Completado';
      } else if (summary.total_courses > 0) {
        level = 'En progreso';
      }

      return {
        completedCourses: Number(summary.completed_courses ?? 0),
        totalCourses: Number(summary.total_courses ?? 0),
        totalHours: Math.round(Number(summary.minutes ?? 0) / 60),
        level,
      };
    } finally {
      client.release();
    }
  }
}
