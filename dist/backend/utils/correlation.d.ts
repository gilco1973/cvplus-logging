/**
 * T019: Correlation ID management utilities
 * CVPlus Logging System - Correlation Tracking
 */
import { CorrelationContext } from '../types/index';
export declare class CorrelationManager {
    private namespace;
    private static instance;
    constructor();
    static getInstance(): CorrelationManager;
    /**
     * Generate a new correlation ID using nanoid
     */
    generateCorrelationId(): string;
    /**
     * Set correlation context for the current execution flow
     */
    setCorrelationContext(context: CorrelationContext): void;
    /**
     * Get current correlation context
     */
    getCorrelationContext(): CorrelationContext | null;
    /**
     * Get current correlation ID
     */
    getCurrentCorrelationId(): string | null;
    /**
     * Execute callback with specific correlation context
     */
    withCorrelation<T>(correlationId: string, callback: () => T): T;
    /**
     * Execute callback with new correlation context
     */
    withNewCorrelation<T>(callback: (correlationId: string) => T): T;
    /**
     * Add user context to current correlation
     */
    addUserContext(userId: string, sessionId?: string): void;
    /**
     * Add request context to current correlation
     */
    addRequestContext(requestId: string, traceId?: string): void;
    /**
     * Create child correlation from parent
     */
    createChildCorrelation(parentCorrelationId?: string): string;
    /**
     * Clear correlation context
     */
    clearCorrelation(): void;
    /**
     * Check if correlation tracking is active
     */
    isCorrelationActive(): boolean;
    /**
     * Get correlation chain information
     */
    getCorrelationChain(): {
        correlationId: string;
        parentId?: string;
        depth: number;
    } | null;
    /**
     * Extract correlation ID from various sources (headers, context, etc.)
     */
    extractCorrelationId(sources: {
        headers?: Record<string, string | string[] | undefined>;
        context?: Record<string, any>;
        query?: Record<string, any>;
    }): string | null;
    /**
     * Validate correlation ID format
     */
    isValidCorrelationId(correlationId: string): boolean;
    /**
     * Sanitize correlation ID to ensure it's safe for logging
     */
    sanitizeCorrelationId(correlationId: string): string | null;
}
export declare const correlationManager: CorrelationManager;
export declare function generateCorrelationId(): string;
export declare function getCurrentCorrelationId(): string | null;
export declare function withCorrelation<T>(correlationId: string, callback: () => T): T;
export declare function withNewCorrelation<T>(callback: (correlationId: string) => T): T;
export declare function extractCorrelationId(sources: {
    headers?: Record<string, string | string[] | undefined>;
    context?: Record<string, any>;
    query?: Record<string, any>;
}): string | null;
export declare function correlationMiddleware(): (req: any, res: any, next: any) => void;
//# sourceMappingURL=correlation.d.ts.map