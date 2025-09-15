/**
 * T021: Base logger implementation with Winston integration
 * CVPlus Logging System - Core Logger Implementation
 */
import winston from 'winston';
import { LogLevel, LogDomain, DEFAULT_LOGGER_CONFIG } from '../types/index';
import { correlationManager, getCurrentCorrelationId, generateCorrelationId } from '../utils/correlation';
export class BaseLogger {
    constructor(serviceName, config = {}) {
        this.userContext = {};
        this.contextOverrides = {};
        this.logEntries = [];
        this.maxLogEntries = 1000;
        this.config = { ...DEFAULT_LOGGER_CONFIG, ...config, service: serviceName };
        this.winston = this.createWinstonLogger();
    }
    /**
     * Create and configure Winston logger
     */
    createWinstonLogger() {
        const transports = [];
        // Console transport
        if (this.config.enableConsole) {
            transports.push(new winston.transports.Console({
                level: this.config.level,
                format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const correlationId = getCurrentCorrelationId();
                    const corrStr = correlationId ? `[${correlationId.slice(0, 8)}]` : '';
                    return `${timestamp} ${level} [${this.config.service}]${corrStr} ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                }))
            }));
        }
        // File transport
        if (this.config.enableFile) {
            transports.push(new winston.transports.File({
                filename: this.config.filePath,
                level: this.config.level,
                maxsize: this.config.maxFileSize,
                maxFiles: this.config.maxFiles,
                format: winston.format.combine(winston.format.timestamp(), winston.format.json())
            }));
        }
        return winston.createLogger({
            level: this.config.level,
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
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
    generateLogId() {
        const timestamp = Date.now();
        return `${this.config.service}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get contextual metadata
     */
    getContextualMetadata() {
        return {
            ...this.config.metadata || {},
            ...this.contextOverrides
        };
    }
    /**
     * Set context for this logger instance
     */
    setContext(context) {
        this.contextOverrides = { ...this.contextOverrides, ...context };
    }
    /**
     * Clear all context overrides
     */
    clearContext() {
        this.contextOverrides = {};
    }
    /**
     * Core logging implementation
     */
    log(level, message, context = {}, error) {
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
        const errorInfo = error ? {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack,
            details: error.details
        } : undefined;
        // Create log entry
        const logEntry = {
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
    error(message, context = {}, error) {
        return this.log(LogLevel.ERROR, message, context, error);
    }
    /**
     * Warning level logging
     */
    warn(message, context = {}) {
        return this.log(LogLevel.WARN, message, context);
    }
    /**
     * Info level logging
     */
    info(message, context = {}) {
        return this.log(LogLevel.INFO, message, context);
    }
    /**
     * Debug level logging
     */
    debug(message, context = {}) {
        return this.log(LogLevel.DEBUG, message, context);
    }
    /**
     * Create logger with additional context
     */
    withContext(context) {
        const newLogger = new BaseLogger(this.config.service, this.config);
        newLogger.contextOverrides = { ...this.contextOverrides, ...context };
        newLogger.userContext = { ...this.userContext };
        return newLogger;
    }
    /**
     * Execute callback with correlation ID
     */
    withCorrelation(correlationId, callback) {
        return correlationManager.withCorrelation(correlationId, callback);
    }
    /**
     * Set user context for all subsequent logs
     */
    setUserContext(userContext) {
        this.userContext = { ...this.userContext, ...userContext };
    }
    /**
     * Log performance metrics
     */
    performanceMetric(metric, value, context = {}) {
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
    businessEvent(event, context = {}) {
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
    securityEvent(event, context = {}) {
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
    auditEvent(event, context = {}) {
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
    getLastLogEntry() {
        return this.logEntries.length > 0 ? this.logEntries[this.logEntries.length - 1] : null;
    }
    /**
     * Get all stored log entries
     */
    getAllLogEntries() {
        return [...this.logEntries];
    }
    /**
     * Clear stored log entries
     */
    clearEntries() {
        this.logEntries = [];
    }
    /**
     * Store log entry with size management
     */
    storeLogEntry(entry) {
        this.logEntries.push(entry);
        // Maintain max entries limit
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries = this.logEntries.slice(-this.maxLogEntries);
        }
    }
    /**
     * Build user context for logging
     */
    buildUserContext() {
        var _a;
        const context = {};
        if (this.userContext.userId) {
            context.userId = this.userContext.userId;
        }
        if (this.userContext.tier) {
            context.tier = this.userContext.tier;
        }
        if (this.userContext.role) {
            context.role = this.userContext.role;
        }
        if ((_a = this.userContext.experimentGroups) === null || _a === void 0 ? void 0 : _a.length) {
            context.experimentGroups = this.userContext.experimentGroups;
        }
        // Note: Sensitive data like email and sessionId are excluded from context
        // They will be redacted by the formatter if needed
        return context;
    }
    /**
     * Update logger configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.winston.configure({
            level: this.config.level,
            transports: this.winston.transports
        });
    }
    /**
     * Set log level
     */
    setLevel(level) {
        this.config.level = level;
        this.winston.level = level;
    }
    /**
     * Check if level is enabled
     */
    isLevelEnabled(level) {
        const levels = {
            [LogLevel.ERROR]: 0,
            [LogLevel.WARN]: 1,
            [LogLevel.INFO]: 2,
            [LogLevel.DEBUG]: 3,
            [LogLevel.FATAL]: 0 // FATAL has same priority as ERROR
        };
        const currentLevel = levels[this.config.level];
        const checkLevel = levels[level];
        return checkLevel <= currentLevel;
    }
    /**
     * Destroy logger and clean up resources
     */
    destroy() {
        this.winston.destroy();
        this.logEntries = [];
    }
}
//# sourceMappingURL=BaseLogger.js.map