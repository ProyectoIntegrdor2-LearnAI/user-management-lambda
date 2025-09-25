/**
 * Error Handler Middleware - Infrastructure Layer
 * Middleware para manejo centralizado de errores
 */

export class ErrorHandlerMiddleware {
  
  /**
   * Middleware principal de manejo de errores
   */
  static handle() {
    return (err, req, res, next) => {
      console.error('Error capturado:', err);

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: err.message,
          missing: err.details || []
        });
      }
      
      // Error de validación de JWT
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
      
      // Error de token expirado
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      
      // Error de base de datos - constraint único
      if (err.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Conflicto: el recurso ya existe'
        });
      }
      
      // Error de base de datos - clave foránea
      if (err.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Error de integridad referencial'
        });
      }

      // Errores de negocio personalizados
      if (err.code) {
        return ErrorHandlerMiddleware._handleBusinessError(err, res);
      }
      
      // Error genérico
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
      });
    };
  }

  /**
   * Maneja errores específicos del negocio
   */
  static _handleBusinessError(err, res) {
    const errorMappings = {
      'MISSING_CREDENTIALS': { status: 400, message: 'Credenciales faltantes' },
      'INVALID_CREDENTIALS': { status: 401, message: 'Credenciales inválidas' },
      'ACCOUNT_SUSPENDED': { status: 403, message: 'Cuenta suspendida' },
      'EMAIL_EXISTS': { status: 409, message: 'El email ya está registrado' },
      'USER_NOT_FOUND': { status: 404, message: 'Usuario no encontrado' },
      'SESSION_NOT_FOUND': { status: 404, message: 'Sesión no encontrada' },
      'SESSION_EXPIRED': { status: 401, message: 'Sesión expirada' },
      'MISSING_USER_ID': { status: 400, message: 'ID de usuario requerido' },
      'MISSING_PARAMETERS': { status: 400, message: 'Parámetros faltantes' },
      'NO_UPDATES': { status: 400, message: 'No hay datos para actualizar' },
      'REGISTRATION_ERROR': { status: 500, message: 'Error en el registro' },
      'LOGIN_ERROR': { status: 500, message: 'Error en el login' },
      'LOGOUT_ERROR': { status: 500, message: 'Error en el logout' },
      'UPDATE_ERROR': { status: 500, message: 'Error en la actualización' }
    };

    const mapping = errorMappings[err.code] || {
      status: 500,
      message: 'Error interno del servidor'
    };

    return res.status(mapping.status).json({
      success: false,
      message: err.message || mapping.message,
      ...(err.details && { details: err.details })
    });
  }

  /**
   * Middleware para rutas no encontradas (404)
   */
  static notFound() {
    return (req, res) => {
      res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.path}`
      });
    };
  }
}