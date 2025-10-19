/**
 * Learning Path Routes - Infrastructure Layer
 */

import { Router } from 'express';

export function createLearningPathRoutes({
  learningPathWebController,
  authenticationMiddleware,
}) {
  const router = Router();

  // Public endpoint: GET /learning-paths (list user's paths)
  router.get(
    '/',
    authenticationMiddleware.requireAuth(),
    learningPathWebController.listHandler(),
  );

  // Public endpoint: GET /learning-paths/public/list (list user's paths without strong auth)
  router.get(
    '/public/list',
    (req, res, next) => {
      // Extract user from JWT if present, otherwise use from query
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        req.token = authHeader.substring(7);
      }
      next();
    },
    learningPathWebController.listHandler(),
  );

  router.get(
    '/:pathId',
    authenticationMiddleware.requireAuth(),
    learningPathWebController.getOneHandler(),
  );

  router.patch(
    '/:pathId/courses/:courseId',
    authenticationMiddleware.requireAuth(),
    learningPathWebController.updateCourseHandler(),
  );

  return router;
}
