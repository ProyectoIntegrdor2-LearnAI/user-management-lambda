/**
 * Logout User Use Case - Application Layer
 * Caso de uso para cerrar sesión de usuario
 */

export class LogoutUserUseCase {
  constructor(userSessionRepository, tokenService) {
    this.userSessionRepository = userSessionRepository;
    this.tokenService = tokenService;
  }

  async execute({ token, user_id }) {
    if (!token || !user_id) {
      throw new Error('MISSING_PARAMETERS', {
        message: 'Token y user_id son obligatorios'
      });
    }

    try {
      // Hash del token para buscar la sesión
      const tokenHash = await this.tokenService.hash(token);

      // Buscar sesión activa
      const session = await this.userSessionRepository.findByUserIdAndTokenHash(
        user_id, 
        tokenHash
      );

      if (!session) {
        throw new Error('SESSION_NOT_FOUND', {
          message: 'Sesión no encontrada'
        });
      }

      // Verificar que la sesión esté activa
      if (!session.isActive()) {
        throw new Error('SESSION_EXPIRED', {
          message: 'La sesión ya ha expirado'
        });
      }

      // Invalidar sesión
      session.invalidate();
      await this.userSessionRepository.update(session);

      return {
        success: true,
        message: 'Logout exitoso'
      };

    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw new Error('LOGOUT_ERROR', {
        message: 'Error al cerrar sesión',
        details: error.message
      });
    }
  }
}