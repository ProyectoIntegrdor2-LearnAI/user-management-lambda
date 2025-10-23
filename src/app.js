/**
 * Main Application Entry Point - Hexagonal Architecture
 * Punto de entrada principal con Composition Root pattern
 */

import 'dotenv/config';
import { config, validateConfig } from './infrastructure/config/index.js';
import { DIContainer } from './infrastructure/DIContainer.js';
import { ExpressApplicationFactory } from './infrastructure/web/ExpressApplicationFactory.js';
import { buildCorsHeaders, normalizeOrigin } from './infrastructure/web/cors/corsConfig.js';
import pool from './infrastructure/database/connection.js';

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
    throw error;
  }
}

let cachedProxy;
let cachedServer;
let cachedServerlessExpress;

async function getServerlessProxy() {
  if (!cachedProxy) {
    const app = await initializeApplication();
    cachedServerlessExpress = (await import('aws-serverless-express')).default;
    cachedServer = cachedServerlessExpress.createServer(app);
    cachedProxy = (event, context) =>
      cachedServerlessExpress.proxy(cachedServer, event, context, 'PROMISE').promise;
  }

  return cachedProxy;
}

async function getDatabaseHealth() {
  const response = {
    service: 'learnia-user-management',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime())
  };

  const start = Date.now();

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      response.database = {
        status: 'ok',
        latencyMs: Date.now() - start
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    response.database = {
      status: 'error',
      code: error?.code,
      message: error?.message
    };
  }

  return response;
}

const CORS_HEADER_KEYS = new Set([
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-allow-credentials',
  'vary'
]);

const sanitizeHeaders = (headers = {}) => {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (!CORS_HEADER_KEYS.has(key?.toLowerCase?.() ?? key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const sanitizeMultiValueHeaders = (multiValueHeaders) => {
  if (!multiValueHeaders || typeof multiValueHeaders !== 'object') {
    return undefined;
  }

  const sanitizedEntries = Object.entries(multiValueHeaders).filter(([key]) => {
    return !CORS_HEADER_KEYS.has(key?.toLowerCase?.() ?? key);
  });

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return sanitizedEntries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

/**
 * Lambda Handler for AWS Lambda deployment
 */
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const requestOrigin = event?.headers?.origin || event?.headers?.Origin;
  const fallbackOrigin = normalizeOrigin(process.env.DEFAULT_ALLOW_ORIGIN);

  const resolveCorsHeaders = () => {
    return buildCorsHeaders(requestOrigin) || buildCorsHeaders(fallbackOrigin);
  };

  const mergeCorsHeaders = (baseHeaders = {}) => {
    const sanitizedHeaders = sanitizeHeaders(baseHeaders);
    const corsHeaders = resolveCorsHeaders();
    if (!corsHeaders) {
      return sanitizedHeaders;
    }

    return {
      ...sanitizedHeaders,
      ...corsHeaders
    };
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
        headers: mergeCorsHeaders(headers),
        body: ''
      };
    }

    if (normalizedPath === '/info') {
      return {
        statusCode: 200,
        headers: mergeCorsHeaders(headers),
        body: JSON.stringify({
          name: 'learnia-user-management',
          env: process.env.NODE_ENV || 'development',
          ts: new Date().toISOString()
        })
      };
    }
    
    if (normalizedPath === '/health') {
      const health = await getDatabaseHealth();
      const statusCode = health.database?.status === 'ok' ? 200 : 503;

      return {
        statusCode,
        headers: mergeCorsHeaders(headers),
        body: JSON.stringify(health)
      };
    }

    const proxy = await getServerlessProxy();
    const response = await proxy(event, context);

    response.headers = mergeCorsHeaders(response.headers || {});

    const sanitizedMultiValue = sanitizeMultiValueHeaders(response.multiValueHeaders);
    if (sanitizedMultiValue) {
      response.multiValueHeaders = sanitizedMultiValue;
    } else {
      delete response.multiValueHeaders;
    }

    return response;
    
  } catch (error) {
    console.error('Lambda execution error:', error);
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
    return {
      statusCode: 500,
      headers: mergeCorsHeaders(headers),
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};

/**
 * Export app for testing purposes
 */
export const createApp = initializeApplication;

/**
 * Start server if this module is executed directly
 * ✅ Refactor: Using Top-Level Await (SonarQube compliant)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
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

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start local server:', error);
    process.exit(1);
  }
}