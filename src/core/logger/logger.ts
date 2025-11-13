import pino from 'pino';
import { env } from '@/core/config/env';

const level = process.env.LOG_LEVEL || 'info';
const pretty = (process.env.LOG_PRETTY ?? (env.nodeEnv === 'development' ? 'true' : 'false')) === 'true';

let logger: pino.Logger;

if (pretty) {
  // Use pino transport with pino-pretty for development-friendly output
  logger = pino({ level }, pino.transport({ target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } }));
} else {
  // Structured JSON logs for production
  logger = pino({ level });
}

/**
 * Logger central export
 * Usage:
 * import logger from '@/core/logger/logger';
 * logger.info({ module: 'payments-service', message: 'Pago procesado' });
 *
 * Levels available: error, warn, info, debug
 */
export default logger;

/**
 * Helper para crear un child logger con campo `module` predefinido.
 */
export function childLogger(moduleName: string) {
  return logger.child({ module: moduleName });
}
