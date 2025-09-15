/**
 * T023: Log stream management in packages/core/src/logging/LogStream.ts
 *
 * Manages log streams for real-time log processing and filtering
 * Provides event-driven log streaming capabilities for dashboards and monitoring
 */
import { EventEmitter } from 'events';
import { LogEntry, LogLevel, LogDomain, LogStream as LogStreamInterface } from './types';
/**
 * Log stream filter criteria
 */
export interface LogStreamFilter {
    /**
     * Filter by log levels
     */
    levels?: LogLevel[];
    /**
     * Filter by log domains
     */
    domains?: LogDomain[];
    /**
     * Filter by packages
     */
    packages?: string[];
    /**
     * Filter by user ID
     */
    userId?: string;
    /**
     * Filter by session ID
     */
    sessionId?: string;
    /**
     * Filter by correlation ID pattern
     */
    correlationIdPattern?: RegExp;
    /**
     * Filter by time range
     */
    timeRange?: {
        start: Date;
        end: Date;
    };
    /**
     * Filter by message content
     */
    messagePattern?: RegExp;
    /**
     * Maximum entries to keep in buffer
     */
    maxBufferSize?: number;
    /**
     * Enable PII redaction
     */
    redactPii?: boolean;
}
/**
 * Log stream statistics
 */
export interface LogStreamStats {
    totalReceived: number;
    totalFiltered: number;
    totalEmitted: number;
    bufferSize: number;
    activeListeners: number;
    createdAt: Date;
    lastActivity: Date;
}
/**
 * Log stream events
 */
export interface LogStreamEvents {
    'log': (entry: LogEntry) => void;
    'batch': (entries: LogEntry[]) => void;
    'error': (error: Error) => void;
    'stats': (stats: LogStreamStats) => void;
    'buffer-full': (droppedCount: number) => void;
}
/**
 * Real-time log stream manager
 */
export declare class LogStream extends EventEmitter implements LogStreamInterface {
    readonly id: string;
    readonly name: string;
    readonly package: string;
    readonly domain: LogDomain;
    readonly level: LogLevel;
    enabled: boolean;
    retention?: number;
    tags?: string[];
    private readonly filter;
    private readonly buffer;
    private readonly stats;
    private isActive;
    constructor(id: string, name: string, packageName: string, domain?: LogDomain, level?: LogLevel, filter?: LogStreamFilter);
    /**
     * Get stream ID
     */
    getId(): string;
    /**
     * Get stream name
     */
    getName(): string;
    /**
     * Get stream filter
     */
    getFilter(): LogStreamFilter;
    /**
     * Check if stream is active
     */
    isStreamActive(): boolean;
    /**
     * Process new log entry
     */
    processLogEntry(entry: LogEntry): void;
    /**
     * Process batch of log entries
     */
    processBatch(entries: LogEntry[]): void;
    /**
     * Check if log entry passes the filter criteria
     */
    private passesFilter;
    /**
     * Add entry to buffer with size management
     */
    private addToBuffer;
    /**
     * Get buffered log entries
     */
    getBuffer(): LogEntry[];
    /**
     * Get stream statistics
     */
    getStats(): LogStreamStats;
    /**
     * Clear the buffer
     */
    clearBuffer(): number;
    /**
     * Update filter criteria
     */
    updateFilter(newFilter: Partial<LogStreamFilter>): void;
    /**
     * Pause the stream
     */
    pause(): void;
    /**
     * Resume the stream
     */
    resume(): void;
    /**
     * Close the stream and cleanup
     */
    close(): void;
    /**
     * Get recent entries from buffer
     */
    getRecentEntries(count?: number): LogEntry[];
    /**
     * Search buffer for entries matching criteria
     */
    searchBuffer(searchFilter: Partial<LogStreamFilter>): LogEntry[];
    /**
     * Export buffer as JSON
     */
    exportBuffer(): string;
}
/**
 * Log stream manager for handling multiple streams
 */
export declare class LogStreamManager extends EventEmitter {
    private readonly streams;
    /**
     * Create a new log stream
     */
    createStream(id: string, name: string, filter?: LogStreamFilter): LogStream;
    /**
     * Get stream by ID
     */
    getStream(id: string): LogStream | undefined;
    /**
     * Remove stream
     */
    removeStream(id: string): boolean;
    /**
     * Get all stream IDs
     */
    getStreamIds(): string[];
    /**
     * Process log entry to all active streams
     */
    processLogEntry(entry: LogEntry): void;
    /**
     * Process batch to all active streams
     */
    processBatch(entries: LogEntry[]): void;
    /**
     * Get manager statistics
     */
    getStats(): {
        totalStreams: number;
        activeStreams: number;
        totalListeners: number;
    };
    /**
     * Close all streams and cleanup
     */
    close(): void;
}
/**
 * Global log stream manager instance
 */
export declare const globalStreamManager: LogStreamManager;
//# sourceMappingURL=LogStream.d.ts.map