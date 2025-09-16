/**
 * T021: Base logger implementation with Winston integration
 * CVPlus Logging System - Core Logger Implementation
  */

import winston, { Logger as WinstonLogger } from 'winston';
import {
  ILogger,
  LogEntry,
  LogLevel,
  LogDomain,
  LoggerConfig,
  UserContext,
  PerformanceInfo,
  ErrorInfo,
  DEFAULT_LOGGER_CONFIG
} from '../types/index';
import { correlationManager, getCurrentCorrelationId, generateCorrelationId } from '../utils/correlation';
import { defaultFormatter } from '../utils/formatters';

export class BaseLogger implements ILogger {
  protected winston: WinstonLogger;
  protected config: Required<LoggerConfig>;
  protected userContext: UserContext = {};
  protected contextOverrides: Record<string, any> = {};
  protected logEntries: LogEntry[] = [];
  private maxLogEntries: number = 1000;

  constructor(serviceName: string, config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config, service: serviceName };
    this.winston = this.createWinstonLogger();
  }

  /**
   * Create and configure Winston logger
    */
  private createWinstonLogger(): WinstonLogger {
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.enableConsole) {
      transports.push(new winston.transports.Console({
        level: this.config.level,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const correlationId = getCurrentCorrelationId();
            const corrStr = correlationId ? `[${correlationId.slice(0, 8)}]` : '';
            return `${timestamp} ${level} [${this.config.service}]${corrStr} ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`;
          })
        )
      }));
    }

    // File transport
    if (this.config.enableFile) {
      transports.push(new winston.transports.File({
        filename: this.config.filePath,
        level: this.config.level,
        maxsize: this.config.maxFileSize,
        maxFiles: this.config.maxFiles,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }));
    }

    return winston.createLogger({
      level: this.config.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      defaultMeta: {
        service: this.config.service,
        environment: this.config.environment,
        ...this.getContextualMetadata()
      }
    });
  }

  /**
   * Generate unique log ID
    */
  private generateLogId(): string {
    const timestamp = Date.now();
    return `${this.config.service}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get contextual metadata
    */
  private getContextualMetadata(): Record<string, any> {
    return {
      ...this.config.metadata || {},
      ...this.contextOverrides
    };
  }

  /**
   * Set context for this logger instance
    */
  setContext(context: Record<string, any>): void {
    this.contextOverrides = { ...this.contextOverrides, ...context };
  }

  /**
   * Clear all context overrides
    */
  clearContext(): void {
    this.contextOverrides = {};
  }

  /**
   * Core logging implementation
    */
  log(level: LogLevel, message: string, context: Record<string, any> = {}, error?: Error): string {
    const correlationId = getCurrentCorrelationId() || generateCorrelationId();
    const timestamp = Date.now();
    const id = this.generateLogId();

    // Build complete context
    const fullContext = {
      ...this.getContextualMetadata(),
      ...context,
      ...this.buildUserContext()
    };

    // Build error info if provided
    const errorInfo: ErrorInfo | undefined = error ? {
      message: error.message,
      name: error.name,
      code: (error as any).code,
      stack: error.stack,
      details: (error as any).details
    } : undefined;

    // Create log entry
    const logEntry: LogEntry = {
      id,
      level,
      domain: context.domain || LogDomain.SYSTEM,
      message,
      context: fullContext,
      error: errorInfo,
      performance: context.performance,
      timestamp,
      correlationId,
      service: this.config.service,
      source: context.source
    };

    // Store entry for retrieval
    this.storeLogEntry(logEntry);

    // Log with Winston
    this.winston.log({
      level,
      message,
      ...fullContext,
      correlationId,
      timestamp,
      domain: logEntry.domain,
      error: errorInfo,
      performance: logEntry.performance
    });

    return correlationId;
  }

  /**
   * Error level logging
    */
  error(message: string, context: Record<string, any> = {}, error?: Error): string {
    return this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Warning level logging
    */
  warn(message: string, context: Record<string, any> = {}): string {
    return this.log(LogLevel.WARN, message, context);
  }

  /**
   * Info level logging
    */
  info(message: string, context: Record<string, any> = {}): string {
    return this.log(LogLevel.INFO, message, context);
  }

  /**
   * Debug level logging
    */
  debug(message: string, context: Record<string, any> = {}): string {
    return this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Create logger with additional context
    */
  withContext(context: Record<string, any>): ILogger {
    const newLogger = new BaseLogger(this.config.service, this.config);
    newLogger.contextOverrides = { ...this.contextOverrides, ...context };
    newLogger.userContext = { ...this.userContext };
    return newLogger;
  }

  /**
   * Execute callback with correlation ID
    */
  withCorrelation(correlationId: string, callback: () => string): string {
    return correlationManager.withCorrelation(correlationId, callback);
  }

  /**
   * Set user context for all subsequent logs
    */
  setUserContext(userContext: UserContext): void {
    this.userContext = { ...this.userContext, ...userContext };
  }

  /**
   * Log performance metrics
    */
  performanceMetric(metric: string, value: number, context: Record<string, any> = {}): string {
    const perfContext = {
      ...context,
      domain: LogDomain.PERFORMANCE,
      metric,
      performance: { value, ...context.performance }
    };

    return this.info(`Performance metric: ${metric}`, perfContext);
  }

  /**
   * Log business events
    */
  businessEvent(event: string, context: Record<string, any> = {}): string {
    const businessContext = {
      ...context,
      domain: LogDomain.BUSINESS,
      event
    };

    return this.info(`Business event: ${event}`, businessContext);
  }

  /**
   * Log security events
    */
  securityEvent(event: string, context: Record<string, any> = {}): string {
    const securityContext = {
      ...context,
      domain: LogDomain.SECURITY,
      event
    };

    return this.warn(`Security event: ${event}`, securityContext);
  }

  /**
   * Log audit events
    */
  auditEvent(event: string, context: Record<string, any> = {}): string {
    const auditContext = {
      ...context,
      domain: LogDomain.AUDIT,
      event
    };

    return this.info(`Audit event: ${event}`, auditContext);
  }

  /**
   * Get last log entry
    */
  getLastLogEntry(): LogEntry | null {
    return this.logEntries.length > 0 ? this.logEntries[this.logEntries.length - 1] : null;
  }

  /**
   * Get all stored log entries
    */
  getAllLogEntries(): LogEntry[] {
    return [...this.logEntries];
  }

  /**
   * Clear stored log entries
    */
  clearEntries(): void {
    this.logEntries = [];
  }

  /**
   * Store log entry with size management
    */
  private storeLogEntry(entry: LogEntry): void {
    this.logEntries.push(entry);

    // Maintain max entries limit
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.maxLogEntries);
    }
  }

  /**
   * Build user context for logging
    */
  private buildUserContext(): Record<string, any> {
    const context: Record<string, any> = {};

    if (this.userContext.userId) {
      context.userId = this.userContext.userId;
    }

    if (this.userContext.tier) {
      context.tier = this.userContext.tier;
    }

    if (this.userContext.role) {
      context.role = this.userContext.role;
    }

    if (this.userContext.experimentGroups?.length) {
      context.experimentGroups = this.userContext.experimentGroups;
    }

    // Note: Sensitive data like email and sessionId are excluded from context
    // They will be redacted by the formatter if needed

    return context;
  }

  /**
   * Update logger configuration
    */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.winston.configure({
      level: this.config.level,
      transports: this.winston.transports
    });
  }

  /**
   * Set log level
    */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.winston.level = level;
  }

  /**
   * Check if level is enabled
    */
  isLevelEnabled(level: LogLevel): boolean {
    const levels = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      [LogLevel.FATAL]: 0  // FATAL has same priority as ERROR
    };
    const currentLevel = levels[this.config.level];
    const checkLevel = levels[level];
    return checkLevel <= currentLevel;
  }

  /**
   * Destroy logger and clean up resources
    */
  destroy(): void {
    this.winston.destroy();
    this.logEntries = [];
  }
}