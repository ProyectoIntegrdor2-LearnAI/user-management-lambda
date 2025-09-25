/**
 * Get User Profile Use Case - Application Layer
 * Caso de uso para obtener perfil de usuario
 */

export class GetUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ user_id }) {
    if (!user_id) {
      throw new Error('MISSING_USER_ID', {
        message: 'ID de usuario es obligatorio'
      });
    }

    // Buscar usuario
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new Error('USER_NOT_FOUND', {
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive()) {
      throw new Error('ACCOUNT_SUSPENDED', {
        message: 'La cuenta está suspendida'
      });
    }

    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: user.toPublicData()
      }
    };
  }
}