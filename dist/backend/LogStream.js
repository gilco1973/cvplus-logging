/**
 * T023: Log stream management in packages/core/src/logging/LogStream.ts
 *
 * Manages log streams for real-time log processing and filtering
 * Provides event-driven log streaming capabilities for dashboards and monitoring
 */
import { EventEmitter } from 'events';
import { LogLevel, LogDomain } from './types';
import { PiiRedaction } from './PiiRedaction';
/**
 * Real-time log stream manager
 */
export class LogStream extends EventEmitter {
    constructor(id, name, packageName, domain = LogDomain.SYSTEM, level = LogLevel.INFO, filter = {}) {
        super();
        this.enabled = true;
        this.buffer = [];
        this.isActive = true;
        this.id = id;
        this.name = name;
        this.package = packageName;
        this.domain = domain;
        this.level = level;
        this.filter = {
            maxBufferSize: 1000,
            redactPii: true,
            ...filter
        };
        this.stats = {
            totalReceived: 0,
            totalFiltered: 0,
            totalEmitted: 0,
            bufferSize: 0,
            activeListeners: 0,
            createdAt: new Date(),
            lastActivity: new Date()
        };
        // Track listener changes
        this.on('newListener', () => {
            this.stats.activeListeners = this.listenerCount('log') + this.listenerCount('batch');
        });
        this.on('removeListener', () => {
            this.stats.activeListeners = this.listenerCount('log') + this.listenerCount('batch');
        });
    }
    /**
     * Get stream ID
     */
    getId() {
        return this.id;
    }
    /**
     * Get stream name
     */
    getName() {
        return this.name;
    }
    /**
     * Get stream filter
     */
    getFilter() {
        return { ...this.filter };
    }
    /**
     * Check if stream is active
     */
    isStreamActive() {
        return this.isActive;
    }
    /**
     * Process new log entry
     */
    processLogEntry(entry) {
        if (!this.isActive) {
            return;
        }
        this.stats.totalReceived++;
        this.stats.lastActivity = new Date();
        // Apply filters
        if (!this.passesFilter(entry)) {
            this.stats.totalFiltered++;
            return;
        }
        // Apply PII redaction if enabled
        let processedEntry = entry;
        if (this.filter.redactPii) {
            processedEntry = PiiRedaction.redactLogEntry(entry);
        }
        // Add to buffer
        this.addToBuffer(processedEntry);
        // Emit the log entry
        this.emit('log', processedEntry);
        this.stats.totalEmitted++;
        // Update buffer size stat
        this.stats.bufferSize = this.buffer.length;
    }
    /**
     * Process batch of log entries
     */
    processBatch(entries) {
        if (!this.isActive || entries.length === 0) {
            return;
        }
        const processedEntries = [];
        entries.forEach(entry => {
            this.stats.totalReceived++;
            if (this.passesFilter(entry)) {
                let processedEntry = entry;
                if (this.filter.redactPii) {
                    processedEntry = PiiRedaction.redactLogEntry(entry);
                }
                processedEntries.push(processedEntry);
                this.addToBuffer(processedEntry);
            }
            else {
                this.stats.totalFiltered++;
            }
        });
        if (processedEntries.length > 0) {
            this.emit('batch', processedEntries);
            this.stats.totalEmitted += processedEntries.length;
            this.stats.lastActivity = new Date();
        }
        this.stats.bufferSize = this.buffer.length;
    }
    /**
     * Check if log entry passes the filter criteria
     */
    passesFilter(entry) {
        // Level filter
        if (this.filter.levels && !this.filter.levels.includes(entry.level)) {
            return false;
        }
        // Domain filter
        if (this.filter.domains && entry.domain && !this.filter.domains.includes(entry.domain)) {
            return false;
        }
        // Package filter
        if (this.filter.packages && entry.package && !this.filter.packages.includes(entry.package)) {
            return false;
        }
        // User ID filter
        if (this.filter.userId && entry.userId !== this.filter.userId) {
            return false;
        }
        // Session ID filter
        if (this.filter.sessionId && entry.sessionId !== this.filter.sessionId) {
            return false;
        }
        // Correlation ID pattern filter
        if (this.filter.correlationIdPattern && !this.filter.correlationIdPattern.test(entry.correlationId)) {
            return false;
        }
        // Time range filter
        if (this.filter.timeRange) {
            const entryTime = new Date(entry.timestamp);
            if (entryTime < this.filter.timeRange.start || entryTime > this.filter.timeRange.end) {
                return false;
            }
        }
        // Message pattern filter
        if (this.filter.messagePattern && !this.filter.messagePattern.test(entry.message)) {
            return false;
        }
        return true;
    }
    /**
     * Add entry to buffer with size management
     */
    addToBuffer(entry) {
        const maxSize = this.filter.maxBufferSize || 1000;
        this.buffer.push(entry);
        // Remove old entries if buffer is full
        if (this.buffer.length > maxSize) {
            const droppedCount = this.buffer.length - maxSize;
            this.buffer.splice(0, droppedCount);
            this.emit('buffer-full', droppedCount);
        }
    }
    /**
     * Get buffered log entries
     */
    getBuffer() {
        return [...this.buffer];
    }
    /**
     * Get stream statistics
     */
    getStats() {
        return {
            ...this.stats,
            bufferSize: this.buffer.length,
            activeListeners: this.listenerCount('log') + this.listenerCount('batch')
        };
    }
    /**
     * Clear the buffer
     */
    clearBuffer() {
        const clearedCount = this.buffer.length;
        this.buffer.length = 0;
        this.stats.bufferSize = 0;
        return clearedCount;
    }
    /**
     * Update filter criteria
     */
    updateFilter(newFilter) {
        Object.assign(this.filter, newFilter);
    }
    /**
     * Pause the stream
     */
    pause() {
        this.isActive = false;
    }
    /**
     * Resume the stream
     */
    resume() {
        this.isActive = true;
    }
    /**
     * Close the stream and cleanup
     */
    close() {
        this.isActive = false;
        this.buffer.length = 0;
        this.removeAllListeners();
    }
    /**
     * Get recent entries from buffer
     */
    getRecentEntries(count = 100) {
        const startIndex = Math.max(0, this.buffer.length - count);
        return this.buffer.slice(startIndex);
    }
    /**
     * Search buffer for entries matching criteria
     */
    searchBuffer(searchFilter) {
        return this.buffer.filter(entry => {
            // Create temporary stream with search filter to use existing filter logic
            const tempStream = new LogStream('temp', 'temp', 'temp', LogDomain.SYSTEM, LogLevel.INFO, searchFilter);
            return tempStream.passesFilter(entry);
        });
    }
    /**
     * Export buffer as JSON
     */
    exportBuffer() {
        return JSON.stringify({
            streamId: this.id,
            streamName: this.name,
            exportTime: new Date().toISOString(),
            stats: this.getStats(),
            entries: this.buffer
        }, null, 2);
    }
}
/**
 * Log stream manager for handling multiple streams
 */
