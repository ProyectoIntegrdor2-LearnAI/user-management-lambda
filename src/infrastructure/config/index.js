/**
 * Application Configuration - Infrastructure Layer
 * Configuración centralizada de la aplicación
 */

export const config = {
  // Server Configuration
  server: {
    port: Number.parseInt(process.env.PORT) || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'user_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: Number.parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
    idleTimeoutMillis: Number.parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: Number.parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'HS256'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};

/**
 * Validates required environment variables
 */
export function validateConfig() {
  const requiredDbEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const missingDbVars = requiredDbEnvVars.filter(varName => !process.env[varName]);

  if (!hasDatabaseUrl && missingDbVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingDbVars.join(', ')} ` +
      '(or set DATABASE_URL).'
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  console.log('✅ Configuration validation passed');
}
