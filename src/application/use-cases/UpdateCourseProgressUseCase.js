/**
 * UpdateCourseProgressUseCase - Application Layer
 */

export class UpdateCourseProgressUseCase {
  constructor(learningPathRepository) {
    this.learningPathRepository = learningPathRepository;
  }

  async execute({
    user_id,
    path_id,
    course_id,
    status,
    progress_percentage,
    time_invested_minutes,
    user_rating,
    personal_notes,
  }) {
    if (!user_id) {
      throw new Error('MISSING_USER_ID', { message: 'ID de usuario es obligatorio' });
    }
    if (!path_id) {
      throw new Error('MISSING_PATH_ID', { message: 'El path_id es obligatorio' });
    }
    if (!course_id) {
      throw new Error('MISSING_COURSE_ID', { message: 'El course_id es obligatorio' });
    }

    const updatedPath = await this.learningPathRepository.updateCourseProgress({
      userId: user_id,
      pathId: path_id,
      courseId: course_id,
      status,
      progressPercentage: progress_percentage,
      timeInvestedMinutes: time_invested_minutes,
      userRating: user_rating,
      personalNotes: personal_notes,
    });

    if (!updatedPath) {
      throw new Error('COURSE_PROGRESS_UPDATE_FAILED', { message: 'No se pudo actualizar el progreso del curso' });
    }

    return {
      success: true,
      message: 'Progreso actualizado correctamente',
      data: {
        learning_path: updatedPath,
      },
    };
  }
}
