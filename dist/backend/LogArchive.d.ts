/**
 * T026: Log archival system in packages/core/src/logging/LogArchive.ts
 *
 * Manages long-term log storage, compression, and retrieval
 * Provides efficient archival strategies for compliance and cost optimization
 */
import { EventEmitter } from 'events';
import { LogEntry, LogLevel, LogDomain } from './types/index';
/**
 * Archive storage types
 */
export declare enum ArchiveStorageType {
    FILESYSTEM = "filesystem",
    CLOUD_STORAGE = "cloud_storage",
    DATABASE = "database",
    S3 = "s3",
    GCS = "gcs"
}
/**
 * Archive compression types
 */
export declare enum CompressionType {
    NONE = "none",
    GZIP = "gzip",
    BROTLI = "brotli"
}
/**
 * Archive policy configuration
 */
export interface ArchivePolicy {
    /**
     * Policy ID
     */
    id: string;
    /**
     * Policy name
     */
    name: string;
    /**
     * Days after which logs should be archived
     */
    archiveAfterDays: number;
    /**
     * Days after which logs should be deleted (0 = never delete)
     */
    deleteAfterDays: number;
    /**
     * Compression type
     */
    compression: CompressionType;
    /**
     * Storage destination
     */
    storageType: ArchiveStorageType;
    /**
     * Storage configuration
     */
    storageConfig: Record<string, any>;
    /**
     * Log levels to archive
     */
    levels?: LogLevel[];
    /**
     * Log domains to archive
     */
    domains?: LogDomain[];
    /**
     * Packages to archive
     */
    packages?: string[];
    /**
     * Batch size for archival operations
     */
    batchSize: number;
    /**
     * Enable deduplication
     */
    deduplicate: boolean;
    /**
     * Archive metadata retention
     */
    retainMetadata: boolean;
}
/**
 * Archive metadata
 */
export interface ArchiveMetadata {
    /**
     * Archive ID
     */
    id: string;
    /**
     * Archive creation timestamp
     */
    createdAt: Date;
    /**
     * Start time of archived logs
     */
    startTime: Date;
    /**
     * End time of archived logs
     */
    endTime: Date;
    /**
     * Number of entries in archive
     */
    entryCount: number;
    /**
     * Original size in bytes
     */
    originalSizeBytes: number;
    /**
     * Compressed size in bytes
     */
    compressedSizeBytes: number;
    /**
     * Compression ratio
     */
    compressionRatio: number;
    /**
     * Storage type used
     */
    storageType: ArchiveStorageType;
    /**
     * Storage path or identifier
     */
    storagePath: string;
    /**
     * Compression type used
     */
    compressionType: CompressionType;
    /**
     * Policy used for archival
     */
    policyId: string;
    /**
     * Log levels included
     */
    levels: LogLevel[];
    /**
     * Log domains included
     */
    domains: LogDomain[];
    /**
     * Packages included
     */
    packages: string[];
    /**
     * Checksum for integrity verification
     */
    checksum: string;
    /**
     * Tags for categorization
     */
    tags: string[];
    /**
     * Custom metadata
     */
    customMetadata: Record<string, any>;
}
/**
 * Archive query filters
 */
export interface ArchiveQuery {
    /**
     * Date range
     */
    dateRange?: {
        start: Date;
        end: Date;
    };
    /**
     * Log levels
     */
    levels?: LogLevel[];
    /**
     * Log domains
     */
    domains?: LogDomain[];
    /**
     * Packages
     */
    packages?: string[];
    /**
     * User IDs
     */
    userIds?: string[];
    /**
     * Message pattern
     */
    messagePattern?: RegExp;
    /**
     * Tags
     */
    tags?: string[];
    /**
     * Maximum results
     */
    limit?: number;
    /**
     * Result offset
     */
    offset?: number;
}
/**
 * Archive statistics
 */
export interface ArchiveStats {
    totalArchives: number;
    totalEntriesArchived: number;
    totalOriginalSizeBytes: number;
    totalCompressedSizeBytes: number;
    averageCompressionRatio: number;
    archivesByStorageType: Record<ArchiveStorageType, number>;
    archivesByCompression: Record<CompressionType, number>;
    oldestArchive?: Date;
    newestArchive?: Date;
    storageEfficiencySavings: number;
}
/**
 * Log archive system
 */
export declare class LogArchive extends EventEmitter {
    private readonly policies;
    private readonly archives;
    private readonly stats;
    constructor();
    /**
     * Add archive policy
     */
    addPolicy(policy: ArchivePolicy): void;
    /**
     * Remove archive policy
     */
    removePolicy(policyId: string): boolean;
    /**
     * Get archive policy
     */
    getPolicy(policyId: string): ArchivePolicy | undefined;
    /**
     * Archive log entries based on policies
     */
    archiveEntries(entries: LogEntry[], policyId?: string): Promise<ArchiveMetadata[]>;
    /**
     * Filter entries based on policy criteria
     */
    private filterEntriesForPolicy;
    /**
     * Create batches of entries for archival
     */
    private createBatches;
    /**
     * Create archive from batch of entries
     */
    private createArchive;
    /**
     * Deduplicate entries
     */
    private deduplicateEntries;
    /**
     * Compress data based on compression type
     */
    private compressData;
    /**
     * Store archive data
     */
    private storeArchive;
    /**
     * Retrieve archived entries
     */
    retrieveArchive(archiveId: string, query?: ArchiveQuery): Promise<LogEntry[]>;
    /**
     * Retrieve archive data from storage
     */
    private retrieveArchiveData;
    /**
     * Decompress data
     */
    private decompressData;
    /**
     * Filter entries by query
     */
    private filterEntriesByQuery;
    /**
     * Search across multiple archives
     */
    searchArchives(query: ArchiveQuery): Promise<{
        entries: LogEntry[];
        archivesSearched: number;
        totalMatches: number;
    }>;
    /**
     * Find archives relevant to query
     */
    private findRelevantArchives;
    /**
     * Delete old archives based on policies
     */
    cleanupArchives(): Promise<{
        deletedArchives: string[];
        freedSpaceBytes: number;
    }>;
    /**
     * Delete archive
     */
    deleteArchive(archiveId: string): Promise<boolean>;
    /**
     * Delete archive from storage
     */
    private deleteArchiveFromStorage;
    /**
     * Utility methods
     */
    private generateArchiveId;
    private generateChecksum;
    private updateStats;
    /**
     * Get archive statistics
     */
    getStats(): ArchiveStats;
    /**
     * Get all archive metadata
     */
    getAllArchives(): ArchiveMetadata[];
    /**
     * Export archive catalog
     */
    exportCatalog(): string;
}
/**
 * Global log archive instance
 */
export declare const globalLogArchive: LogArchive;
//# sourceMappingURL=LogArchive.d.ts.map