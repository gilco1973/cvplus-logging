/**
 * T022: LoggerFactory implementation
 * CVPlus Logging System - Logger Factory for Service Management
 */
import { Logger as WinstonLogger } from 'winston';
import { LoggerConfig, LoggerFactoryConfig, LogLevel } from './types/index';
import { BaseLogger } from './core/BaseLogger';
export declare class LoggerFactory {
    private static loggers;
    private static config;
    private static initialized;
    /**
     * Initialize the factory with global configuration
     */
    static initialize(config?: Partial<LoggerFactoryConfig>): void;
    /**
     * Create or retrieve a logger for a service
     */
    static createLogger(serviceName: string, config?: Partial<LoggerConfig>): BaseLogger;
    /**
     * Get existing logger by service name
     */
    static getLogger(serviceName: string): BaseLogger;
    /**
     * Check if logger exists for service
     */
    static hasLogger(serviceName: string): boolean;
    /**
     * Get all registered loggers
     */
    static getAllLoggers(): Record<string, BaseLogger>;
    /**
     * Update log level for specific logger
     */
    static updateLogLevel(serviceName: string, level: LogLevel): void;
    static updateLogLevel(level: LogLevel): void;
    /**
     * Remove logger for service
     */
    static removeLogger(serviceName: string): boolean;
    /**
     * Clear all loggers
     */
    static reset(): void;
    /**
     * Get factory configuration
     */
    static getConfig(): Required<LoggerFactoryConfig>;
    /**
     * Update factory configuration
     */
    static updateConfig(newConfig: Partial<LoggerFactoryConfig>): void;
    /**
     * Get logger count
     */
    static getLoggerCount(): number;
    /**
     * Get logger names
     */
    static getLoggerNames(): string[];
    /**
     * Create logger with Winston instance (for compatibility)
     */
    static createWinstonLogger(serviceName: string, config?: Partial<LoggerConfig>): WinstonLogger;
    /**
     * Batch create loggers for multiple services
     */
    static createLoggers(services: Array<{
        name: string;
        config?: Partial<LoggerConfig>;
    }>): Record<string, BaseLogger>;
    /**
     * Health check for all loggers
     */
    static healthCheck(): {
        healthy: boolean;
        loggerCount: number;
        issues: string[];
    };
    /**
     * Create specialized logger with predefined configuration
     */
    static createSpecializedLogger(serviceName: string, specialization: 'security' | 'performance' | 'audit' | 'business', config?: Partial<LoggerConfig>): BaseLogger;
    /**
     * Graceful shutdown - flush and close all loggers
     */
    static shutdown(): Promise<void>;
}
//# sourceMappingURL=LoggerFactory.d.ts.map