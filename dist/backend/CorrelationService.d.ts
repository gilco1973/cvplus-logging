/**
 * T019: Correlation ID service in packages/core/src/logging/CorrelationService.ts
 *
 * Manages correlation IDs for tracking requests across multiple services and packages
 * Uses Node.js AsyncLocalStorage for context management in async operations
 */
import type { Request, Response, NextFunction } from 'express';
interface CorrelationContext {
    correlationId: string;
    parentId?: string;
    startTime: number;
}
/**
 * Service for managing correlation IDs across async operations
 */
export declare class CorrelationService {
    private static asyncLocalStorage;
    /**
     * Generate a new unique correlation ID
     */
    static generateId(prefix?: string): string;
    /**
     * Set the current correlation ID for the async context
     */
    static setCurrentId(correlationId: string): void;
    /**
     * Get the current correlation ID from async context
     */
    static getCurrentId(): string | null;
    /**
     * Get the current correlation context (including parent and timing info)
     */
    static getCurrentContext(): CorrelationContext | null;
    /**
     * Execute a function with a specific correlation ID
     */
    static withCorrelationId<T>(correlationId: string, callback: () => T | Promise<T>): T | Promise<T>;
    /**
     * Execute a function with a new generated correlation ID
     */
    static withNewCorrelationId<T>(callback: () => T | Promise<T>, prefix?: string): T | Promise<T>;
    /**
     * Clear the current correlation context
     */
    static clear(): void;
    /**
     * Create Express middleware for automatic correlation ID handling
     */
    static middleware(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Create a child correlation ID for nested operations
     */
    static createChild(suffix?: string): string;
    /**
     * Get timing information for the current correlation context
     */
    static getElapsedTime(): number | null;
    /**
     * Create a correlation chain for tracking nested operations
     */
    static createChain(): {
        parentId: string | null;
        currentId: string;
        depth: number;
    };
    /**
     * Bind a function to preserve correlation context
     */
    static bind<Args extends any[], Return>(fn: (...args: Args) => Return): (...args: Args) => Return;
    /**
     * Bind a promise-returning function to preserve correlation context
     */
    static bindAsync<Args extends any[], Return>(fn: (...args: Args) => Promise<Return>): (...args: Args) => Promise<Return>;
    /**
     * Get a summary of the correlation chain for debugging
     */
    static getChainSummary(): {
        current: string | null;
        parent: string | null;
        elapsedTime: number | null;
        depth: number;
    };
    /**
     * Utility for debugging correlation context
     */
    static debug(): void;
}
export {};
//# sourceMappingURL=CorrelationService.d.ts.map