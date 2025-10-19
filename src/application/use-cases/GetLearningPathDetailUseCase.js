/**
 * GetLearningPathDetailUseCase - Application Layer
 */

export class GetLearningPathDetailUseCase {
  constructor(learningPathRepository) {
    this.learningPathRepository = learningPathRepository;
  }

  async execute({ user_id, path_id }) {
    if (!user_id) {
      throw new Error('MISSING_USER_ID', { message: 'ID de usuario es obligatorio' });
    }
    if (!path_id) {
      throw new Error('MISSING_PATH_ID', { message: 'El path_id es obligatorio' });
    }

    const path = await this.learningPathRepository.findById(user_id, path_id);
    if (!path) {
      throw new Error('LEARNING_PATH_NOT_FOUND', { message: 'Ruta de aprendizaje no encontrada' });
    }

    return {
      success: true,
      data: {
        learning_path: path,
      },
    };
  }
}
