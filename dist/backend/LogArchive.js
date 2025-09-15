/**
 * T026: Log archival system in packages/core/src/logging/LogArchive.ts
 *
 * Manages long-term log storage, compression, and retrieval
 * Provides efficient archival strategies for compliance and cost optimization
 */
import { EventEmitter } from 'events';
import { createGzip, createGunzip } from 'zlib';
/**
 * Archive storage types
 */
export var ArchiveStorageType;
(function (ArchiveStorageType) {
    ArchiveStorageType["FILESYSTEM"] = "filesystem";
    ArchiveStorageType["CLOUD_STORAGE"] = "cloud_storage";
    ArchiveStorageType["DATABASE"] = "database";
    ArchiveStorageType["S3"] = "s3";
    ArchiveStorageType["GCS"] = "gcs";
})(ArchiveStorageType || (ArchiveStorageType = {}));
/**
 * Archive compression types
 */
export var CompressionType;
(function (CompressionType) {
    CompressionType["NONE"] = "none";
    CompressionType["GZIP"] = "gzip";
    CompressionType["BROTLI"] = "brotli";
})(CompressionType || (CompressionType = {}));
/**
 * Log archive system
 */
export class LogArchive extends EventEmitter {
    constructor() {
        super();
        this.policies = new Map();
        this.archives = new Map();
        this.stats = {
            totalArchives: 0,
            totalEntriesArchived: 0,
            totalOriginalSizeBytes: 0,
            totalCompressedSizeBytes: 0,
            averageCompressionRatio: 0,
            archivesByStorageType: {},
            archivesByCompression: {},
            storageEfficiencySavings: 0
        };
        // Initialize stats objects
        Object.values(ArchiveStorageType).forEach(type => {
            this.stats.archivesByStorageType[type] = 0;
        });
        Object.values(CompressionType).forEach(type => {
            this.stats.archivesByCompression[type] = 0;
        });
    }
    /**
     * Add archive policy
     */
    addPolicy(policy) {
        this.policies.set(policy.id, policy);
        this.emit('policy-added', policy);
    }
    /**
     * Remove archive policy
     */
    removePolicy(policyId) {
        const success = this.policies.delete(policyId);
        if (success) {
            this.emit('policy-removed', policyId);
        }
        return success;
    }
    /**
     * Get archive policy
     */
    getPolicy(policyId) {
        return this.policies.get(policyId);
    }
    /**
     * Archive log entries based on policies
     */
    async archiveEntries(entries, policyId) {
        if (entries.length === 0) {
            return [];
        }
        const policiesToApply = policyId
            ? [this.policies.get(policyId)].filter(Boolean)
            : Array.from(this.policies.values());
        const archiveResults = [];
        for (const policy of policiesToApply) {
            const filteredEntries = this.filterEntriesForPolicy(entries, policy);
            if (filteredEntries.length === 0)
                continue;
            const batches = this.createBatches(filteredEntries, policy.batchSize);
            for (const batch of batches) {
                try {
                    const archiveMetadata = await this.createArchive(batch, policy);
                    archiveResults.push(archiveMetadata);
                    this.archives.set(archiveMetadata.id, archiveMetadata);
                    this.updateStats(archiveMetadata);
                    this.emit('archive-created', archiveMetadata);
                }
                catch (error) {
                    this.emit('archive-error', { policy, batch, error });
                }
            }
        }
        return archiveResults;
    }
    /**
     * Filter entries based on policy criteria
     */
    filterEntriesForPolicy(entries, policy) {
        return entries.filter(entry => {
            const entryAge = Date.now() - new Date(entry.timestamp).getTime();
            const archiveThreshold = policy.archiveAfterDays * 24 * 60 * 60 * 1000;
            if (entryAge < archiveThreshold) {
                return false;
            }
            if (policy.levels && !policy.levels.includes(entry.level)) {
                return false;
            }
            if (policy.domains && !policy.domains.includes(entry.domain)) {
                return false;
            }
            if (policy.packages && entry.package && !policy.packages.includes(entry.package)) {
                return false;
            }
            return true;
        });
    }
    /**
     * Create batches of entries for archival
     */
    createBatches(entries, batchSize) {
        const batches = [];
        for (let i = 0; i < entries.length; i += batchSize) {
            batches.push(entries.slice(i, i + batchSize));
        }
        return batches;
    }
    /**
     * Create archive from batch of entries
     */
    async createArchive(entries, policy) {
        const archiveId = this.generateArchiveId();
        const now = new Date();
        // Sort entries by timestamp
        entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const startTime = new Date(entries[0].timestamp);
        const endTime = new Date(entries[entries.length - 1].timestamp);
        // Deduplicate if enabled
        const processedEntries = policy.deduplicate
            ? this.deduplicateEntries(entries)
            : entries;
        // Serialize entries
        const serializedData = JSON.stringify(processedEntries);
        const originalSizeBytes = Buffer.byteLength(serializedData, 'utf8');
        // Compress data
        const { compressedData, compressionRatio } = await this.compressData(serializedData, policy.compression);
        const compressedSizeBytes = compressedData.length;
        // Store archive
        const storagePath = await this.storeArchive(compressedData, archiveId, policy.storageType, policy.storageConfig);
        // Generate checksum
        const checksum = this.generateChecksum(compressedData);
        // Extract metadata
        const levels = [...new Set(processedEntries.map(e => e.level))];
        const domains = [...new Set(processedEntries.map(e => e.domain))];
        const packages = [...new Set(processedEntries.map(e => e.package).filter(Boolean))];
        const metadata = {
            id: archiveId,
            createdAt: now,
            startTime,
            endTime,
            entryCount: processedEntries.length,
            originalSizeBytes,
            compressedSizeBytes,
            compressionRatio,
            storageType: policy.storageType,
            storagePath,
            compressionType: policy.compression,
            policyId: policy.id,
            levels,
            domains,
            packages,
            checksum,
            tags: [],
            customMetadata: {}
        };
        return metadata;
    }
    /**
     * Deduplicate entries
     */
    deduplicateEntries(entries) {
        const seen = new Set();
        return entries.filter(entry => {
            const key = `${entry.timestamp}_${entry.level}_${entry.message}_${entry.correlationId}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    /**
     * Compress data based on compression type
     */
    async compressData(data, compressionType) {
        const originalBuffer = Buffer.from(data, 'utf8');
        switch (compressionType) {
            case CompressionType.NONE:
                return {
                    compressedData: originalBuffer,
                    compressionRatio: 1.0
                };
            case CompressionType.GZIP: {
                const compressedData = await new Promise((resolve, reject) => {
                    const chunks = [];
                    const gzipStream = createGzip();
                    gzipStream.on('data', (chunk) => chunks.push(chunk));
                    gzipStream.on('end', () => resolve(Buffer.concat(chunks)));
                    gzipStream.on('error', reject);
                    gzipStream.end(originalBuffer);
                });
                return {
                    compressedData,
                    compressionRatio: originalBuffer.length / compressedData.length
                };
            }
            default:
                throw new Error(`Unsupported compression type: ${compressionType}`);
        }
    }
    /**
     * Store archive data
     */
    async storeArchive(data, archiveId, storageType, storageConfig) {
        switch (storageType) {
            case ArchiveStorageType.FILESYSTEM: {
                const path = storageConfig.basePath || '/tmp/log-archives';
                const filePath = `${path}/${archiveId}.archive`;
                // In a real implementation, you'd write to filesystem
                // For now, we'll just return the path
                return filePath;
            }
            case ArchiveStorageType.CLOUD_STORAGE: {
                // Implementation would integrate with cloud storage services
                return `cloud://${storageConfig.bucket}/${archiveId}.archive`;
            }
            case ArchiveStorageType.DATABASE: {
                // Implementation would store in database
                return `db://${storageConfig.table}/${archiveId}`;
            }
            case ArchiveStorageType.S3: {
                // Implementation would integrate with AWS S3
                return `s3://${storageConfig.bucket}/${archiveId}.archive`;
            }
            case ArchiveStorageType.GCS: {
                // Implementation would integrate with Google Cloud Storage
                return `gs://${storageConfig.bucket}/${archiveId}.archive`;
            }
            default:
                throw new Error(`Unsupported storage type: ${storageType}`);
        }
    }
    /**
     * Retrieve archived entries
     */
    async retrieveArchive(archiveId, query) {
        const metadata = this.archives.get(archiveId);
        if (!metadata) {
            throw new Error(`Archive not found: ${archiveId}`);
        }
        // Retrieve compressed data
        const compressedData = await this.retrieveArchiveData(metadata.storagePath, metadata.storageType);
        // Verify checksum
        const checksum = this.generateChecksum(compressedData);
        if (checksum !== metadata.checksum) {
            throw new Error(`Archive integrity check failed: ${archiveId}`);
        }
        // Decompress data
        const decompressedData = await this.decompressData(compressedData, metadata.compressionType);
        // Parse entries
        const entries = JSON.parse(decompressedData);
        // Apply query filters if provided
        return query ? this.filterEntriesByQuery(entries, query) : entries;
    }
    /**
     * Retrieve archive data from storage
     */
    async retrieveArchiveData(storagePath, storageType) {
        switch (storageType) {
            case ArchiveStorageType.FILESYSTEM:
                // Implementation would read from filesystem
                return Buffer.from('mock-archived-data');
            case ArchiveStorageType.CLOUD_STORAGE:
            case ArchiveStorageType.S3:
            case ArchiveStorageType.GCS:
                // Implementation would retrieve from cloud storage
                return Buffer.from('mock-cloud-archived-data');
            case ArchiveStorageType.DATABASE:
                // Implementation would retrieve from database
                return Buffer.from('mock-db-archived-data');
            default:
                throw new Error(`Unsupported storage type: ${storageType}`);
        }
    }
    /**
     * Decompress data
     */
    async decompressData(data, compressionType) {
        switch (compressionType) {
            case CompressionType.NONE:
                return data.toString('utf8');
            case CompressionType.GZIP:
                return new Promise((resolve, reject) => {
                    const chunks = [];
                    const gunzipStream = createGunzip();
                    gunzipStream.on('data', (chunk) => chunks.push(chunk));
                    gunzipStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
                    gunzipStream.on('error', reject);
                    gunzipStream.end(data);
                });
            default:
                throw new Error(`Unsupported compression type: ${compressionType}`);
        }
    }
    /**
     * Filter entries by query
     */
    filterEntriesByQuery(entries, query) {
        let filtered = [...entries];
        if (query.dateRange) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                return entryDate >= query.dateRange.start && entryDate <= query.dateRange.end;
            });
        }
        if (query.levels) {
            filtered = filtered.filter(entry => query.levels.includes(entry.level));
        }
        if (query.domains) {
            filtered = filtered.filter(entry => query.domains.includes(entry.domain));
        }
        if (query.packages) {
            filtered = filtered.filter(entry => entry.package && query.packages.includes(entry.package));
        }
        if (query.userIds) {
            filtered = filtered.filter(entry => entry.userId && query.userIds.includes(entry.userId));
        }
        if (query.messagePattern) {
            filtered = filtered.filter(entry => query.messagePattern.test(entry.message));
        }
        // Sort by timestamp
        filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || filtered.length;
        return filtered.slice(offset, offset + limit);
    }
    /**
     * Search across multiple archives
     */
    async searchArchives(query) {
        const relevantArchives = this.findRelevantArchives(query);
        const allEntries = [];
        let totalMatches = 0;
        for (const archiveMetadata of relevantArchives) {
            try {
                const entries = await this.retrieveArchive(archiveMetadata.id, query);
                allEntries.push(...entries);
                totalMatches += entries.length;
            }
            catch (error) {
                this.emit('search-error', { archiveId: archiveMetadata.id, error });
            }
        }
        // Sort all entries by timestamp
        allEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Apply final pagination
        const offset = query.offset || 0;
        const limit = query.limit || allEntries.length;
        return {
            entries: allEntries.slice(offset, offset + limit),
            archivesSearched: relevantArchives.length,
            totalMatches
        };
    }
    /**
     * Find archives relevant to query
     */
    findRelevantArchives(query) {
        return Array.from(this.archives.values()).filter(archive => {
            // Date range filter
            if (query.dateRange) {
                const queryStart = query.dateRange.start;
                const queryEnd = query.dateRange.end;
                // Check if archive time range overlaps with query range
                if (archive.endTime < queryStart || archive.startTime > queryEnd) {
                    return false;
                }
            }
            // Level filter
            if (query.levels && !query.levels.some(level => archive.levels.includes(level))) {
                return false;
            }
            // Domain filter
            if (query.domains && !query.domains.some(domain => archive.domains.includes(domain))) {
                return false;
            }
            // Package filter
            if (query.packages && !query.packages.some(pkg => archive.packages.includes(pkg))) {
                return false;
            }
            return true;
        });
    }
    /**
     * Delete old archives based on policies
     */
    async cleanupArchives() {
        const deletedArchives = [];
        let freedSpaceBytes = 0;
        for (const [archiveId, metadata] of this.archives.entries()) {
            const policy = this.policies.get(metadata.policyId);
            if (!policy || policy.deleteAfterDays === 0)
                continue;
            const archiveAge = Date.now() - metadata.createdAt.getTime();
            const deleteThreshold = policy.deleteAfterDays * 24 * 60 * 60 * 1000;
            if (archiveAge > deleteThreshold) {
                try {
                    await this.deleteArchive(archiveId);
                    deletedArchives.push(archiveId);
                    freedSpaceBytes += metadata.compressedSizeBytes;
                }
                catch (error) {
                    this.emit('cleanup-error', { archiveId, error });
                }
            }
        }
        return { deletedArchives, freedSpaceBytes };
    }
    /**
     * Delete archive
     */
    async deleteArchive(archiveId) {
        const metadata = this.archives.get(archiveId);
        if (!metadata) {
            return false;
        }
        try {
            // Delete from storage (implementation depends on storage type)
            await this.deleteArchiveFromStorage(metadata.storagePath, metadata.storageType);
            // Remove from memory
            this.archives.delete(archiveId);
            // Update stats
            this.stats.totalArchives--;
            this.stats.totalEntriesArchived -= metadata.entryCount;
            this.stats.totalOriginalSizeBytes -= metadata.originalSizeBytes;
            this.stats.totalCompressedSizeBytes -= metadata.compressedSizeBytes;
            this.stats.archivesByStorageType[metadata.storageType]--;
            this.stats.archivesByCompression[metadata.compressionType]--;
            this.emit('archive-deleted', archiveId);
            return true;
        }
        catch (error) {
            this.emit('delete-error', { archiveId, error });
            return false;
        }
    }
    /**
     * Delete archive from storage
     */
    async deleteArchiveFromStorage(storagePath, storageType) {
        // Implementation would delete from actual storage
        // For now, we just simulate the deletion
    }
    /**
     * Utility methods
     */
    generateArchiveId() {
        return `archive_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    generateChecksum(data) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    updateStats(metadata) {
        this.stats.totalArchives++;
        this.stats.totalEntriesArchived += metadata.entryCount;
        this.stats.totalOriginalSizeBytes += metadata.originalSizeBytes;
        this.stats.totalCompressedSizeBytes += metadata.compressedSizeBytes;
        this.stats.archivesByStorageType[metadata.storageType]++;
        this.stats.archivesByCompression[metadata.compressionType]++;
        // Calculate average compression ratio
        if (this.stats.totalOriginalSizeBytes > 0) {
            this.stats.averageCompressionRatio = this.stats.totalOriginalSizeBytes / this.stats.totalCompressedSizeBytes;
        }
        // Calculate storage efficiency savings
        this.stats.storageEfficiencySavings = this.stats.totalOriginalSizeBytes - this.stats.totalCompressedSizeBytes;
        // Update date ranges
        if (!this.stats.oldestArchive || metadata.createdAt < this.stats.oldestArchive) {
            this.stats.oldestArchive = metadata.createdAt;
        }
        if (!this.stats.newestArchive || metadata.createdAt > this.stats.newestArchive) {
            this.stats.newestArchive = metadata.createdAt;
        }
    }
    /**
     * Get archive statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get all archive metadata
     */
    getAllArchives() {
        return Array.from(this.archives.values());
    }
    /**
     * Export archive catalog
     */
    exportCatalog() {
        return JSON.stringify({
            exportTime: new Date().toISOString(),
            stats: this.getStats(),
            policies: Array.from(this.policies.values()),
            archives: Array.from(this.archives.values())
        }, null, 2);
    }
}
/**
 * Global log archive instance
 */
export const globalLogArchive = new LogArchive();
//# sourceMappingURL=LogArchive.js.map