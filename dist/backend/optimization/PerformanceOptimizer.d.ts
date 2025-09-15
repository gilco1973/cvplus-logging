/**
 * T056: Performance optimization tools in packages/logging/src/backend/optimization/PerformanceOptimizer.ts
 *
 * Advanced performance optimization utilities for the logging system including
 * batch processing, memory management, connection pooling, and intelligent caching.
 */
import { LogEntry } from '../models/LogEntry';
import { EventEmitter } from 'events';
interface OptimizationConfig {
    batchSize: number;
    batchTimeout: number;
    maxBatchSize: number;
    maxMemoryUsage: number;
    memoryCheckInterval: number;
    gcThreshold: number;
    maxConnections: number;
    connectionTimeout: number;
    idleTimeout: number;
    cacheEnabled: boolean;
    cacheSize: number;
    cacheTtl: number;
    enableMetrics: boolean;
    metricsInterval: number;
    slowQueryThreshold: number;
}
interface PerformanceMetrics {
    logsProcessed: number;
    logsPerSecond: number;
    batchesProcessed: number;
    averageBatchSize: number;
    averageProcessingTime: number;
    slowQueries: number;
    timeouts: number;
    memoryUsage: number;
    maxMemoryUsage: number;
    gcRuns: number;
    activeConnections: number;
    failedConnections: number;
    connectionPoolUtilization: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    errors: number;
    retries: number;
    errorRate: number;
}
export declare class PerformanceOptimizer extends EventEmitter {
    private config;
    private metrics;
    private batchProcessors;
    private connectionPool;
    private cache;
    private logger;
    private metricsTimer?;
    private memoryTimer?;
    private cacheCleanupTimer?;
    private startTime;
    private lastGcTime;
    private processedCount;
    constructor(config?: Partial<OptimizationConfig>);
    private initializeMetrics;
    private initializeOptimization;
    /**
     * Optimize log batch processing
     */
    processBatch(logs: LogEntry[], options?: {
        priority?: 'low' | 'normal' | 'high';
        timeout?: number;
        callback?: (results: any) => void;
    }): Promise<any>;
    private executeBatch;
    private optimizeLogs;
    private processParallel;
    private processSequential;
    private processChunk;
    private processLog;
    private simulateProcessing;
    /**
     * Cache management
     */
    private getFromCache;
    private setCache;
    private getCacheKey;
    /**
     * Memory management
     */
    private startMemoryMonitoring;
    private checkMemoryUsage;
    private triggerGarbageCollection;
    /**
     * Performance metrics collection
     */
    private startMetricsCollection;
    private updatePerformanceMetrics;
    private updateBatchMetrics;
    private handleBatchTimeout;
    private cleanupBatch;
    private startCacheCleanup;
    private cleanupExpiredCache;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): string[];
    /**
     * Update optimization configuration
     */
    updateConfig(newConfig: Partial<OptimizationConfig>): void;
    /**
     * Cleanup and shutdown
     */
    shutdown(): void;
}
export default PerformanceOptimizer;
//# sourceMappingURL=PerformanceOptimizer.d.ts.map