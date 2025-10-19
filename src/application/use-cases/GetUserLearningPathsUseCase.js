/**
 * GetUserLearningPathsUseCase - Application Layer
 */

export class GetUserLearningPathsUseCase {
  constructor(learningPathRepository) {
    this.learningPathRepository = learningPathRepository;
  }

  async execute({ user_id }) {
    if (!user_id) {
      throw new Error('MISSING_USER_ID', {
        message: 'ID de usuario es obligatorio',
      });
    }

    const paths = await this.learningPathRepository.findAllByUserId(user_id);
    return {
      success: true,
      data: {
        learning_paths: paths,
      },
    };
  }
}
