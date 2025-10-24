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
      const requestedUserId = typeof id === 'string' ? id : null;
      const targetUserId = !requestedUserId || requestedUserId === 'me'
        ? authenticatedUserId
        : String(requestedUserId);

      // Verificar que el usuario solo pueda ver su propio perfil
      if (targetUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este perfil'
        });
      }
      
      const result = await this.getUserProfileUseCase.execute({
        user_id: targetUserId
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
      const requestedUserId = typeof id === 'string' ? id : null;
      const targetUserId = !requestedUserId || requestedUserId === 'me'
        ? authenticatedUserId
        : String(requestedUserId);
      const updates = req.validated?.body ?? req.body;
      
      // Verificar que el usuario solo pueda actualizar su propio perfil
      if (targetUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este perfil'
        });
      }
      
      const result = await this.updateUserProfileUseCase.execute({
        user_id: targetUserId,
        updates
      });

      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el progreso del usuario
   */
  async getProgress(req, res, next) {
    try {
      const { id } = req.params;
      const authenticatedUserId = String(req.user.user_id);
      const requestedUserId = typeof id === 'string' ? id : null;
      const targetUserId = !requestedUserId || requestedUserId === 'me'
        ? authenticatedUserId
        : String(requestedUserId);

      if (targetUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este progreso'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Progreso obtenido exitosamente',
        data: {
          progress: {
            completedCourses: 0,
            totalCourses: 0,
            consecutiveDays: 0,
            totalHours: 0,
            level: 'Sin datos'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el progreso del usuario (placeholder)
   */
  async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const authenticatedUserId = String(req.user.user_id);
      const requestedUserId = typeof id === 'string' ? id : null;
      const targetUserId = !requestedUserId || requestedUserId === 'me'
        ? authenticatedUserId
        : String(requestedUserId);

      if (targetUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este progreso'
        });
      }

      const { resourceId } = req.body ?? {};
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'resourceId es requerido'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Progreso registrado (placeholder)',
        data: {
          progress: {
            completedCourses: 0,
            totalCourses: 0,
            consecutiveDays: 0,
            totalHours: 0,
            level: 'Sin datos'
          },
          resourceId
        }
      });
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
      const requestedUserId = typeof id === 'string' ? id : null;
      const targetUserId = !requestedUserId || requestedUserId === 'me'
        ? authenticatedUserId
        : String(requestedUserId);
      
      // Verificar permisos
      if (targetUserId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este dashboard'
        });
      }
      
      // Por ahora, el dashboard es simplemente el perfil del usuario
      // En el futuro se puede extender con más información
      const result = await this.getUserProfileUseCase.execute({
        user_id: targetUserId
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

  getProgressHandler() {
    return this.getProgress.bind(this);
  }

  getUpdateProgressHandler() {
    return this.updateProgress.bind(this);
  }
}
