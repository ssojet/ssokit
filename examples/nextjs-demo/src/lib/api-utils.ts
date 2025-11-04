import { Logger } from '@/lib/logger';

// Legacy functions for backward compatibility with older logging code
export function debugLog(message: string, data?: any) {
  Logger.debug('API', message, data);
}

export function debugError(message: string, error: any) {
  Logger.debug('API ERROR', message, error);
}