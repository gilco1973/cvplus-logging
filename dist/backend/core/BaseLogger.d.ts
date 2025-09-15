/**
 * T021: Base logger implementation with Winston integration
 * CVPlus Logging System - Core Logger Implementation
 */
import { Logger as WinstonLogger } from 'winston';
import { ILogger, LogEntry, LogLevel, LoggerConfig, UserContext } from '../types/index';
export declare class BaseLogger implements ILogger {
    protected winston: WinstonLogger;
    protected config: Required<LoggerConfig>;
    protected userContext: UserContext;
    protected contextOverrides: Record<string, any>;
    protected logEntries: LogEntry[];
    private maxLogEntries;
    constructor(serviceName: string, config?: Partial<LoggerConfig>);
    /**
     * Create and configure Winston logger
     */
    private createWinstonLogger;
    /**
     * Generate unique log ID
     */
    private generateLogId;
    /**
     * Get contextual metadata
     */
    private getContextualMetadata;
    /**
     * Set context for this logger instance
     */
    setContext(context: Record<string, any>): void;
    /**
     * Clear all context overrides
     */
    clearContext(): void;
    /**
     * Core logging implementation
     */
    log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): string;
    /**
     * Error level logging
     */
    error(message: string, context?: Record<string, any>, error?: Error): string;
    /**
     * Warning level logging
     */
    warn(message: string, context?: Record<string, any>): string;
    /**
     * Info level logging
     */
    info(message: string, context?: Record<string, any>): string;
    /**
     * Debug level logging
     */
    debug(message: string, context?: Record<string, any>): string;
    /**
     * Create logger with additional context
     */
    withContext(context: Record<string, any>): ILogger;
    /**
     * Execute callback with correlation ID
     */
    withCorrelation(correlationId: string, callback: () => string): string;
    /**
     * Set user context for all subsequent logs
     */
    setUserContext(userContext: UserContext): void;
    /**
     * Log performance metrics
     */
    performanceMetric(metric: string, value: number, context?: Record<string, any>): string;
    /**
     * Log business events
     */
    businessEvent(event: string, context?: Record<string, any>): string;
    /**
     * Log security events
     */
    securityEvent(event: string, context?: Record<string, any>): string;
    /**
     * Log audit events
     */
    auditEvent(event: string, context?: Record<string, any>): string;
    /**
     * Get last log entry
     */
    getLastLogEntry(): LogEntry | null;
    /**
     * Get all stored log entries
     */
    getAllLogEntries(): LogEntry[];
    /**
     * Clear stored log entries
     */
    clearEntries(): void;
    /**
     * Store log entry with size management
     */
    private storeLogEntry;
    /**
     * Build user context for logging
     */
    private buildUserContext;
    /**
     * Update logger configuration
     */
    updateConfig(newConfig: Partial<LoggerConfig>): void;
    /**
     * Set log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Check if level is enabled
     */
    isLevelEnabled(level: LogLevel): boolean;
    /**
     * Destroy logger and clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=BaseLogger.d.ts.map