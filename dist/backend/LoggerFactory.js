/**
 * T022: LoggerFactory implementation
 * CVPlus Logging System - Logger Factory for Service Management
 */
import { LogLevel, DEFAULT_FACTORY_CONFIG } from './types/index';
import { BaseLogger } from './core/BaseLogger';
export class LoggerFactory {
    /**
     * Initialize the factory with global configuration
     */
    static initialize(config = {}) {
        LoggerFactory.config = { ...DEFAULT_FACTORY_CONFIG, ...config };
        LoggerFactory.initialized = true;
    }
    /**
     * Create or retrieve a logger for a service
     */
    static createLogger(serviceName, config = {}) {
        // Ensure factory is initialized
        if (!LoggerFactory.initialized) {
            LoggerFactory.initialize();
        }
        // Return existing logger if found
        if (LoggerFactory.loggers.has(serviceName)) {
            return LoggerFactory.loggers.get(serviceName);
        }
        // Merge service config with factory defaults
        const mergedConfig = {
            level: LoggerFactory.config.defaultLevel,
            enableConsole: true,
            enableFile: false,
            enableFirebase: false,
            redactPII: LoggerFactory.config.enablePIIRedaction,
            metadata: { ...LoggerFactory.config.globalContext },
            ...config
        };
        // Create new logger
        const logger = new BaseLogger(serviceName, mergedConfig);
        // Store for future retrieval
        LoggerFactory.loggers.set(serviceName, logger);
        return logger;
    }
    /**
     * Get existing logger by service name
     */
    static getLogger(serviceName) {
        const logger = LoggerFactory.loggers.get(serviceName);
        if (!logger) {
            throw new Error(`Logger not found for service: ${serviceName}`);
        }
        return logger;
    }
    /**
     * Check if logger exists for service
     */
    static hasLogger(serviceName) {
        return LoggerFactory.loggers.has(serviceName);
    }
    /**
     * Get all registered loggers
     */
    static getAllLoggers() {
        const result = {};
        LoggerFactory.loggers.forEach((logger, serviceName) => {
            result[serviceName] = logger;
        });
        return result;
    }
    static updateLogLevel(serviceNameOrLevel, level) {
        if (typeof serviceNameOrLevel === 'string' && level) {
            // Update specific logger
            const logger = LoggerFactory.loggers.get(serviceNameOrLevel);
            if (logger) {
                logger.setLevel(level);
            }
        }
        else if (typeof serviceNameOrLevel === 'string' && !level) {
            // Update all loggers
            const newLevel = serviceNameOrLevel;
            LoggerFactory.loggers.forEach(logger => {
                logger.setLevel(newLevel);
            });
            LoggerFactory.config.defaultLevel = newLevel;
        }
    }
    /**
     * Remove logger for service
     */
    static removeLogger(serviceName) {
        const logger = LoggerFactory.loggers.get(serviceName);
        if (logger) {
            logger.destroy();
            LoggerFactory.loggers.delete(serviceName);
            return true;
        }
        return false;
    }
    /**
     * Clear all loggers
     */
    static reset() {
        LoggerFactory.loggers.forEach(logger => {
            logger.destroy();
        });
        LoggerFactory.loggers.clear();
    }
    /**
     * Get factory configuration
     */
    static getConfig() {
        return { ...LoggerFactory.config };
    }
    /**
     * Update factory configuration
     */
    static updateConfig(newConfig) {
        LoggerFactory.config = { ...LoggerFactory.config, ...newConfig };
        // Apply configuration changes to existing loggers
        if (newConfig.defaultLevel) {
            LoggerFactory.loggers.forEach(logger => {
                logger.setLevel(newConfig.defaultLevel);
            });
        }
    }
    /**
     * Get logger count
     */
    static getLoggerCount() {
        return LoggerFactory.loggers.size;
    }
    /**
     * Get logger names
     */
    static getLoggerNames() {
        return Array.from(LoggerFactory.loggers.keys());
    }
    /**
     * Create logger with Winston instance (for compatibility)
     */
    static createWinstonLogger(serviceName, config = {}) {
        const logger = LoggerFactory.createLogger(serviceName, config);
        return logger.winston;
    }
    /**
     * Batch create loggers for multiple services
     */
    static createLoggers(services) {
        const result = {};
        services.forEach(({ name, config = {} }) => {
            result[name] = LoggerFactory.createLogger(name, config);
        });
        return result;
    }
    /**
     * Health check for all loggers
     */
    static healthCheck() {
        const issues = [];
        let healthy = true;
        try {
            // Check if loggers are responding
            LoggerFactory.loggers.forEach((logger, serviceName) => {
                try {
                    // Test if logger can create log entries
                    logger.debug('Health check test log', { healthCheck: true });
                }
                catch (error) {
                    issues.push(`Logger ${serviceName} failed health check: ${error.message}`);
                    healthy = false;
                }
            });
            // Check factory state
            if (!LoggerFactory.initialized) {
                issues.push('LoggerFactory not initialized');
                healthy = false;
            }
        }
        catch (error) {
            issues.push(`Health check failed: ${error.message}`);
            healthy = false;
        }
        return {
            healthy,
            loggerCount: LoggerFactory.loggers.size,
            issues
        };
    }
    /**
     * Create specialized logger with predefined configuration
     */
    static createSpecializedLogger(serviceName, specialization, config = {}) {
        const specializationConfigs = {
            security: {
                level: LogLevel.WARN,
                enableFile: true,
                filePath: './logs/security.log',
                metadata: { specialization: 'security' }
            },
            performance: {
                level: LogLevel.INFO,
                enableFile: true,
                filePath: './logs/performance.log',
                metadata: { specialization: 'performance' }
            },
            audit: {
                level: LogLevel.INFO,
                enableFile: true,
                filePath: './logs/audit.log',
                metadata: { specialization: 'audit' }
            },
            business: {
                level: LogLevel.INFO,
                enableFile: true,
                filePath: './logs/business.log',
                metadata: { specialization: 'business' }
            }
        };
        const specializationConfig = specializationConfigs[specialization];
        const mergedConfig = { ...specializationConfig, ...config };
        return LoggerFactory.createLogger(`${serviceName}-${specialization}`, mergedConfig);
    }
    /**
     * Graceful shutdown - flush and close all loggers
     */
    static async shutdown() {
        const shutdownPromises = [];
        LoggerFactory.loggers.forEach(logger => {
            shutdownPromises.push(new Promise((resolve) => {
                try {
                    logger.destroy();
                    resolve();
                }
                catch (error) {
                    // Log error but continue shutdown
                    console.error(`Error shutting down logger:`, error);
                    resolve();
                }
            }));
        });
        await Promise.all(shutdownPromises);
        LoggerFactory.loggers.clear();
    }
}
LoggerFactory.loggers = new Map();
LoggerFactory.config = DEFAULT_FACTORY_CONFIG;
LoggerFactory.initialized = false;
//# sourceMappingURL=LoggerFactory.js.map