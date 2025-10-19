/**
 * GetUserLearningProgressUseCase - Application Layer
 */

export class GetUserLearningProgressUseCase {
  constructor(learningPathRepository) {
    this.learningPathRepository = learningPathRepository;
  }

  async execute({ user_id }) {
    if (!user_id) {
      throw new Error('MISSING_USER_ID', {
        message: 'ID de usuario es obligatorio',
      });
    }

    const progress = await this.learningPathRepository.computeUserProgress(user_id);

    return {
      success: true,
      data: {
        progress,
      },
    };
  }
}
