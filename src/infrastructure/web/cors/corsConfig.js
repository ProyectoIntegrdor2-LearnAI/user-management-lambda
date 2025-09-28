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

function normalizeOrigin(origin) {
  if (!origin) {
    return '';
  }

  const trimmed = origin.trim();
  if (trimmed === '' || trimmed === '*') {
    return trimmed;
  }

  const sanitized = trimmed.replace(/\s+/g, '');
  const ensuredScheme = /^https?:\/\//i.test(sanitized)
    ? sanitized
    : `https://${sanitized.replace(/^\/*/, '')}`;

  try {
    const url = new URL(ensuredScheme);
    const protocol = url.protocol.toLowerCase();
    const hostname = url.hostname.toLowerCase();
    const port = url.port ? `:${url.port}` : '';
    return `${protocol}//${hostname}${port}`;
  } catch (error) {
    return ensuredScheme.replace(/\/*$/, '').toLowerCase();
  }
}

function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw.trim() === '') {
    return ['*'];
  }

  return raw
    .split(',')
    .map(origin => normalizeOrigin(origin))
    .filter(Boolean);
}

const ALLOWED_ORIGINS = parseAllowedOrigins();
const ALLOW_ALL = ALLOWED_ORIGINS.includes('*');

function isOriginAllowed(origin) {
  if (!origin) {
    return true; // Requests without origin header (e.g., curl) are allowed
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  if (ALLOW_ALL) {
    return true;
  }

  return ALLOWED_ORIGINS.includes(normalizedOrigin);
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
  let normalizedOrigin = origin ? normalizeOrigin(origin) : '';

  if (normalizedOrigin && !isOriginAllowed(normalizedOrigin)) {
    return null;
  }

  if (!normalizedOrigin && !ALLOW_ALL && ALLOWED_ORIGINS.length > 0) {
    normalizedOrigin = ALLOWED_ORIGINS[0];
  }

  let allowOriginHeader = '*';
  if (normalizedOrigin) {
    allowOriginHeader = normalizedOrigin;
  } else if (!ALLOW_ALL && ALLOWED_ORIGINS.length > 0) {
    allowOriginHeader = ALLOWED_ORIGINS[0];
  }

  const allowCredentials = allowOriginHeader === '*' ? 'false' : 'true';

  const headers = {
    'Access-Control-Allow-Origin': allowOriginHeader,
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS.join(','),
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS.join(','),
    'Access-Control-Allow-Credentials': allowCredentials
  };

  if (allowOriginHeader !== '*') {
    headers.Vary = 'Origin';
  }

  return headers;
}

export function getAllowedOrigins() {
  return [...ALLOWED_ORIGINS];
}

export { normalizeOrigin };
