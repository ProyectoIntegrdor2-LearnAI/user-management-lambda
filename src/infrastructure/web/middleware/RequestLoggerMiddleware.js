/**
 * Request Logger Middleware - Infrastructure Layer
 * Middleware para logging de requests HTTP
 */

export class RequestLoggerMiddleware {
  
  /**
   * Middleware básico de logging para desarrollo
   */
  static basic() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      
      next();
    };
  }

  /**
   * Middleware de logging detallado
   */
  static detailed() {
    return (req, res, next) => {
      const start = Date.now();
      const timestamp = new Date().toISOString();
      
      // Log de request entrante
      console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
      
      // Log de headers en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Headers:', req.headers);
        if (req.body && Object.keys(req.body).length > 0) {
          // No loggear contraseñas
          const bodyToLog = { ...req.body };
          if (bodyToLog.password) bodyToLog.password = '[HIDDEN]';
          console.log('Body:', bodyToLog);
        }
      }
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const finishTimestamp = new Date().toISOString();
        
        console.log(
          `[${finishTimestamp}] ${req.method} ${req.originalUrl} - ` +
          `${res.statusCode} - ${duration}ms`
        );
        
        // Log de errores 4xx y 5xx
        if (res.statusCode >= 400) {
          console.log(`Error response for ${req.method} ${req.originalUrl}`);
        }
      });
      
      next();
    };
  }

  /**
   * Middleware de logging para producción
   */
  static production() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        // Solo loggear errores y requests lentos en producción
        if (res.statusCode >= 400 || duration > 1000) {
          console.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              duration,
              ip: req.ip,
              userAgent: req.get('User-Agent')
            })
          );
        }
      });
      
      next();
    };
  }
}