/**
 * CORS configuration helpers shared across Lambda handler and Express app
 */

const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'X-Amz-Date',
  'X-Amz-Security-Token',
  'X-Amz-User-Agent'
];

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw.trim() === '') {
    return ['*'];
  }

  return raw
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

const ALLOWED_ORIGINS = parseAllowedOrigins();
const ALLOW_ALL = ALLOWED_ORIGINS.includes('*');

function isOriginAllowed(origin) {
  if (!origin) {
    return true; // Requests without origin header (e.g., curl) are allowed
  }

  if (ALLOW_ALL) {
    return true;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

export function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: DEFAULT_ALLOWED_METHODS,
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    optionsSuccessStatus: 204
  };
}

export function buildCorsHeaders(origin) {
  if (!isOriginAllowed(origin)) {
    return null;
  }

  let allowOriginHeader = '*';
  if (origin) {
    allowOriginHeader = ALLOW_ALL ? origin : origin;
  } else if (!ALLOW_ALL && ALLOWED_ORIGINS.length > 0) {
    allowOriginHeader = ALLOWED_ORIGINS[0];
  }

  const headers = {
    'Access-Control-Allow-Origin': allowOriginHeader,
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS.join(','),
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS.join(','),
    'Access-Control-Allow-Credentials': 'true'
  };

  if (allowOriginHeader !== '*') {
    headers.Vary = 'Origin';
  }

  return headers;
}

export function getAllowedOrigins() {
  return [...ALLOWED_ORIGINS];
}
