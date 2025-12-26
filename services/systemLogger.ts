
import { LogLevel, LogEntry } from '../types';
import { StorageService } from './storageService';

export class SystemLogger {
  private static instance: SystemLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 500;

  private constructor() {}

  static getInstance(): SystemLogger {
    if (!SystemLogger.instance) {
      SystemLogger.instance = new SystemLogger();
    }
    return SystemLogger.instance;
  }

  private addLog(level: LogLevel, module: string, message: string, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module,
      message,
      stack: error?.stack,
      context
    };

    this.logs.unshift(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Bridge to standard storage audit log
    const auditLevel = level === LogLevel.ERROR ? 'ERROR' : 
                       level === LogLevel.WARN ? 'WARN' : 'INFO';
                       
    StorageService.logEvent(auditLevel as any, module, message, context);

    // Console output for dev context
    const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                         level === LogLevel.WARN ? 'warn' : 'log';
    console[consoleMethod](`[${module}] ${message}`, context || '');
  }

  error(module: string, message: string, error?: Error, context?: Record<string, any>) {
    this.addLog(LogLevel.ERROR, module, message, error, context);
  }

  warn(module: string, message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.WARN, module, message, undefined, context);
  }

  info(module: string, message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.INFO, module, message, undefined, context);
  }

  debug(module: string, message: string, context?: Record<string, any>) {
    this.addLog(LogLevel.DEBUG, module, message, undefined, context);
  }

  getLogs(filter?: { level?: LogLevel; module?: string; since?: number }): LogEntry[] {
    let filtered = this.logs;

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.module) {
      filtered = filtered.filter(log => log.module.toLowerCase().includes(filter.module!.toLowerCase()));
    }

    if (filter?.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }

    return filtered;
  }

  getStats24h() {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const logs24h = this.getLogs({ since });
    
    return {
      errors: logs24h.filter(l => l.level === LogLevel.ERROR).length,
      warnings: logs24h.filter(l => l.level === LogLevel.WARN).length,
      info: logs24h.filter(l => l.level === LogLevel.INFO).length
    };
  }

  exportLogs(): string {
    return this.logs.map(log => {
      const time = new Date(log.timestamp).toISOString();
      const context = log.context ? `\nContext: ${JSON.stringify(log.context)}` : '';
      const stack = log.stack ? `\nStack: ${log.stack}` : '';
      return `[${time}] ${log.level} | ${log.module} | ${log.message}${context}${stack}`;
    }).join('\n\n');
  }

  clear() {
    this.logs = [];
    this.info('System', 'Logs cleared');
  }
}

export const logger = SystemLogger.getInstance();
