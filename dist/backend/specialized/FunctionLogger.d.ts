/**
 * T026: Firebase Functions-specific logging implementation
 * CVPlus Logging System - Function Execution Logger
 */
import { BaseLogger } from '../core/BaseLogger';
export declare class FunctionLogger extends BaseLogger {
    constructor(serviceName?: string);
    /**
     * Log function invocation
     */
    functionInvoked(context?: {
        functionName?: string;
        userId?: string;
        requestId?: string;
        method?: string;
        endpoint?: string;
        headers?: Record<string, any>;
        body?: any;
        context?: any;
        correlationId?: string;
    }): string;
    /**
     * Log function completion
     */
    functionCompleted(context?: {
        functionName?: string;
        userId?: string;
        requestId?: string;
        executionDuration?: number;
        statusCode?: number;
        responseSize?: number;
        memoryUsed?: number;
        billableTime?: number;
        coldStart?: boolean;
        retryAttempt?: number;
        correlationId?: string;
    }): string;
    /**
     * Log function failures
     */
    functionFailed(context?: {
        functionName?: string;
        userId?: string;
        requestId?: string;
        error?: Error;
        executionDuration?: number;
        statusCode?: number;
        memoryUsed?: number;
        retryable?: boolean;
        errorCategory?: string;
        affectedService?: string;
        correlationId?: string;
    }): string;
    /**
     * Log authentication context
     */
    authenticationContext(context?: {
        uid?: string;
        email?: string;
        customClaims?: Record<string, any>;
        tokenValidation?: {
            valid: boolean;
            issuedAt: number;
            expiresAt: number;
        };
        correlationId?: string;
    }): string;
    /**
     * Log authorization failures
     */
    authorizationFailed(context?: {
        uid?: string;
        attemptedAction?: string;
        requiredPermissions?: string[];
        userPermissions?: string[];
        reason?: string;
        endpoint?: string;
        userTier?: string;
        correlationId?: string;
    }): string;
    /**
     * Log external service calls
     */
    externalServiceCall(context?: {
        service?: string;
        endpoint?: string;
        method?: string;
        requestSize?: number;
        responseSize?: number;
        duration?: number;
        statusCode?: number;
        tokens?: {
            input: number;
            output: number;
            total: number;
        };
        cost?: number;
        retryAttempt?: number;
        success?: boolean;
        correlationId?: string;
    }): string;
    /**
     * Log database operations
     */
    databaseOperation(context?: {
        operation?: string;
        collection?: string;
        query?: any;
        resultCount?: number;
        executionTime?: number;
        readUnits?: number;
        writeUnits?: number;
        cacheHit?: boolean;
        indexUsed?: boolean;
        correlationId?: string;
    }): string;
    /**
     * Log resource usage
     */
    resourceUsage(context?: {
        memoryAllocated?: number;
        memoryUsed?: number;
        cpuUsage?: number;
        executionTime?: number;
        timeoutLimit?: number;
        remainingTime?: number;
        concurrentExecutions?: number;
        correlationId?: string;
    }): string;
    /**
     * Log timeout warnings
     */
    timeoutWarning(context?: {
        functionName?: string;
        executionTime?: number;
        timeoutLimit?: number;
        remainingTime?: number;
        warningThreshold?: number;
        currentProgress?: string;
        correlationId?: string;
    }): string;
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry(): import("..").LogEntry | null;
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries(): import("..").LogEntry[];
}
//# sourceMappingURL=FunctionLogger.d.ts.map