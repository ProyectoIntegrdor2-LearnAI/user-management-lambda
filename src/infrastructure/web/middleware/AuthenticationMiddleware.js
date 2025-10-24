/**
 * Authentication Middleware - Infrastructure Layer
 * Middleware para autenticación JWT y validación de sesiones
 */

export class AuthenticationMiddleware {
  constructor(tokenService, userSessionRepository) {
    this.tokenService = tokenService;
    this.userSessionRepository = userSessionRepository;
  }

  /**
   * Middleware que requiere autenticación válida
   */
  requireAuth() {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];

        
        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
          });
        }
        
        // Verificar JWT
        const decoded = await this.tokenService.verify(token);
        
        // Hash del token para verificar sesión
        const tokenHash = await this.tokenService.hash(token);
        
        // Verificar sesión activa
        const session = await this.userSessionRepository.findActiveByTokenHash(tokenHash);
        
        if (!session?.isActive()) {
          return res.status(401).json({
            success: false,
            message: 'Sesión inválida o expirada'
          });
        }
        
        // Añadir información del usuario al request
        req.user = {
          user_id: decoded.user_id,
          email: decoded.email,
          type_user: decoded.type_user
        };
        
        req.session = {
          session_id: session.session_id
        };
        
        next();
        
      } catch (error) {
        return this._handleAuthError(error, res);
      }
    };
  }

  /**
   * Middleware de autenticación opcional
   */
  optionalAuth() {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
          req.user = null;
          return next();
        }
        
        // Si hay token, intentar validarlo
        const decoded = await this.tokenService.verify(token);
        const tokenHash = await this.tokenService.hash(token);
        const session = await this.userSessionRepository.findActiveByTokenHash(tokenHash);
        
        if (session?.isActive()) {
          req.user = {
            user_id: decoded.user_id,
            email: decoded.email,
            type_user: decoded.type_user
          };
          req.session = {
            session_id: session.session_id
          };
        } else {
          req.user = null;
        }
        
        next();
        
      } catch (error) {
        console.warn('Optional auth token error:', error.message);
        // Si hay error con el token opcional, continuar sin usuario
        req.user = null;
        next();
      }
    };
  }

  /**
   * Middleware para requerir roles específicos
   */
  requireRole(roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
      }
      
      if (!allowedRoles.includes(req.user.type_user)) {
        return res.status(403).json({
          success: false,
          message: 'Permisos insuficientes'
        });
      }
      
      next();
    };
  }

  /**
   * Middleware para requerir permisos de administrador
   */
  requireAdmin() {
    return this.requireRole('admin');
  }

  /**
   * Maneja errores de autenticación
   */
  _handleAuthError(error, res) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}