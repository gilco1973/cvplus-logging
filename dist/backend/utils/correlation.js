/**
 * T019: Correlation ID management utilities
 * CVPlus Logging System - Correlation Tracking
 */
import { nanoid } from 'nanoid';
import { createNamespace, getNamespace } from 'cls-hooked';
// Namespace for correlation context storage
const CORRELATION_NAMESPACE = 'cvplus-correlation';
// Correlation context storage
export class CorrelationManager {
    constructor() {
        this.namespace = getNamespace(CORRELATION_NAMESPACE) || createNamespace(CORRELATION_NAMESPACE);
    }
    static getInstance() {
        if (!CorrelationManager.instance) {
            CorrelationManager.instance = new CorrelationManager();
        }
        return CorrelationManager.instance;
    }
    /**
     * Generate a new correlation ID using nanoid
     */
    generateCorrelationId() {
        return nanoid(21); // 21 characters for good uniqueness without being too long
    }
    /**
     * Set correlation context for the current execution flow
     */
    setCorrelationContext(context) {
        this.namespace.set('correlationContext', context);
    }
    /**
     * Get current correlation context
     */
    getCorrelationContext() {
        return this.namespace.get('correlationContext') || null;
    }
    /**
     * Get current correlation ID
     */
    getCurrentCorrelationId() {
        const context = this.getCorrelationContext();
        return (context === null || context === void 0 ? void 0 : context.correlationId) || null;
    }
    /**
     * Execute callback with specific correlation context
     */
    withCorrelation(correlationId, callback) {
        return this.namespace.runAndReturn(() => {
            const existingContext = this.getCorrelationContext() || {};
            this.setCorrelationContext({
                ...existingContext,
                correlationId
            });
            return callback();
        });
    }
    /**
     * Execute callback with new correlation context
     */
    withNewCorrelation(callback) {
        const correlationId = this.generateCorrelationId();
        return this.withCorrelation(correlationId, () => callback(correlationId));
    }
    /**
     * Add user context to current correlation
     */
    addUserContext(userId, sessionId) {
        const context = this.getCorrelationContext();
        this.setCorrelationContext({
            correlationId: (context === null || context === void 0 ? void 0 : context.correlationId) || this.generateCorrelationId(),
            ...context,
            userId,
            sessionId
        });
    }
    /**
     * Add request context to current correlation
     */
    addRequestContext(requestId, traceId) {
        const context = this.getCorrelationContext();
        this.setCorrelationContext({
            correlationId: (context === null || context === void 0 ? void 0 : context.correlationId) || this.generateCorrelationId(),
            ...context,
            requestId,
            traceId
        });
    }
    /**
     * Create child correlation from parent
     */
    createChildCorrelation(parentCorrelationId) {
        const childCorrelationId = this.generateCorrelationId();
        const existingContext = this.getCorrelationContext();
        this.setCorrelationContext({
            ...existingContext,
            correlationId: childCorrelationId,
            parentId: parentCorrelationId || (existingContext === null || existingContext === void 0 ? void 0 : existingContext.correlationId)
        });
        return childCorrelationId;
    }
    /**
     * Clear correlation context
     */
    clearCorrelation() {
        this.namespace.set('correlationContext', null);
    }
    /**
     * Check if correlation tracking is active
     */
    isCorrelationActive() {
        return this.getCurrentCorrelationId() !== null;
    }
    /**
     * Get correlation chain information
     */
    getCorrelationChain() {
        const context = this.getCorrelationContext();
        if (!(context === null || context === void 0 ? void 0 : context.correlationId))
            return null;
        // Calculate depth by counting parent relationships
        let depth = 0;
        let currentContext = context;
        while (currentContext === null || currentContext === void 0 ? void 0 : currentContext.parentId) {
            depth++;
            // In a real implementation, we might look up parent contexts
            // For now, we just increment once and break to avoid infinite loops
            break;
        }
        return {
            correlationId: context.correlationId,
            parentId: context.parentId,
            depth
        };
    }
    /**
     * Extract correlation ID from various sources (headers, context, etc.)
     */
    extractCorrelationId(sources) {
        const { headers = {}, context = {}, query = {} } = sources;
        // Check common correlation header names
        const correlationHeaders = [
            'x-correlation-id',
            'x-request-id',
            'x-trace-id',
            'correlation-id',
            'request-id'
        ];
        for (const headerName of correlationHeaders) {
            const headerValue = headers[headerName];
            if (headerValue && typeof headerValue === 'string') {
                return headerValue;
            }
        }
        // Check context and query parameters
        return context.correlationId ||
            context.requestId ||
            query.correlationId ||
            query.requestId ||
            null;
    }
    /**
     * Validate correlation ID format
     */
    isValidCorrelationId(correlationId) {
        // nanoid generates URL-safe characters: A-Za-z0-9_-
        // Standard length is 21 characters
        return /^[A-Za-z0-9_-]{10,50}$/.test(correlationId);
    }
    /**
     * Sanitize correlation ID to ensure it's safe for logging
     */
    sanitizeCorrelationId(correlationId) {
        if (!correlationId || typeof correlationId !== 'string') {
            return null;
        }
        const trimmed = correlationId.trim();
        return this.isValidCorrelationId(trimmed) ? trimmed : null;
    }
}
// Export singleton instance
export const correlationManager = CorrelationManager.getInstance();
// Convenience functions for common operations
export function generateCorrelationId() {
    return correlationManager.generateCorrelationId();
}
export function getCurrentCorrelationId() {
    return correlationManager.getCurrentCorrelationId();
}
export function withCorrelation(correlationId, callback) {
    return correlationManager.withCorrelation(correlationId, callback);
}
export function withNewCorrelation(callback) {
    return correlationManager.withNewCorrelation(callback);
}
export function extractCorrelationId(sources) {
    return correlationManager.extractCorrelationId(sources);
}
// Express middleware helper for correlation tracking
export function correlationMiddleware() {
    return (req, res, next) => {
        const correlationId = extractCorrelationId({
            headers: req.headers,
            query: req.query
        }) || generateCorrelationId();
        correlationManager.withCorrelation(correlationId, () => {
            // Add correlation ID to response headers
            res.setHeader('X-Correlation-ID', correlationId);
            // Store in request for downstream use
            req.correlationId = correlationId;
            next();
        });
    };
}
//# sourceMappingURL=correlation.js.map