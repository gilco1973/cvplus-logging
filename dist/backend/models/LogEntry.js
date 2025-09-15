/**
 * T023: Core LogEntry Model - Foundation data model for the CVPlus logging system
 * This is the primary data structure that flows through the entire logging pipeline
 */
import { LogLevel } from '../types/index';
/**
 * LogEntry class implementation
 */
export class LogEntry {
    constructor(entry) {
        // Required fields
        this.id = entry.id;
        this.timestamp = entry.timestamp;
        this.level = entry.level;
        this.message = entry.message;
        this.service = entry.service;
        this.correlationId = entry.correlationId;
        // Optional fields
        this.domain = entry.domain;
        this.component = entry.component;
        this.traceId = entry.traceId;
        this.spanId = entry.spanId;
        this.parentSpanId = entry.parentSpanId;
        this.userId = entry.userId;
        this.sessionId = entry.sessionId;
        this.requestId = entry.requestId;
        this.source = entry.source;
        this.metadata = entry.metadata;
        this.context = entry.context;
        this.tags = entry.tags;
        this.performance = entry.performance;
        this.error = entry.error;
        this.sensitivityLevel = entry.sensitivityLevel || 'internal';
        this.piiRedacted = entry.piiRedacted || false;
        this.encryptionLevel = entry.encryptionLevel || 'none';
        // Processing metadata - set by the system
        this.processedAt = new Date();
        this.indexed = false;
        this.archived = false;
    }
    /**
     * Create a new LogEntry with minimal required fields
     */
    static create(level, message, service, correlationId, options = {}) {
        return new LogEntry({
            id: this.generateId(),
            timestamp: new Date(),
            level,
            message,
            service,
            correlationId,
            ...options
        });
    }
    /**
     * Generate a unique log entry ID
     */
    static generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `log_${timestamp}_${random}`;
    }
    /**
     * Convert to plain object for serialization
     */
    toObject() {
        var _a;
        return {
            id: this.id,
            timestamp: this.timestamp.toISOString(),
            level: this.level,
            message: this.message,
            service: this.service,
            domain: this.domain,
            component: this.component,
            correlationId: this.correlationId,
            traceId: this.traceId,
            spanId: this.spanId,
            parentSpanId: this.parentSpanId,
            userId: this.userId,
            sessionId: this.sessionId,
            requestId: this.requestId,
            source: this.source,
            metadata: this.metadata,
            context: this.context,
            tags: this.tags,
            performance: this.performance,
            error: this.error,
            processedAt: (_a = this.processedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
            indexed: this.indexed,
            archived: this.archived,
            sensitivityLevel: this.sensitivityLevel,
            piiRedacted: this.piiRedacted,
            encryptionLevel: this.encryptionLevel
        };
    }
    /**
     * Convert to JSON string
     */
    toJSON() {
        return JSON.stringify(this.toObject());
    }
    /**
     * Create LogEntry from object (deserialization)
     */
    static fromObject(obj) {
        const entry = new LogEntry({
            id: obj.id,
            timestamp: new Date(obj.timestamp),
            level: obj.level,
            message: obj.message,
            service: obj.service,
            correlationId: obj.correlationId,
            domain: obj.domain,
            component: obj.component,
            traceId: obj.traceId,
            spanId: obj.spanId,
            parentSpanId: obj.parentSpanId,
            userId: obj.userId,
            sessionId: obj.sessionId,
            requestId: obj.requestId,
            source: obj.source,
            metadata: obj.metadata,
            context: obj.context,
            tags: obj.tags,
            performance: obj.performance,
            error: obj.error,
            sensitivityLevel: obj.sensitivityLevel,
            piiRedacted: obj.piiRedacted,
            encryptionLevel: obj.encryptionLevel
        });
        // Restore processing metadata
        if (obj.processedAt) {
            entry.processedAt = new Date(obj.processedAt);
        }
        entry.indexed = obj.indexed || false;
        entry.archived = obj.archived || false;
        return entry;
    }
    /**
     * Create LogEntry from JSON string
     */
    static fromJSON(json) {
        return LogEntry.fromObject(JSON.parse(json));
    }
    /**
     * Check if the log entry contains sensitive information
     */
    containsSensitiveData() {
        return this.sensitivityLevel === 'confidential' ||
            this.sensitivityLevel === 'restricted' ||
            !this.piiRedacted;
    }
    /**
     * Check if the log entry is an error log
     */
    isError() {
        return this.level === LogLevel.ERROR || this.level === LogLevel.FATAL;
    }
    /**
     * Check if the log entry has performance metrics
     */
    hasPerformanceData() {
        return this.performance !== undefined && (this.performance.duration !== undefined ||
            this.performance.memoryUsage !== undefined ||
            this.performance.cpuUsage !== undefined);
    }
    /**
     * Get the age of the log entry in milliseconds
     */
    getAge() {
        return Date.now() - this.timestamp.getTime();
    }
    /**
     * Check if the log entry should be archived based on age
     */
    shouldArchive(maxAgeMs) {
        return this.getAge() > maxAgeMs && !this.archived;
    }
    /**
     * Mark as processed
     */
    markProcessed() {
        this.processedAt = new Date();
    }
    /**
     * Mark as indexed
     */
    markIndexed() {
        this.indexed = true;
    }
    /**
     * Mark as archived
     */
    markArchived() {
        this.archived = true;
    }
    /**
     * Add or update a tag
     */
    addTag(tag) {
        if (!this.tags) {
            this.tags = [];
        }
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }
    /**
     * Remove a tag
     */
    removeTag(tag) {
        if (this.tags) {
            const index = this.tags.indexOf(tag);
            if (index > -1) {
                this.tags.splice(index, 1);
            }
        }
    }
    /**
     * Check if the log entry has a specific tag
     */
    hasTag(tag) {
        var _a;
        return ((_a = this.tags) === null || _a === void 0 ? void 0 : _a.includes(tag)) || false;
    }
    /**
     * Update metadata
     */
    updateMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
    }
    /**
     * Clone the log entry with modifications
     */
    clone(modifications = {}) {
        return new LogEntry({
            id: this.id,
            timestamp: this.timestamp,
            level: this.level,
            message: this.message,
            service: this.service,
            correlationId: this.correlationId,
            domain: this.domain,
            component: this.component,
            traceId: this.traceId,
            spanId: this.spanId,
            parentSpanId: this.parentSpanId,
            userId: this.userId,
            sessionId: this.sessionId,
            requestId: this.requestId,
            source: this.source,
            metadata: this.metadata,
            context: this.context,
            tags: this.tags,
            performance: this.performance,
            error: this.error,
            sensitivityLevel: this.sensitivityLevel,
            piiRedacted: this.piiRedacted,
            encryptionLevel: this.encryptionLevel,
            ...modifications
        });
    }
}
// Export both interface and class
export default LogEntry;
//# sourceMappingURL=LogEntry.js.map