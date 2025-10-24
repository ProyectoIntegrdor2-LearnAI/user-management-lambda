/**
 * Error Handler Middleware - Infrastructure Layer
 * Middleware para manejo centralizado de errores
 */

import { ValidationError } from '../../../shared/errors/ValidationError.js';

export class ErrorHandlerMiddleware {
  /**
   * Middleware principal de manejo de errores
   */
  static handle() {
    return (err, req, res, next) => {
      console.error('Error capturado:', err);

      if (ErrorHandlerMiddleware._isValidationError(err)) {
        return ErrorHandlerMiddleware._handleValidationError(err, res);
      }

      if (ErrorHandlerMiddleware._isJwtError(err)) {
        return ErrorHandlerMiddleware._handleJwtError(err, res);
      }

      if (ErrorHandlerMiddleware._isDatabaseError(err)) {
        return ErrorHandlerMiddleware._handleDatabaseError(err, res);
      }

      if (err.code) {
        return ErrorHandlerMiddleware._handleBusinessError(err, res);
      }

      return ErrorHandlerMiddleware._handleGenericError(err, res);
    };
  }

  // 🔹 Detectores de tipo de error (simplifican el flujo principal)
  static _isValidationError(err) {
    return err instanceof ValidationError || err.name === 'ValidationError';
  }

  static _isJwtError(err) {
    return err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError';
  }

  static _isDatabaseError(err) {
    return err.code === '23505' || err.code === '23503';
  }

  // 🔹 Handlers específicos
  static _handleValidationError(err, res) {
    const missing = typeof err.getMissingFields === 'function' ? err.getMissingFields() : [];
    const invalidDetails = typeof err.getInvalidFields === 'function' ? err.getInvalidFields() : [];

    const invalid = invalidDetails.map(item =>
      typeof item === 'string' ? { field: item, message: 'Campo inválido' } : item
    );

    const pieces = [];
    if (missing.length) pieces.push(`Faltan campos requeridos: ${missing.join(', ')}`);
    if (invalid.length) pieces.push('Hay campos con valores inválidos');

    const message = pieces.length ? pieces.join('. ') : err.message;

    return res.status(400).json({
      success: false,
      message,
      missing,
      invalid,
      required: ['identification', 'name', 'email', 'password']
    });
  }

  static _handleJwtError(err, res) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ success: false, message });
  }

  static _handleDatabaseError(err, res) {
    const dbErrors = {
      '23505': { status: 409, message: 'Conflicto: el recurso ya existe' },
      '23503': { status: 400, message: 'Error de integridad referencial' }
    };

    const { status, message } = dbErrors[err.code] || { status: 500, message: 'Error de base de datos' };
    return res.status(status).json({ success: false, message });
  }

  static _handleBusinessError(err, res) {
    const errorMappings = {
      MISSING_CREDENTIALS: { status: 400, message: 'Credenciales faltantes' },
      INVALID_CREDENTIALS: { status: 401, message: 'Credenciales inválidas' },
      ACCOUNT_SUSPENDED: { status: 403, message: 'Cuenta suspendida' },
      EMAIL_EXISTS: { status: 409, message: 'El email ya está registrado' },
      USER_NOT_FOUND: { status: 404, message: 'Usuario no encontrado' },
      SESSION_NOT_FOUND: { status: 404, message: 'Sesión no encontrada' },
      SESSION_EXPIRED: { status: 401, message: 'Sesión expirada' },
      MISSING_USER_ID: { status: 400, message: 'ID de usuario requerido' },
      MISSING_PARAMETERS: { status: 400, message: 'Parámetros faltantes' },
      NO_UPDATES: { status: 400, message: 'No hay datos para actualizar' },
      REGISTRATION_ERROR: { status: 500, message: 'Error en el registro' },
      LOGIN_ERROR: { status: 500, message: 'Error en el login' },
      LOGOUT_ERROR: { status: 500, message: 'Error en el logout' },
      UPDATE_ERROR: { status: 500, message: 'Error en la actualización' }
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

  static _handleGenericError(err, res) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
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
