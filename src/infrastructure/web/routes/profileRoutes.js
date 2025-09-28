/**
 * Profile Routes - Infrastructure Layer
 * Rutas HTTP para gestión de perfiles de usuario
 */

import { Router } from 'express';

export function createProfileRoutes({
  profileWebController,
  authenticationMiddleware,
  validationMiddleware
}) {
  const router = Router();

  // Todas las rutas de perfil requieren autenticación
  router.use(authenticationMiddleware.requireAuth());

  // Obtener perfil autenticado
  router.get('/me',
    profileWebController.getProfileHandler()
  );

  // Obtener perfil de usuario
  router.get('/:id',
    profileWebController.getProfileHandler()
  );

  // Actualizar perfil de usuario
  router.put('/me/profile',
    validationMiddleware.validateProfileUpdate(),
    profileWebController.getUpdateProfileHandler()
  );

  router.put('/:id/profile',
    validationMiddleware.validateProfileUpdate(),
    profileWebController.getUpdateProfileHandler()
  );

  // Dashboard del usuario
  router.get('/me/dashboard',
    profileWebController.getDashboardHandler()
  );

  router.get('/:id/dashboard',
    profileWebController.getDashboardHandler()
  );

  return router;
}
