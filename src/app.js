/**
 * Main Application Entry Point - Hexagonal Architecture
 * Punto de entrada principal con Composition Root pattern
 */

import 'dotenv/config';
import { config, validateConfig } from './infrastructure/config/index.js';
import { DIContainer } from './infrastructure/DIContainer.js';
import { ExpressApplicationFactory } from './infrastructure/web/ExpressApplicationFactory.js';

// Global DI Container instance
let diContainer;

/**
 * Initialize application with dependency injection
 */
async function initializeApplication() {
  try {
    console.log('🚀 Initializing LearnIA User Management API (Hexagonal Architecture)');
    
    // Validate configuration
    validateConfig();
    
    // Initialize DI Container
    diContainer = new DIContainer();
    await diContainer.initialize();
    
    // Create Express application
    const applicationFactory = new ExpressApplicationFactory(diContainer);
    const app = applicationFactory.create();
    
    console.log('✅ Application initialized successfully');
    return app;
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

/**
 * Lambda Handler for AWS Lambda deployment
 */
export const lambdaHandler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  try {
    console.log('Lambda Event:', JSON.stringify(event, null, 2));

    const path = event?.rawPath || event?.path || '/';
    let normalizedPath = path || '/';
    if (normalizedPath.length > 1) {
      normalizedPath = normalizedPath.replace(/\/+$/, '');
    }
    if (normalizedPath === '') {
      normalizedPath = '/';
    }

    if (event?.requestContext?.http?.method === 'OPTIONS' || event?.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers,
        body: ''
      };
    }

    if (normalizedPath === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true })
      };
    }

    if (normalizedPath === '/info') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          name: 'learnia-user-management',
          env: process.env.NODE_ENV || 'development',
          ts: new Date().toISOString()
        })
      };
    }
    
    // Initialize app if not already initialized
    if (!diContainer) {
      const app = await initializeApplication();
      
      // Use serverless-express for Lambda
      const serverlessExpress = (await import('aws-serverless-express')).default;
      if (!globalThis.__server) {
        globalThis.__server = serverlessExpress.createServer(app);
      }

      return serverlessExpress
        .proxy(globalThis.__server, event, context, 'PROMISE')
        .promise;
    }
    
    // Handle subsequent requests...
    const serverlessExpress = (await import('aws-serverless-express')).default;
    if (!globalThis.__server) {
      const applicationFactory = new ExpressApplicationFactory(diContainer);
      const app = applicationFactory.create();
      globalThis.__server = serverlessExpress.createServer(app);
    }

    return serverlessExpress
      .proxy(globalThis.__server, event, context, 'PROMISE')
      .promise;
    
  } catch (error) {
    console.error('Lambda execution error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};

/**
 * Local Development Server
 */
async function startLocalServer() {
  try {
    const app = await initializeApplication();
    const PORT = config.server.port;
    
    const server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 LearnIA User Management API (Hexagonal)');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📖 Info: http://localhost:${PORT}/info`);
      console.log('🏗️  Architecture: Hexagonal (Ports & Adapters)');
      console.log(`🌍 Environment: ${config.server.environment}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('📡 HTTP server closed');
        
        if (diContainer) {
          await diContainer.cleanup();
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
    
  } catch (error) {
    console.error('❌ Failed to start local server:', error);
    process.exit(1);
  }
}

/**
 * Export app for testing purposes
 */
export const createApp = initializeApplication;

/**
 * Start server if this module is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  startLocalServer();
}