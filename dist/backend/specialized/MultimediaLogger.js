/**
 * T025: Multimedia-specific logging implementation
 * CVPlus Logging System - Multimedia Module Logger
 */
import { BaseLogger } from '../core/BaseLogger';
import { LogLevel, LogDomain } from '../types';
export class MultimediaLogger extends BaseLogger {
    constructor(serviceName = 'multimedia-service') {
        super(serviceName, {
            package: '@cvplus/multimedia',
            level: LogLevel.INFO
        });
    }
    /**
     * Log media upload started
     */
    mediaUploadStarted(context = {}) {
        return this.log(LogLevel.INFO, 'Media upload started', {
            domain: LogDomain.BUSINESS,
            event: 'MEDIA_UPLOAD_STARTED',
            userId: context.userId,
            fileName: context.fileName,
            fileSize: context.fileSize,
            fileType: context.fileType,
            uploadMethod: context.uploadMethod,
            processingIntent: context.processingIntent
        });
    }
    /**
     * Log video generation started
     */
    videoGenerationStarted(context = {}) {
        return this.log(LogLevel.INFO, 'AI video generation started', {
            domain: LogDomain.BUSINESS,
            event: 'VIDEO_GENERATION_STARTED',
            userId: context.userId,
            videoType: context.videoType,
            aiService: context.aiService,
            scriptLength: context.scriptLength,
            avatarId: context.avatarId,
            resolution: context.resolution
        });
    }
    /**
     * Log audio processing completed
     */
    audioProcessingCompleted(context = {}) {
        return this.log(LogLevel.INFO, 'Audio processing completed', {
            domain: LogDomain.PERFORMANCE,
            event: 'AUDIO_PROCESSING_COMPLETED',
            audioId: context.audioId,
            processingType: context.processingType,
            aiService: context.aiService,
            voiceId: context.voiceId,
            textLength: context.textLength,
            qualitySettings: context.qualitySettings,
            outputFormat: context.outputFormat
        });
    }
    /**
     * Log media storage operations
     */
    storageOperation(context = {}) {
        return this.log(LogLevel.INFO, 'Media storage operation completed', {
            domain: LogDomain.SYSTEM,
            event: 'STORAGE_OPERATION',
            operation: context.operation,
            bucketName: context.bucketName,
            filePath: context.filePath,
            fileSize: context.fileSize,
            storageClass: context.storageClass
        });
    }
    /**
     * Log AI service calls with costs
     */
    aiServiceCalled(context = {}) {
        const performance = context.duration ? {
            duration: context.duration
        } : undefined;
        return this.log(LogLevel.INFO, 'AI service call completed', {
            domain: LogDomain.PERFORMANCE,
            event: 'AI_SERVICE_CALLED',
            service: context.service,
            endpoint: context.endpoint,
            requestType: context.requestType,
            credits: context.credits,
            cost: context.cost,
            success: context.success,
            performance
        });
    }
    /**
     * Log processing failures
     */
    processingFailed(context = {}) {
        const error = context.errorMessage ? {
            message: context.errorMessage,
            code: context.errorType
        } : undefined;
        const performance = context.processingDuration ? {
            duration: context.processingDuration
        } : undefined;
        return this.log(LogLevel.ERROR, 'Media processing failed', {
            domain: LogDomain.SYSTEM,
            event: 'PROCESSING_FAILED',
            mediaId: context.mediaId,
            processingType: context.processingType,
            errorType: context.errorType,
            originalFormat: context.originalFormat,
            targetFormat: context.targetFormat,
            recoveryStrategy: context.recoveryStrategy,
            error,
            performance
        });
    }
    /**
     * Log processing completion with performance metrics
     */
    processingCompleted(context = {}) {
        const performance = context.processingDuration ? {
            duration: context.processingDuration
        } : undefined;
        return this.log(LogLevel.INFO, 'Media processing completed', {
            domain: LogDomain.PERFORMANCE,
            event: 'PROCESSING_COMPLETED',
            mediaId: context.mediaId,
            fileSize: context.fileSize,
            processingType: context.processingType,
            qualityScore: context.qualityScore,
            performance
        });
    }
    /**
     * Log storage quota warnings
     */
    quotaWarning(context = {}) {
        return this.log(LogLevel.WARN, 'User approaching storage quota limit', {
            domain: LogDomain.SYSTEM,
            event: 'QUOTA_WARNING',
            userId: context.userId,
            currentUsage: context.currentUsage,
            quotaLimit: context.quotaLimit,
            utilizationPercent: context.utilizationPercent
        });
    }
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry() {
        return super.getLastLogEntry();
    }
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries() {
        return super.getAllLogEntries();
    }
}
//# sourceMappingURL=MultimediaLogger.js.map