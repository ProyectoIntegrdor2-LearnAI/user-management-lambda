/**
 * Learning Path Routes - Infrastructure Layer
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';

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

  // Public endpoint: GET /learning-paths/public/list (list user's paths with optional auth)
  router.get(
    '/public/list',
    (req, res, next) => {
      // Try to extract and decode JWT from Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          // Set user from decoded JWT
          req.user = {
            user_id: decoded.user_id || decoded.sub || decoded.id,
            email: decoded.email,
            ...decoded
          };
        } catch (err) {
          console.log('Token verification failed:', err.message);
          // If token is invalid, just continue without user
          // This allows public access (though it will fail in the controller if no user_id)
        }
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
