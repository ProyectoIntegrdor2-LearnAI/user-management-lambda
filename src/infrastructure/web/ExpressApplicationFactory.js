/**
 * Express Application Factory - Infrastructure Layer
 * Factory para configurar la aplicación Express con arquitectura hexagonal
 */

import express from 'express';
import cors from 'cors';
import { createAuthRoutes, createUserRoutes } from './routes/index.js';

export class ExpressApplicationFactory {
  constructor(diContainer) {
    this.diContainer = diContainer;
  }

  create() {
    const app = express();

    // Configure basic middleware
    this._configureBasicMiddleware(app);
    
    // Configure health and info endpoints
    this._configureSystemEndpoints(app);
    
    // Configure API routes
    this._configureApiRoutes(app);
    
    // Configure error handling
    this._configureErrorHandling(app);

    return app;
  }

  _configureBasicMiddleware(app) {
    // CORS configuration
    app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));

    // JSON parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (process.env.NODE_ENV !== 'production') {
      const requestLoggerMiddleware = this.diContainer.get('requestLoggerMiddleware');
      app.use(requestLoggerMiddleware.detailed());
    }
  }

  _configureSystemEndpoints(app) {
    // Health check endpoint
    app.get('/health', async (req, res) => {
      const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };

      try {
        // Check database connection
  const dbPool = this.diContainer.get('dbPool');
  await dbPool.query('SELECT 1');
        healthcheck.database = 'connected';
      } catch (error) {
        healthcheck.database = 'disconnected';
        healthcheck.message = 'Degraded';
      }

      const statusCode = healthcheck.message === 'OK' ? 200 : 503;
      res.status(statusCode).json(healthcheck);
    });

    // API info endpoint
    app.get('/info', (req, res) => {
      res.json({
        service: 'LearnIA User Management API (Hexagonal)',
        version: '2.0.0',
        architecture: 'Hexagonal (Ports & Adapters)',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          auth: [
            'POST /auth/register',
            'POST /auth/login', 
            'POST /auth/logout'
          ],
          users: [
            'GET /users/:id',
            'PUT /users/:id/profile',
            'GET /users/:id/dashboard'
          ]
        }
      });
    });
  }

  _configureApiRoutes(app) {
    // Get dependencies from container
    const authWebController = this.diContainer.get('authWebController');
    const profileWebController = this.diContainer.get('profileWebController');
    const authenticationMiddleware = this.diContainer.get('authenticationMiddleware');
    const validationMiddleware = this.diContainer.get('validationMiddleware');

    // Create routes with dependencies
    const authRoutes = createAuthRoutes({
      authWebController,
      authenticationMiddleware,
      validationMiddleware
    });

    const userRoutes = createUserRoutes({
      profileWebController,
      authenticationMiddleware,
      validationMiddleware
    });

    // Mount routes
    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    
    // Mount routes with API prefix
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
  }

  _configureErrorHandling(app) {
    const errorHandlerMiddleware = this.diContainer.get('errorHandlerMiddleware');
    
    // 404 handler
    app.use(errorHandlerMiddleware.notFound());
    
    // Error handler
    app.use(errorHandlerMiddleware.handle());
  }
}