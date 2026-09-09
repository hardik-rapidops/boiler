import fs from 'node:fs';
import path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'STEP' | 'API' | 'SYSTEM';

export type LogContext = {
  testName?: string;
  testId?: string;
  role?: string;
  module?: string;
};

export type LogMetadata = Record<string, unknown>;

const logsDir = path.resolve(process.cwd(), 'logs');
const testLogsDir = path.join(logsDir, 'tests');
const logFiles = ['system.log', 'test.log', 'error.log', 'api.log'];
const contextStore = new AsyncLocalStorage<LogContext>();
const sensitiveKeys = [
  /password/i,
  /token/i,
  /authorization/i,
  /secret/i,
  /api[-_]?key/i,
  /^key$/i,
  /uniqueKey/i,
  /userId/i,
  /^id$/i,
  /cookie/i,
  /session/i,
  /credential/i
];

class Logger {
  private fallbackContext: LogContext = {};
  private testStartedAt?: number;

  withContext<T>(context: LogContext, callback: () => Promise<T>): Promise<T> {
    return contextStore.run({ ...this.context(), ...context }, callback);
  }

  setContext(context: LogContext): void {
    this.fallbackContext = { ...this.fallbackContext, ...context };
    contextStore.enterWith({ ...this.context(), ...context });
  }

  startTest(testName: string, testId: string, metadata?: LogMetadata): void {
    this.fallbackContext = { testName, testId };
    this.testStartedAt = Date.now();
    fs.mkdirSync(testLogsDir, { recursive: true });
    const header = [
      '',
      '='.repeat(100),
      `TEST: ${testName}`,
      `STARTED: ${this.timestamp()}`,
      metadata ? `CONTEXT: ${this.stringifyMetadata(metadata)}` : undefined,
      '-'.repeat(100)
    ].filter(Boolean).join('\n');
    fs.appendFileSync(path.join(logsDir, 'test.log'), `${header}\n`);
    fs.writeFileSync(this.currentTestLogFile(), `${header}\n`);
  }

  finishTest(status: string, expectedStatus: string): void {
    const durationMs = this.testStartedAt ? Date.now() - this.testStartedAt : 0;
    const footer = [
      '-'.repeat(100),
      `RESULT: ${status.toUpperCase()} | EXPECTED: ${expectedStatus.toUpperCase()} | DURATION: ${this.duration(durationMs)}`,
      `FINISHED: ${this.timestamp()}`,
      '='.repeat(100),
      ''
    ].join('\n');
    fs.appendFileSync(path.join(logsDir, 'test.log'), `${footer}\n`);
    fs.appendFileSync(this.currentTestLogFile(), `${footer}\n`);
    this.fallbackContext = {};
    this.testStartedAt = undefined;
  }

  info(message: string, metadata?: LogMetadata): void {
    this.write('INFO', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.write('WARN', message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.write('ERROR', message, metadata);
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.write('DEBUG', message, metadata);
  }

  step(message: string, metadata?: LogMetadata): void {
    this.write('STEP', message, metadata);
  }

  api(message: string, metadata?: LogMetadata): void {
    this.write('API', message, metadata);
  }

  system(message: string, metadata?: LogMetadata): void {
    this.write('SYSTEM', message, metadata);
  }

  private context(): LogContext {
    return { ...this.fallbackContext, ...(contextStore.getStore() ?? {}) };
  }

  private write(level: LogLevel, message: string, metadata?: LogMetadata): void {
    fs.mkdirSync(logsDir, { recursive: true });

    const line = this.format(level, message, metadata);
    fs.appendFileSync(this.logFileFor(level), `${line}\n`);

    if (level === 'ERROR') {
      fs.appendFileSync(path.join(logsDir, 'test.log'), `${line}\n`);
    }

    if (this.context().testName) {
      fs.mkdirSync(testLogsDir, { recursive: true });
      fs.appendFileSync(this.currentTestLogFile(), `${this.formatPerTest(level, message, metadata)}\n`);
    }

    if (['INFO', 'WARN', 'ERROR', 'STEP', 'SYSTEM'].includes(level)) {
      // Keep console useful without dumping every DEBUG/API detail.
      console.log(line);
    }
  }

  private format(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const context = this.context();
    const segments = [
      `[${this.timestamp()}]`,
      `[${level}]`,
      context.module ? `[${context.module}]` : undefined,
      context.testName ? `[${context.testName}]` : undefined,
      context.role ? `[${context.role}]` : undefined,
      this.sanitizeString(message)
    ].filter(Boolean);

    const sanitizedMetadata = metadata ? this.stringifyMetadata(metadata) : '';
    return sanitizedMetadata ? `${segments.join(' ')} ${sanitizedMetadata}` : segments.join(' ');
  }

  private logFileFor(level: LogLevel): string {
    if (level === 'ERROR') {
      return path.join(logsDir, 'error.log');
    }

    if (level === 'API') {
      return path.join(logsDir, 'api.log');
    }

    if (level === 'SYSTEM') {
      return path.join(logsDir, 'system.log');
    }

    return path.join(logsDir, 'test.log');
  }

  private stringifyMetadata(metadata: LogMetadata): string {
    try {
      return JSON.stringify(this.sanitize(metadata));
    } catch {
      return '[metadata could not be serialized]';
    }
  }

  private formatPerTest(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const context = this.context();
    const time = this.timestamp().split(' ')[1];
    const details = [
      context.module ? `[${context.module}]` : undefined,
      context.role ? `[${context.role}]` : undefined,
      this.sanitizeString(message)
    ].filter(Boolean).join(' ');
    const sanitizedMetadata = metadata ? this.stringifyMetadata(metadata) : '';
    return `  ${time} | ${level.padEnd(6)} | ${details}${sanitizedMetadata ? ` | ${sanitizedMetadata}` : ''}`;
  }

  private currentTestLogFile(): string {
    const context = this.context();
    const identity = `${context.testName ?? 'unknown-test'}-${context.testId ?? 'unknown-id'}`;
    const safeName = identity.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
    return path.join(testLogsDir, `${safeName}.log`);
  }

  private duration(durationMs: number): string {
    if (durationMs < 1_000) return `${durationMs} ms`;
    const seconds = durationMs / 1_000;
    return seconds < 60 ? `${seconds.toFixed(1)} s` : `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, item]) => {
      acc[key] = sensitiveKeys.some((pattern) => pattern.test(key)) ? '[REDACTED]' : this.sanitize(item);
      return acc;
    }, {});
  }

  private sanitizeString(value: string): string {
    return value
      .replace(/(\/api\/users\/)[^/?\s"']+/gi, '$1[REDACTED]')
      .replace(/(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;"']+/gi, '$1[REDACTED]')
      .replace(/([?&](?:access_token|token)=)[^&\s]+/gi, '$1[REDACTED]')
      .replace(/("(?:id|token|accessToken|uniqueKey|password)"\s*:\s*")[^"]+/gi, '$1[REDACTED]');
  }

  private timestamp(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate())
    ].join('-') + ` ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
}

export const logger = new Logger();

export function clearLogs(): void {
  fs.mkdirSync(logsDir, { recursive: true });
  fs.rmSync(testLogsDir, { recursive: true, force: true });
  fs.mkdirSync(testLogsDir, { recursive: true });
  for (const logFile of logFiles) {
    fs.writeFileSync(path.join(logsDir, logFile), '');
  }
}
