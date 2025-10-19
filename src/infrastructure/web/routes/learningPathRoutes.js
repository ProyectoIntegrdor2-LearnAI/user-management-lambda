/**
 * Learning Path Routes - Infrastructure Layer
 */

import { Router } from 'express';

export function createLearningPathRoutes({
  learningPathWebController,
  authenticationMiddleware,
}) {
  const router = Router();

  router.use(authenticationMiddleware.requireAuth());

  router.get(
    '/',
    learningPathWebController.listHandler(),
  );

  router.get(
    '/:pathId',
    learningPathWebController.getOneHandler(),
  );

  router.patch(
    '/:pathId/courses/:courseId',
    learningPathWebController.updateCourseHandler(),
  );

  return router;
}
