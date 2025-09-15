/**
 * T023: Core LogEntry Model - Foundation data model for the CVPlus logging system
 * This is the primary data structure that flows through the entire logging pipeline
 */
import { LogLevel, LogMetadata, CorrelationContext, PerformanceInfo, ErrorInfo, LogSource, LogDomain } from '../types/index';
/**
 * Core LogEntry interface - the fundamental logging data structure
 */
export interface ILogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    service: string;
    domain?: LogDomain;
    component?: string;
    correlationId: string;
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    source?: LogSource;
    metadata?: LogMetadata;
    context?: CorrelationContext;
    tags?: string[];
    performance?: PerformanceInfo;
    error?: ErrorInfo;
    processedAt?: Date;
    indexed?: boolean;
    archived?: boolean;
    sensitivityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
    piiRedacted?: boolean;
    encryptionLevel?: 'none' | 'standard' | 'high';
}
/**
 * LogEntry class implementation
 */
export declare class LogEntry implements ILogEntry {
    readonly id: string;
    readonly timestamp: Date;
    readonly level: LogLevel;
    readonly message: string;
    readonly service: string;
    readonly correlationId: string;
    domain?: LogDomain;
    component?: string;
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    source?: LogSource;
    metadata?: LogMetadata;
    context?: CorrelationContext;
    tags?: string[];
    performance?: PerformanceInfo;
    error?: ErrorInfo;
    processedAt?: Date;
    indexed?: boolean;
    archived?: boolean;
    sensitivityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
    piiRedacted?: boolean;
    encryptionLevel?: 'none' | 'standard' | 'high';
    constructor(entry: Omit<ILogEntry, 'processedAt' | 'indexed' | 'archived'>);
    /**
     * Create a new LogEntry with minimal required fields
     */
    static create(level: LogLevel, message: string, service: string, correlationId: string, options?: Partial<ILogEntry>): LogEntry;
    /**
     * Generate a unique log entry ID
     */
    private static generateId;
    /**
     * Convert to plain object for serialization
     */
    toObject(): Record<string, any>;
    /**
     * Convert to JSON string
     */
    toJSON(): string;
    /**
     * Create LogEntry from object (deserialization)
     */
    static fromObject(obj: Record<string, any>): LogEntry;
    /**
     * Create LogEntry from JSON string
     */
    static fromJSON(json: string): LogEntry;
    /**
     * Check if the log entry contains sensitive information
     */
    containsSensitiveData(): boolean;
    /**
     * Check if the log entry is an error log
     */
    isError(): boolean;
    /**
     * Check if the log entry has performance metrics
     */
    hasPerformanceData(): boolean;
    /**
     * Get the age of the log entry in milliseconds
     */
    getAge(): number;
    /**
     * Check if the log entry should be archived based on age
     */
    shouldArchive(maxAgeMs: number): boolean;
    /**
     * Mark as processed
     */
    markProcessed(): void;
    /**
     * Mark as indexed
     */
    markIndexed(): void;
    /**
     * Mark as archived
     */
    markArchived(): void;
    /**
     * Add or update a tag
     */
    addTag(tag: string): void;
    /**
     * Remove a tag
     */
    removeTag(tag: string): void;
    /**
     * Check if the log entry has a specific tag
     */
    hasTag(tag: string): boolean;
    /**
     * Update metadata
     */
    updateMetadata(metadata: Partial<LogMetadata>): void;
    /**
     * Clone the log entry with modifications
     */
    clone(modifications?: Partial<ILogEntry>): LogEntry;
}
export default LogEntry;
//# sourceMappingURL=LogEntry.d.ts.map