/**
 * T019: Correlation ID service in packages/core/src/logging/CorrelationService.ts
 *
 * Manages correlation IDs for tracking requests across multiple services and packages
 * Uses Node.js AsyncLocalStorage for context management in async operations
 */
import { AsyncLocalStorage } from 'async_hooks';
import { nanoid } from 'nanoid';
/**
 * Service for managing correlation IDs across async operations
 */
export class CorrelationService {
    /**
     * Generate a new unique correlation ID
     */
    static generateId(prefix) {
        const id = nanoid(12); // 12 character nanoid for good uniqueness and readability
        return prefix ? `${prefix}-${id}` : id;
    }
    /**
     * Set the current correlation ID for the async context
     */
    static setCurrentId(correlationId) {
        const currentContext = this.asyncLocalStorage.getStore();
        const newContext = {
            correlationId,
            parentId: currentContext === null || currentContext === void 0 ? void 0 : currentContext.correlationId,
            startTime: Date.now()
        };
        this.asyncLocalStorage.enterWith(newContext);
    }
    /**
     * Get the current correlation ID from async context
     */
    static getCurrentId() {
        const context = this.asyncLocalStorage.getStore();
        return (context === null || context === void 0 ? void 0 : context.correlationId) || null;
    }
    /**
     * Get the current correlation context (including parent and timing info)
     */
    static getCurrentContext() {
        return this.asyncLocalStorage.getStore() || null;
    }
    /**
     * Execute a function with a specific correlation ID
     */
    static withCorrelationId(correlationId, callback) {
        const currentContext = this.asyncLocalStorage.getStore();
        const newContext = {
            correlationId,
            parentId: currentContext === null || currentContext === void 0 ? void 0 : currentContext.correlationId,
            startTime: Date.now()
        };
        return this.asyncLocalStorage.run(newContext, callback);
    }
    /**
     * Execute a function with a new generated correlation ID
     */
    static withNewCorrelationId(callback, prefix) {
        const correlationId = this.generateId(prefix);
        return this.withCorrelationId(correlationId, callback);
    }
    /**
     * Clear the current correlation context
     */
    static clear() {
        this.asyncLocalStorage.disable();
    }
    /**
     * Create Express middleware for automatic correlation ID handling
     */
    static middleware() {
        return (req, res, next) => {
            // Check for existing correlation ID in headers
            const existingId = req.headers['x-correlation-id'] ||
                req.headers['x-request-id'] ||
                req.headers['correlation-id'];
            const correlationId = existingId || this.generateId('req');
            // Set response header
            res.setHeader('X-Correlation-ID', correlationId);
            // Add to request object for easy access
            req.correlationId = correlationId;
            // Run the rest of the request in correlation context
            this.withCorrelationId(correlationId, () => {
                next();
            });
        };
    }
    /**
     * Create a child correlation ID for nested operations
     */
    static createChild(suffix) {
        const currentId = this.getCurrentId();
        if (!currentId) {
            return this.generateId(suffix);
        }
        const childId = suffix ? `${currentId}.${suffix}` : `${currentId}.${nanoid(6)}`;
        return childId;
    }
    /**
     * Get timing information for the current correlation context
     */
    static getElapsedTime() {
        const context = this.asyncLocalStorage.getStore();
        if (!context) {
            return null;
        }
        return Date.now() - context.startTime;
    }
    /**
     * Create a correlation chain for tracking nested operations
     */
    static createChain() {
        const context = this.asyncLocalStorage.getStore();
        const currentId = (context === null || context === void 0 ? void 0 : context.correlationId) || this.generateId();
        // Calculate depth by counting dots in the ID
        const depth = currentId.split('.').length - 1;
        return {
            parentId: (context === null || context === void 0 ? void 0 : context.parentId) || null,
            currentId,
            depth
        };
    }
    /**
     * Bind a function to preserve correlation context
     */
    static bind(fn) {
        const context = this.asyncLocalStorage.getStore();
        return (...args) => {
            if (context) {
                return this.asyncLocalStorage.run(context, () => fn(...args));
            }
            return fn(...args);
        };
    }
    /**
     * Bind a promise-returning function to preserve correlation context
     */
    static bindAsync(fn) {
        const context = this.asyncLocalStorage.getStore();
        return async (...args) => {
            if (context) {
                return this.asyncLocalStorage.run(context, () => fn(...args));
            }
            return fn(...args);
        };
    }
    /**
     * Get a summary of the correlation chain for debugging
     */
    static getChainSummary() {
        const context = this.asyncLocalStorage.getStore();
        const chain = this.createChain();
        return {
            current: (context === null || context === void 0 ? void 0 : context.correlationId) || null,
            parent: (context === null || context === void 0 ? void 0 : context.parentId) || null,
            elapsedTime: this.getElapsedTime(),
            depth: chain.depth
        };
    }
    /**
     * Utility for debugging correlation context
     */
    static debug() {
        const summary = this.getChainSummary();
        console.log('[CorrelationService Debug]', {
            ...summary,
            hasContext: !!this.asyncLocalStorage.getStore()
        });
    }
}
CorrelationService.asyncLocalStorage = new AsyncLocalStorage();
//# sourceMappingURL=CorrelationService.js.map