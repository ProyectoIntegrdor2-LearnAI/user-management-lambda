/**
 * Auth Routes - Infrastructure Layer
 * Rutas HTTP para autenticación de usuarios
 */

import { Router } from 'express';

export function createAuthRoutes({
  authWebController,
  authenticationMiddleware,
  validationMiddleware
}) {
  const router = Router();

  // Registro de usuario
  router.post('/register',
    validationMiddleware.validateRegistration(),
    authWebController.getRegisterHandler()
  );

  // Login
  router.post('/login',
    validationMiddleware.validateLogin(),
    authWebController.getLoginHandler()
  );

  // Logout (requiere autenticación)
  router.post('/logout',
    authenticationMiddleware.requireAuth(),
    authWebController.getLogoutHandler()
  );

  return router;
}