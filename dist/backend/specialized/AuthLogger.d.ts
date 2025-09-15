/**
 * T023: Authentication-specific logging implementation
 * CVPlus Logging System - Auth Module Logger
 */
import { BaseLogger } from '../core/BaseLogger';
export declare class AuthLogger extends BaseLogger {
    constructor(serviceName?: string);
    /**
     * Log successful login events
     */
    logLoginSuccess(userId: string, context?: {
        ipAddress?: string;
        userAgent?: string;
        provider?: string;
        correlationId?: string;
    }): string;
    /**
     * Log failed login attempts
     */
    logLoginFailure(email: string, failureReason: string, context?: {
        ipAddress?: string;
        attempts?: number;
        correlationId?: string;
    }): string;
    /**
     * Log password reset events
     */
    logPasswordReset(userId: string, context?: {
        tokenId?: string;
        initiatedBy?: string;
        expiresAt?: string;
        correlationId?: string;
    }): string;
    /**
     * Log session creation
     */
    logSessionCreate(userId: string, sessionId: string, context?: {
        expiresAt?: string;
        deviceInfo?: string;
        correlationId?: string;
    }): string;
    /**
     * Log session termination
     */
    logSessionTerminate(sessionId: string, context?: {
        reason?: string;
        userId?: string;
        correlationId?: string;
    }): string;
    /**
     * Log suspicious authentication activity
     */
    logSuspiciousActivity(pattern: string, context?: {
        ipAddress?: string;
        attempts?: number;
        timeWindow?: string;
        riskScore?: number;
        correlationId?: string;
    }): string;
    /**
     * Log privilege escalation attempts
     */
    logPrivilegeEscalation(userId: string, targetRole: string, context?: {
        currentRole?: string;
        approved?: boolean;
        requestId?: string;
        correlationId?: string;
    }): string;
    /**
     * Log login attempts for correlation tracking
     */
    logLoginAttempt(email: string, context?: {
        provider?: string;
        correlationId?: string;
    }): string;
    /**
     * Log account locked events
     */
    logAccountLocked(context?: {
        userId?: string;
        reason?: string;
        duration?: number;
        correlationId?: string;
    }): string;
    /**
     * Log security notifications sent
     */
    logSecurityNotificationSent(context?: {
        userId?: string;
        notificationType?: string;
        channels?: string[];
        correlationId?: string;
    }): string;
    /**
     * Log authentication performance metrics
     */
    logAuthPerformance(operation: string, context?: {
        duration?: number;
        provider?: string;
        steps?: string[];
        correlationId?: string;
    }): string;
    /**
     * Execute callback with correlation ID context
     */
    withCorrelationId(correlationId: string, callback: () => string): string;
    /**
     * Log suspicious login attempt (for correlation chain testing)
     */
    suspiciousLoginAttempt(context?: {
        userId?: string;
        ipAddress?: string;
        reason?: string;
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
//# sourceMappingURL=AuthLogger.d.ts.map