export class LogStreamManager extends EventEmitter {
    constructor() {
        super(...arguments);
        this.streams = new Map();
    }
    /**
     * Create a new log stream
     */
    createStream(id, name, filter = {}) {
        if (this.streams.has(id)) {
            throw new Error(`Stream with ID '${id}' already exists`);
        }
        const stream = new LogStream(id, name, 'default', LogDomain.SYSTEM, LogLevel.INFO, filter);
        this.streams.set(id, stream);
        // Forward stream events
        stream.on('log', (entry) => this.emit('stream-log', id, entry));
        stream.on('batch', (entries) => this.emit('stream-batch', id, entries));
        stream.on('error', (error) => this.emit('stream-error', id, error));
        stream.on('buffer-full', (count) => this.emit('stream-buffer-full', id, count));
        this.emit('stream-created', id, stream);
        return stream;
    }
    /**
     * Get stream by ID
     */
    getStream(id) {
        return this.streams.get(id);
    }
    /**
     * Remove stream
     */
    removeStream(id) {
        const stream = this.streams.get(id);
        if (stream) {
            stream.close();
            this.streams.delete(id);
            this.emit('stream-removed', id);
            return true;
        }
        return false;
    }
    /**
     * Get all stream IDs
     */
    getStreamIds() {
        return Array.from(this.streams.keys());
    }
    /**
     * Process log entry to all active streams
     */
    processLogEntry(entry) {
        this.streams.forEach(stream => {
            stream.processLogEntry(entry);
        });
    }
    /**
     * Process batch to all active streams
     */
    processBatch(entries) {
        this.streams.forEach(stream => {
            stream.processBatch(entries);
        });
    }
    /**
     * Get manager statistics
     */
    getStats() {
        const activeStreams = Array.from(this.streams.values()).filter(s => s.isStreamActive()).length;
        const totalListeners = Array.from(this.streams.values()).reduce((sum, stream) => {
            return sum + stream.getStats().activeListeners;
        }, 0);
        return {
            totalStreams: this.streams.size,
            activeStreams,
            totalListeners
        };
    }
    /**
     * Close all streams and cleanup
     */
    close() {
        this.streams.forEach(stream => stream.close());
        this.streams.clear();
        this.removeAllListeners();
    }
}
/**
 * Global log stream manager instance
 */
export const globalStreamManager = new LogStreamManager();
//# sourceMappingURL=LogStream.js.map