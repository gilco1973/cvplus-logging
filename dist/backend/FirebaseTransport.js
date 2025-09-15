/**
 * T022: Firebase transport for Winston logging in packages/core/src/logging/FirebaseTransport.ts
 *
 * Custom Winston transport for Firebase Cloud Logging integration
 * Provides structured logging compatible with Google Cloud Logging standards
 */
import Transport from 'winston-transport';
import { LogLevel, LogDomain } from './types';
import { LogFormatter } from './LogFormatter';
/**
 * Firebase Cloud Logging severity mapping
 */
const FIREBASE_SEVERITY_MAP = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARNING',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.FATAL]: 'CRITICAL'
};
/**
 * Firebase Cloud Logging transport for Winston
 */
export class FirebaseTransport extends Transport {
    constructor(options = {}) {
        super(options);
        this.logBatch = [];
        this.options = {
            projectId: process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
            functionName: process.env.FUNCTION_NAME || 'unknown',
            region: process.env.FUNCTION_REGION || 'us-central1',
            batchSize: 100,
            flushInterval: 5000,
            structured: true,
            logName: 'winston_log',
            ...options
        };
        // Set transport name for Winston
        this.setMaxListeners(30);
        // Bind methods to preserve context
        this.log = this.log.bind(this);
        this.flush = this.flush.bind(this);
    }
    /**
     * Winston log method - called for each log entry
     */
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        try {
            const logEntry = this.transformToLogEntry(info);
            const firebaseEntry = LogFormatter.formatForFirebase(logEntry);
            this.addToBatch(firebaseEntry);
            callback();
        }
        catch (error) {
            this.emit('error', error);
            callback();
        }
    }
    /**
     * Transform Winston info object to CVPlus LogEntry
     */
    transformToLogEntry(info) {
        const level = this.mapWinstonLevel(info.level);
        return {
            timestamp: new Date().toISOString(),
            level,
            message: info.message || '',
            correlationId: info.correlationId || this.generateCorrelationId(),
            domain: info.domain || LogDomain.SYSTEM,
            package: info.package || '@cvplus/core',
            context: info.meta || info.context || {},
            error: info.error ? {
                name: info.error.name || 'Error',
                message: info.error.message || '',
                stack: info.error.stack
            } : undefined,
            performance: info.performance,
            userId: info.userId,
            sessionId: info.sessionId,
            requestId: info.requestId
        };
    }
    /**
     * Map Winston log levels to CVPlus LogLevel enum
     */
    mapWinstonLevel(winstonLevel) {
        switch (winstonLevel.toLowerCase()) {
            case 'debug':
                return LogLevel.DEBUG;
            case 'info':
                return LogLevel.INFO;
            case 'warn':
            case 'warning':
                return LogLevel.WARN;
            case 'error':
                return LogLevel.ERROR;
            case 'fatal':
            case 'crit':
            case 'critical':
                return LogLevel.FATAL;
            default:
                return LogLevel.INFO;
        }
    }
    /**
     * Add log entry to batch for efficient processing
     */
    addToBatch(entry) {
        this.logBatch.push(entry);
        // Flush immediately if batch is full
        if (this.logBatch.length >= (this.options.batchSize || 100)) {
            this.flush();
            return;
        }
        // Schedule flush if not already scheduled
        if (!this.batchTimeout) {
            this.batchTimeout = setTimeout(() => {
                this.flush();
            }, this.options.flushInterval || 5000);
        }
    }
    /**
     * Flush batch to Firebase Cloud Logging
     */
    flush() {
        if (this.logBatch.length === 0) {
            return;
        }
        // Clear timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = undefined;
        }
        // Get batch to process
        const batchToProcess = [...this.logBatch];
        this.logBatch.length = 0; // Clear the batch
        // Process batch
        this.processBatch(batchToProcess).catch((error) => {
            if (typeof this.emit === 'function') {
                this.emit('error', new Error(`Firebase logging failed: ${error.message}`));
            }
            // Re-add failed entries to batch for retry
            this.logBatch.unshift(...batchToProcess);
        });
    }
    /**
     * Process batch of log entries to Firebase
     */
    async processBatch(entries) {
        if (entries.length === 0) {
            return;
        }
        try {
            // In Firebase Functions environment, logs are automatically captured
            // We write to structured JSON format for proper Cloud Logging integration
            if (this.options.structured) {
                entries.forEach(entry => {
                    console.log(JSON.stringify(entry));
                });
            }
            else {
                // Fallback to simple console logging
                entries.forEach(entry => {
                    console.log(`[${entry.timestamp}] ${entry.severity}: ${entry.message}`);
                });
            }
        }
        catch (error) {
            throw new Error(`Failed to write logs to Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate correlation ID if none provided
     */
    generateCorrelationId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    /**
     * Close transport and flush remaining entries
     */
    close() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = undefined;
        }
        // Flush any remaining entries
        this.flush();
        if (super.close) {
            super.close();
        }
    }
    /**
     * Get transport statistics
     */
    getStats() {
        return {
            batchSize: this.options.batchSize || 100,
            pendingEntries: this.logBatch.length,
            flushInterval: this.options.flushInterval || 5000,
            totalLogged: 0 // Would need to track this in a real implementation
        };
    }
    /**
     * Force immediate flush of pending entries
     */
    forceFlush() {
        return new Promise((resolve) => {
            if (this.logBatch.length === 0) {
                resolve();
                return;
            }
            // Flush and wait for completion
            this.flush();
            // Simple resolve after flush initiated
            // In a real implementation, you'd wait for the actual flush to complete
            setImmediate(resolve);
        });
    }
    /**
     * Create Firebase transport with common configurations
     */
    static createForEnvironment(environment = 'production') {
        const isDevelopment = environment === 'development';
        return new FirebaseTransport({
            level: isDevelopment ? 'debug' : 'info',
            batchSize: isDevelopment ? 10 : 100,
            flushInterval: isDevelopment ? 1000 : 5000,
            structured: true
        });
    }
    /**
     * Validate transport configuration
     */
    static validateConfig(options) {
        const errors = [];
        if (options.batchSize && (options.batchSize < 1 || options.batchSize > 1000)) {
            errors.push('Batch size must be between 1 and 1000');
        }
        if (options.flushInterval && (options.flushInterval < 100 || options.flushInterval > 60000)) {
            errors.push('Flush interval must be between 100ms and 60000ms');
        }
        if (options.projectId && !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(options.projectId)) {
            errors.push('Project ID must be a valid Google Cloud project identifier');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
/**
 * Default export for convenient import
 */
export default FirebaseTransport;
//# sourceMappingURL=FirebaseTransport.js.map