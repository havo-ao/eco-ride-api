import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userId?: number | null;
      logger?: Logger;
    }
  }
}

export {};
