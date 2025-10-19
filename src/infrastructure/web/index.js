/**
 * Web Layer Index - Infrastructure Layer
 * Exportaciones principales de la capa web
 */

export { AuthWebController } from './controllers/AuthWebController.js';
export { ProfileWebController } from './controllers/ProfileWebController.js';
export { LearningPathWebController } from './controllers/LearningPathWebController.js';

export { 
  AuthenticationMiddleware,
  ValidationMiddleware, 
  ErrorHandlerMiddleware,
  RequestLoggerMiddleware
} from './middleware/index.js';

export {
  createAuthRoutes,
  createProfileRoutes,
  createUserRoutes,
  createLearningPathRoutes
} from './routes/index.js';

export { WebControllersFactory } from './WebControllersFactory.js';
export { ExpressApplicationFactory } from './ExpressApplicationFactory.js';
