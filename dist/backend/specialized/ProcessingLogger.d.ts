/**
 * T024: CV Processing-specific logging implementation
 * CVPlus Logging System - CV Processing Module Logger
 */
import { BaseLogger } from '../core/BaseLogger';
export declare class ProcessingLogger extends BaseLogger {
    constructor(serviceName?: string);
    /**
     * Log CV processing start
     */
    processingStarted(context?: {
        userId?: string;
        cvId?: string;
        requestedFeatures?: string[];
        fileSize?: number;
        fileType?: string;
        correlationId?: string;
    }): string;
    /**
     * Log CV processing completion
     */
    processingCompleted(context?: {
        cvId?: string;
        processingDuration?: number;
        featuresCompleted?: string[];
        qualityScore?: number;
        wordCount?: number;
        correlationId?: string;
    }): string;
    /**
     * Log CV processing failures
     */
    processingFailed(context?: {
        cvId?: string;
        errorType?: string;
        errorMessage?: string;
        attemptedFeatures?: string[];
        processingDuration?: number;
        correlationId?: string;
    }): string;
    /**
     * Log feature-specific processing events
     */
    featureProcessed(feature: string, data: any): string;
    /**
     * Log AI service API calls
     */
    aiServiceCalled(context?: {
        service?: string;
        endpoint?: string;
        tokens?: number;
        cost?: number;
        duration?: number;
        success?: boolean;
        correlationId?: string;
    }): string;
    /**
     * Log retry attempts
     */
    retryAttempt(context?: {
        cvId?: string;
        feature?: string;
        attempt?: number;
        maxAttempts?: number;
        lastError?: string;
        retryDelay?: number;
        correlationId?: string;
    }): string;
    /**
     * Execute callback with correlation ID context
     */
    withCorrelation(correlationId: string, callback: () => string): string;
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry(): import("..").LogEntry | null;
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries(): import("..").LogEntry[];
}
//# sourceMappingURL=ProcessingLogger.d.ts.map