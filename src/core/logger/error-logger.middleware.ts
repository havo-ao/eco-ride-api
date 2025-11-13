import { NextFunction, Request, Response } from 'express';
import logger from './logger';

function isError(e: unknown): e is Error {
  return e instanceof Error || (typeof e === 'object' && e !== null && 'message' in (e as any));
}

export default function errorLogger(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  type ExtendedRequest = Request & { requestId?: string; userId?: number | null };
  const r = req as ExtendedRequest;

  const message = isError(err) ? err.message : String(err);
  const stack = isError(err) ? err.stack : undefined;

  logger.error({
    module: 'error-handler',
    message,
    stack,
    requestId: r.requestId,
    method: r.method,
    url: r.originalUrl,
    userId: r.userId ?? undefined,
  }, 'Unhandled exception');

  res.status(500).json({ success: false, code: 500, message: 'Internal server error' });
}
