/**
 * LearningPathRepository Interface - Domain Layer
 * Define contrato para operaciones sobre rutas de aprendizaje y progreso
 */

// eslint-disable-next-line import/prefer-default-export
export class LearningPathRepository {
  async findAllByUserId(userId) {
    throw new Error('Method must be implemented');
  }

  async findById(userId, pathId) {
    throw new Error('Method must be implemented');
  }

  async updateCourseProgress({ userId, pathId, courseId, status, progressPercentage, timeInvestedMinutes }) { // eslint-disable-line max-params
    throw new Error('Method must be implemented');
  }

  async computeUserProgress(userId) {
    throw new Error('Method must be implemented');
  }
}
