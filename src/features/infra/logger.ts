/**
 * @fileoverview Structured logger for CryptoPanel server and client utilities.
 * - Outputs JSON logs compatible with Vercel Log Drains.
 * - Keeps schema aligned with docs/operations/MONITORING.md guidance.
 */
export type LogLevel = 'info' | 'warn' | 'error';

export type LogError = Readonly<{
  message: string;
  code: string;
  stack?: string;
}>;

export type LogContext = Readonly<Record<string, unknown>>;

export type LogEntry = Readonly<{
  level: LogLevel;
  timestamp: string;
  requestId?: string;
  endpoint?: string;
  message: string;
  duration?: number;
  statusCode?: number;
  error?: LogError;
  context?: LogContext;
}>;

export const log = (entry: LogEntry) => {
  console.log(JSON.stringify(entry));
};
