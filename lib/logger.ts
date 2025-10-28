/**
 * Structured Logger - PSW Voice Documentation System
 *
 * Production-grade logging with Pino
 * - JSON structured logs
 * - Multiple log levels
 * - Request ID tracking
 * - PHI/PII data masking
 * - Performance timing
 */

import pino from 'pino';

// Sensitive fields to redact from logs (HIPAA compliance)
const REDACT_FIELDS = [
  'password',
  'token',
  'api_key',
  'apiKey',
  'authorization',
  'cookie',
  'health_number',
  'healthNumber',
  'ssn',
  'date_of_birth',
  'dateOfBirth',
  'client_data',
  'clientData',
  '*.password',
  '*.token',
  '*.health_number',
  '*.ssn',
];

// Create logger instance
const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Redact sensitive PHI/PII data
  redact: {
    paths: REDACT_FIELDS,
    censor: '[REDACTED]',
  },

  // Base context
  base: {
    env: process.env.NEXT_PUBLIC_ENVIRONMENT || 'local',
    pid: process.pid,
  },

  // Timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Pretty print in development
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        // Omit sensitive headers
      },
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
  },
});

/**
 * Child logger with request context
 */
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

/**
 * Log API request with timing
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  requestId?: string
) {
  logger.info(
    {
      type: 'api_request',
      requestId,
      method,
      url,
      statusCode,
      duration,
    },
    `${method} ${url} ${statusCode} - ${duration}ms`
  );
}

/**
 * Log AI processing with metrics
 */
export function logAIProcessing(
  prompt: string,
  duration: number,
  tokensGenerated?: number,
  requestId?: string
) {
  logger.info(
    {
      type: 'ai_processing',
      requestId,
      promptLength: prompt.length,
      duration,
      tokensGenerated,
      tokensPerSecond: tokensGenerated
        ? (tokensGenerated / (duration / 1000)).toFixed(2)
        : null,
    },
    `AI processed in ${duration}ms (${tokensGenerated || 0} tokens)`
  );
}

/**
 * Log database query with timing
 */
export function logDatabaseQuery(
  query: string,
  duration: number,
  requestId?: string
) {
  logger.debug(
    {
      type: 'database_query',
      requestId,
      query: query.substring(0, 100), // Truncate long queries
      duration,
    },
    `DB query: ${duration}ms`
  );
}

/**
 * Log security event (audit log)
 */
export function logSecurityEvent(
  event: string,
  userId?: number,
  details?: Record<string, any>,
  requestId?: string
) {
  logger.warn(
    {
      type: 'security_event',
      requestId,
      event,
      userId,
      details,
    },
    `Security: ${event}`
  );
}

/**
 * Log error with stack trace
 */
export function logError(
  error: Error,
  context?: Record<string, any>,
  requestId?: string
) {
  logger.error(
    {
      type: 'error',
      requestId,
      err: error,
      context,
    },
    error.message
  );
}

// Export default logger and specific log functions
export default logger;
export const log = {
  trace: logger.trace.bind(logger),
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  fatal: logger.fatal.bind(logger),

  // Convenience methods
  request: logRequest,
  aiProcessing: logAIProcessing,
  dbQuery: logDatabaseQuery,
  securityEvent: logSecurityEvent,
  logError: logError,
};
