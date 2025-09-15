/**
 * T022: Firebase transport for Winston logging in packages/core/src/logging/FirebaseTransport.ts
 *
 * Custom Winston transport for Firebase Cloud Logging integration
 * Provides structured logging compatible with Google Cloud Logging standards
 */
import Transport from 'winston-transport';
/**
 * Firebase Transport configuration options
 */
export interface FirebaseTransportOptions {
    level?: string;
    /**
     * Google Cloud Project ID
     */
    projectId?: string;
    /**
     * Cloud Function name for resource metadata
     */
    functionName?: string;
    /**
     * Cloud Function region
     */
    region?: string;
    /**
     * Maximum batch size for log entries
     */
    batchSize?: number;
    /**
     * Batch flush interval in milliseconds
     */
    flushInterval?: number;
    /**
     * Enable structured logging format
     */
    structured?: boolean;
    /**
     * Additional resource labels
     */
    resourceLabels?: Record<string, string>;
    /**
     * Custom log name prefix
     */
    logName?: string;
}
/**
 * Firebase Cloud Logging transport for Winston
 */
export declare class FirebaseTransport extends Transport {
    private readonly options;
    private readonly logBatch;
    private batchTimeout?;
    constructor(options?: FirebaseTransportOptions);
    /**
     * Winston log method - called for each log entry
     */
    log(info: any, callback: () => void): void;
    /**
     * Transform Winston info object to CVPlus LogEntry
     */
    private transformToLogEntry;
    /**
     * Map Winston log levels to CVPlus LogLevel enum
     */
    private mapWinstonLevel;
    /**
     * Add log entry to batch for efficient processing
     */
    private addToBatch;
    /**
     * Flush batch to Firebase Cloud Logging
     */
    private flush;
    /**
     * Process batch of log entries to Firebase
     */
    private processBatch;
    /**
     * Generate correlation ID if none provided
     */
    private generateCorrelationId;
    /**
     * Close transport and flush remaining entries
     */
    close(): void;
    /**
     * Get transport statistics
     */
    getStats(): {
        batchSize: number;
        pendingEntries: number;
        flushInterval: number;
        totalLogged: number;
    };
    /**
     * Force immediate flush of pending entries
     */
    forceFlush(): Promise<void>;
    /**
     * Create Firebase transport with common configurations
     */
    static createForEnvironment(environment?: 'development' | 'production'): FirebaseTransport;
    /**
     * Validate transport configuration
     */
    static validateConfig(options: FirebaseTransportOptions): {
        isValid: boolean;
        errors: string[];
    };
}
/**
 * Default export for convenient import
 */
export default FirebaseTransport;
//# sourceMappingURL=FirebaseTransport.d.ts.map