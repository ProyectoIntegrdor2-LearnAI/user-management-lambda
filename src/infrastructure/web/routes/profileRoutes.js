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

  // Obtener perfil de usuario
  router.get('/:id',
    profileWebController.getProfileHandler()
  );

  // Actualizar perfil de usuario
  router.put('/:id/profile',
    validationMiddleware.validateProfileUpdate(),
    profileWebController.getUpdateProfileHandler()
  );

  // Dashboard del usuario
  router.get('/:id/dashboard',
    profileWebController.getDashboardHandler()
  );

  return router;
}