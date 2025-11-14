import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

/**
 * HTTP logger middleware
 * - Reutiliza X-Request-Id o genera uno nuevo
 * - Añade requestId a req
 * - Loggea método, ruta, status y tiempo de respuesta (ms)
 */
export default function httpLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  type ExtendedRequest = Request & { requestId?: string; userId?: number | null };
  const r = req as ExtendedRequest;

  const headerRequestId = r.header('X-Request-Id') || r.header('x-request-id');
  const requestId = typeof headerRequestId === 'string' && headerRequestId.trim() !== '' ? headerRequestId : uuidv4();
  r.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const ms = Math.round(diff[0] * 1000 + diff[1] / 1e6);
    logger.info({
      module: 'http',
      requestId: r.requestId,
      method: r.method,
      url: r.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: ms,
      userId: r.userId ?? undefined,
    }, `${r.method} ${r.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
}
