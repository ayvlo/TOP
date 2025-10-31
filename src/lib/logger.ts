import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

export function logEvent(event: string, meta?: any) {
  logger.info({ event, ...meta }, event);
}

export function logError(error: Error | string, meta?: any) {
  if (typeof error === 'string') {
    logger.error({ message: error, ...meta });
  } else {
    logger.error({ err: error, ...meta }, error.message);
  }
}

export function logAudit(action: string, data: any) {
  logger.info({ audit: true, action, ...data }, `Audit: ${action}`);
}
