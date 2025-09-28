/**
 * Profile Web Controller - Infrastructure Layer
 * Controlador web para manejar requests HTTP de perfil de usuario
 */

export class ProfileWebController {
  constructor(
    getUserProfileUseCase,
    updateUserProfileUseCase
  ) {
    this.getUserProfileUseCase = getUserProfileUseCase;
    this.updateUserProfileUseCase = updateUserProfileUseCase;
  }

  /**
   * Obtiene el perfil de un usuario
   */
  async getProfile(req, res, next) {
    try {
      const { id } = req.params;
      const authenticatedUserId = String(req.user.user_id);
      const requestedUserId = String(id);
      
      // Verificar que el usuario solo pueda ver su propio perfil
      // (o implementar lógica de permisos más compleja si es necesario)
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este perfil'
        });
      }
      
      const result = await this.getUserProfileUseCase.execute({
        user_id: requestedUserId
      });

      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const authenticatedUserId = String(req.user.user_id);
      const requestedUserId = String(id);
      const updates = req.validated?.body ?? req.body;
      
      // Verificar que el usuario solo pueda actualizar su propio perfil
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este perfil'
        });
      }
      
      const result = await this.updateUserProfileUseCase.execute({
        user_id: requestedUserId,
        updates
      });

      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el dashboard del usuario (versión simplificada)
   */
  async getDashboard(req, res, next) {
    try {
      const { id } = req.params;
      const authenticatedUserId = String(req.user.user_id);
      const requestedUserId = String(id);
      
      // Verificar permisos
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este dashboard'
        });
      }
      
      // Por ahora, el dashboard es simplemente el perfil del usuario
      // En el futuro se puede extender con más información
      const result = await this.getUserProfileUseCase.execute({
        user_id: requestedUserId
      });

      return res.status(200).json({
        success: true,
        message: 'Dashboard obtenido exitosamente',
        data: {
          user: result.data.user,
          dashboard_info: {
            last_login: result.data.user.last_login,
            account_status: result.data.user.status,
            member_since: result.data.user.created_at
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Métodos bound para usar directamente en las rutas
   */
  getProfileHandler() {
    return this.getProfile.bind(this);
  }

  getUpdateProfileHandler() {
    return this.updateProfile.bind(this);
  }

  getDashboardHandler() {
    return this.getDashboard.bind(this);
  }
}