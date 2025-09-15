/**
 * T025: Multimedia-specific logging implementation
 * CVPlus Logging System - Multimedia Module Logger
 */
import { BaseLogger } from '../core/BaseLogger';
export declare class MultimediaLogger extends BaseLogger {
    constructor(serviceName?: string);
    /**
     * Log media upload started
     */
    mediaUploadStarted(context?: {
        userId?: string;
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        uploadMethod?: string;
        processingIntent?: string;
        correlationId?: string;
    }): string;
    /**
     * Log video generation started
     */
    videoGenerationStarted(context?: {
        userId?: string;
        videoType?: string;
        aiService?: string;
        scriptLength?: number;
        avatarId?: string;
        resolution?: string;
        estimatedDuration?: number;
        correlationId?: string;
    }): string;
    /**
     * Log audio processing completed
     */
    audioProcessingCompleted(context?: {
        audioId?: string;
        processingType?: string;
        aiService?: string;
        voiceId?: string;
        textLength?: number;
        qualitySettings?: string;
        outputFormat?: string;
        correlationId?: string;
    }): string;
    /**
     * Log media storage operations
     */
    storageOperation(context?: {
        operation?: string;
        bucketName?: string;
        filePath?: string;
        fileSize?: number;
        storageClass?: string;
        metadata?: Record<string, any>;
        correlationId?: string;
    }): string;
    /**
     * Log AI service calls with costs
     */
    aiServiceCalled(context?: {
        service?: string;
        endpoint?: string;
        requestType?: string;
        inputTokens?: number;
        credits?: number;
        cost?: number;
        duration?: number;
        success?: boolean;
        responseSize?: string;
        correlationId?: string;
    }): string;
    /**
     * Log processing failures
     */
    processingFailed(context?: {
        mediaId?: string;
        processingType?: string;
        errorType?: string;
        errorMessage?: string;
        originalFormat?: string;
        targetFormat?: string;
        recoveryStrategy?: string;
        processingDuration?: number;
        correlationId?: string;
    }): string;
    /**
     * Log processing completion with performance metrics
     */
    processingCompleted(context?: {
        mediaId?: string;
        processingDuration?: number;
        fileSize?: number;
        processingType?: string;
        qualityScore?: number;
        correlationId?: string;
    }): string;
    /**
     * Log storage quota warnings
     */
    quotaWarning(context?: {
        userId?: string;
        currentUsage?: number;
        quotaLimit?: number;
        utilizationPercent?: number;
        mediaTypes?: Record<string, number>;
        correlationId?: string;
    }): string;
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry(): import("..").LogEntry | null;
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries(): import("..").LogEntry[];
}
//# sourceMappingURL=MultimediaLogger.d.ts.map