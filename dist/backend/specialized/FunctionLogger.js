/**
 * T026: Firebase Functions-specific logging implementation
 * CVPlus Logging System - Function Execution Logger
 */
import { BaseLogger } from '../core/BaseLogger';
import { LogLevel, LogDomain } from '../types';
export class FunctionLogger extends BaseLogger {
    constructor(serviceName = 'firebase-functions') {
        super(serviceName, {
            package: '@cvplus/functions',
            level: LogLevel.INFO
        });
    }
    /**
     * Log function invocation
     */
    functionInvoked(context = {}) {
        var _a;
        return this.log(LogLevel.INFO, 'Firebase Function invoked', {
            domain: LogDomain.SYSTEM,
            event: 'FUNCTION_INVOKED',
            functionName: context.functionName,
            userId: context.userId,
            requestId: context.requestId,
            method: context.method,
            endpoint: context.endpoint,
            eventId: (_a = context.context) === null || _a === void 0 ? void 0 : _a.eventId,
            bodyKeys: context.body ? Object.keys(context.body) : undefined
        });
    }
    /**
     * Log function completion
     */
    functionCompleted(context = {}) {
        const performance = context.executionDuration ? {
            duration: context.executionDuration
        } : undefined;
        return this.log(LogLevel.INFO, 'Firebase Function completed', {
            domain: LogDomain.PERFORMANCE,
            event: 'FUNCTION_COMPLETED',
            functionName: context.functionName,
            userId: context.userId,
            requestId: context.requestId,
            statusCode: context.statusCode,
            responseSize: context.responseSize,
            memoryUsed: context.memoryUsed,
            billableTime: context.billableTime,
            coldStart: context.coldStart,
            retryAttempt: context.retryAttempt,
            outcome: 'success',
            performance
        });
    }
    /**
     * Log function failures
     */
    functionFailed(context = {}) {
        const error = context.error ? {
            message: context.error.message,
            stack: context.error.stack,
            name: context.error.name
        } : undefined;
        const performance = context.executionDuration ? {
            duration: context.executionDuration
        } : undefined;
        return this.log(LogLevel.ERROR, 'Firebase Function failed', {
            domain: LogDomain.SYSTEM,
            event: 'FUNCTION_FAILED',
            functionName: context.functionName,
            userId: context.userId,
            requestId: context.requestId,
            statusCode: context.statusCode,
            memoryUsed: context.memoryUsed,
            retryable: context.retryable,
            errorCategory: context.errorCategory,
            affectedService: context.affectedService,
            outcome: 'error',
            error,
            performance
        });
    }
    /**
     * Log authentication context
     */
    authenticationContext(context = {}) {
        var _a, _b, _c;
        return this.log(LogLevel.INFO, 'Authentication context established', {
            domain: LogDomain.SECURITY,
            event: 'AUTH_CONTEXT_ESTABLISHED',
            uid: context.uid,
            email: '[EMAIL_REDACTED]',
            role: (_a = context.customClaims) === null || _a === void 0 ? void 0 : _a.role,
            tier: (_b = context.customClaims) === null || _b === void 0 ? void 0 : _b.tier,
            tokenValid: (_c = context.tokenValidation) === null || _c === void 0 ? void 0 : _c.valid
        });
    }
    /**
     * Log authorization failures
     */
    authorizationFailed(context = {}) {
        return this.log(LogLevel.WARN, 'Authorization failed', {
            domain: LogDomain.SECURITY,
            event: 'AUTHORIZATION_FAILED',
            uid: context.uid,
            attemptedAction: context.attemptedAction,
            reason: context.reason,
            endpoint: context.endpoint,
            userTier: context.userTier,
            outcome: 'denied'
        });
    }
    /**
     * Log external service calls
     */
    externalServiceCall(context = {}) {
        const performance = context.duration ? {
            duration: context.duration,
            requestSize: context.requestSize,
            responseSize: context.responseSize
        } : undefined;
        return this.log(LogLevel.INFO, 'External service call completed', {
            domain: LogDomain.PERFORMANCE,
            event: 'EXTERNAL_SERVICE_CALL',
            service: context.service,
            endpoint: context.endpoint,
            method: context.method,
            statusCode: context.statusCode,
            tokens: context.tokens,
            cost: context.cost,
            retryAttempt: context.retryAttempt,
            success: context.success,
            performance
        });
    }
    /**
     * Log database operations
     */
    databaseOperation(context = {}) {
        const performance = context.executionTime ? {
            duration: context.executionTime
        } : undefined;
        return this.log(LogLevel.INFO, 'Database operation completed', {
            domain: LogDomain.PERFORMANCE,
            event: 'DATABASE_OPERATION',
            operation: context.operation,
            collection: context.collection,
            resultCount: context.resultCount,
            readUnits: context.readUnits,
            writeUnits: context.writeUnits,
            cacheHit: context.cacheHit,
            indexUsed: context.indexUsed,
            performance
        });
    }
    /**
     * Log resource usage
     */
    resourceUsage(context = {}) {
        const memoryUtilization = context.memoryAllocated && context.memoryUsed
            ? context.memoryUsed / context.memoryAllocated
            : undefined;
        return this.log(LogLevel.INFO, 'Function resource usage recorded', {
            domain: LogDomain.PERFORMANCE,
            event: 'RESOURCE_USAGE',
            memoryAllocated: context.memoryAllocated,
            memoryUsed: context.memoryUsed,
            memoryUtilization,
            cpuUsage: context.cpuUsage,
            concurrentExecutions: context.concurrentExecutions,
            performance: {
                executionTime: context.executionTime,
                timeoutLimit: context.timeoutLimit,
                remainingTime: context.remainingTime
            }
        });
    }
    /**
     * Log timeout warnings
     */
    timeoutWarning(context = {}) {
        return this.log(LogLevel.WARN, 'Function approaching timeout limit', {
            domain: LogDomain.PERFORMANCE,
            event: 'TIMEOUT_WARNING',
            functionName: context.functionName,
            warningThreshold: context.warningThreshold,
            currentProgress: context.currentProgress,
            severity: 'high',
            performance: {
                executionTime: context.executionTime,
                timeoutLimit: context.timeoutLimit,
                remainingTime: context.remainingTime
            }
        });
    }
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry() {
        return super.getLastLogEntry();
    }
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries() {
        return super.getAllLogEntries();
    }
}
//# sourceMappingURL=FunctionLogger.js.map