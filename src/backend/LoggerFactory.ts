/**
 * T018: LoggerFactory with Winston backend in packages/core/src/logging/LoggerFactory.ts
 *
 * Central factory for creating and managing Winston-based loggers across CVPlus platform
 * Implements singleton pattern for logger instances per service
 */

import winston from 'winston';
import { LogLevel, LoggerConfig, Logger as ILogger } from './types';
import { CorrelationService } from './CorrelationService';
import { PiiRedaction } from './PiiRedaction';
import { LogFormatter } from './LogFormatter';

/**
 * Logger wrapper that implements our Logger interface
 */
class CVPlusLogger implements ILogger {
  private winstonLogger: winston.Logger;
  private serviceName: string;
  private contextData: Record<string, unknown> = {};

  constructor(winstonLogger: winston.Logger, serviceName: string) {
    this.winstonLogger = winstonLogger;
    this.serviceName = serviceName;
  }

  debug(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context: Record<string, unknown> = {}, error?: Error): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : context;

    this.log(LogLevel.ERROR, message, errorContext);
  }

  fatal(message: string, context: Record<string, unknown> = {}, error?: Error): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : context;

    this.log(LogLevel.FATAL, message, errorContext);
  }

  security(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.WARN, message, { ...context, domain: 'security' });
  }

  performance(message: string, metrics?: any, context: Record<string, unknown> = {}): void {
    const perfContext = metrics ? { ...context, performance: metrics } : context;
    this.log(LogLevel.INFO, message, { ...perfContext, domain: 'performance' });
  }

  audit(action: string, resource: string, outcome: 'success' | 'failure', context: Record<string, unknown> = {}): void {
    const auditContext = {
      ...context,
      action,
      resource,
      outcome,
      domain: 'audit'
    };
    this.log(LogLevel.INFO, `Audit: ${action} on ${resource}`, auditContext);
  }

  async withCorrelationId(correlationId: string, callback: () => void | Promise<void>): Promise<void> {
    return CorrelationService.withCorrelationId(correlationId, callback);
  }

  setContext(context: Record<string, unknown>): void {
    this.contextData = { ...this.contextData, ...context };
  }

  clearContext(): void {
    this.contextData = {};
  }

  private log(level: LogLevel, message: string, context: Record<string, unknown> = {}): void {
    const correlationId = CorrelationService.getCurrentId() || CorrelationService.generateId();

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      domain: context.domain || 'system',
      package: this.serviceName,
      context: { ...this.contextData, ...context }
    };

    // Apply PII redaction if enabled
    const redactedEntry = PiiRedaction.isEnabled() ? PiiRedaction.redactLogEntry(logEntry) : logEntry;

    // Log through Winston with formatted entry
    this.winstonLogger.log(level, redactedEntry.message, redactedEntry);
  }
}

/**
 * Factory class for creating and managing logger instances
 */
export class LoggerFactory {
  private static loggers: Map<string, CVPlusLogger> = new Map();
  private static defaultConfig: LoggerConfig = {
    level: LogLevel.INFO,
    environment: process.env.NODE_ENV || 'development',
    enableConsole: true,
    enableFile: true,
    enableFirebase: false,
    enablePiiRedaction: true
  };

  /**
   * Create or retrieve a logger for a specific service
   */
  static createLogger(serviceName: string, config: LoggerConfig = {}): CVPlusLogger {
    if (this.loggers.has(serviceName)) {
      return this.loggers.get(serviceName)!;
    }

    const mergedConfig = { ...this.defaultConfig, ...config };
    const winstonLogger = this.createWinstonLogger(serviceName, mergedConfig);
    const logger = new CVPlusLogger(winstonLogger, serviceName);

    this.loggers.set(serviceName, logger);
    return logger;
  }

  /**
   * Get an existing logger by service name
   */
  static getLogger(serviceName: string): CVPlusLogger {
    const logger = this.loggers.get(serviceName);
    if (!logger) {
      throw new Error(`Logger not found for service: ${serviceName}`);
    }
    return logger;
  }

  /**
   * Get all created loggers
   */
  static getAllLoggers(): Record<string, CVPlusLogger> {
    const result: Record<string, CVPlusLogger> = {};
    this.loggers.forEach((logger, serviceName) => {
      result[serviceName] = logger;
    });
    return result;
  }

  /**
   * Update log level for a specific logger
   */
  static updateLogLevel(serviceNameOrLevel: string | LogLevel, level?: LogLevel): void {
    if (typeof serviceNameOrLevel === 'string' && level) {
      // Update specific logger
      const logger = this.loggers.get(serviceNameOrLevel);
      if (logger) {
        (logger as any).winstonLogger.level = level;
      }
    } else if (typeof serviceNameOrLevel === 'string' && !level) {
      // Update all loggers
      const newLevel = serviceNameOrLevel as LogLevel;
      this.loggers.forEach((logger) => {
        (logger as any).winstonLogger.level = newLevel;
      });
    }
  }

  /**
   * Clear all loggers (primarily for testing)
   */
  static reset(): void {
    this.loggers.clear();
  }

  /**
   * Create Winston logger with appropriate transports
   */
  private static createWinstonLogger(serviceName: string, config: LoggerConfig): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    if (config.enableConsole) {
      transports.push(new winston.transports.Console({
        level: config.level,
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.timestamp(),
          winston.format.printf((info) => {
            return LogFormatter.formatForConsole(info as any);
          })
        )
      }));
    }

    // File transport
    if (config.enableFile) {
      transports.push(new winston.transports.File({
        level: config.level,
        filename: config.filePath || `logs/${serviceName}.log`,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf((info) => {
            return LogFormatter.formatForFile(info as any);
          })
        )
      }));
    }

    return winston.createLogger({
      level: config.level,
      defaultMeta: {
        service: serviceName,
        environment: config.environment
      },
      transports,
      exitOnError: false
    });
  }
}