/**
 * T026: Security-specific logging implementation
 * CVPlus Logging System - Security Event Logger
 */
import { BaseLogger } from '../core/BaseLogger';
export declare class SecurityLogger extends BaseLogger {
    constructor(serviceName?: string);
    /**
     * Log brute force attack detection
     */
    bruteForceDetected(context?: {
        ipAddress?: string;
        targetEmail?: string;
        attemptCount?: number;
        timeWindow?: string;
        firstAttempt?: string;
        lastAttempt?: string;
        userAgent?: string;
        actionTaken?: string;
        blockDuration?: number;
        correlationId?: string;
    }): string;
    /**
     * Log account takeover attempts
     */
    accountTakeoverAttempt(context?: {
        userId?: string;
        suspiciousActivities?: string[];
        riskScore?: number;
        ipAddress?: string;
        deviceFingerprint?: string;
        geoLocation?: string;
        userAgent?: string;
        actionTaken?: string;
        notificationSent?: boolean;
        correlationId?: string;
    }): string;
    /**
     * Log MFA bypass attempts
     */
    mfaBypassAttempt(context?: {
        userId?: string;
        bypassMethod?: string;
        attemptedFactors?: string[];
        ipAddress?: string;
        deviceId?: string;
        geoLocation?: string;
        timeFromLastLogin?: number;
        suspicionLevel?: string;
        actionTaken?: string;
        alertLevel?: string;
        correlationId?: string;
    }): string;
    /**
     * Log privilege escalation attempts
     */
    privilegeEscalationAttempt(context?: {
        userId?: string;
        currentRole?: string;
        attemptedRole?: string;
        method?: string;
        endpoint?: string;
        ipAddress?: string;
        sessionId?: string;
        timestamp?: string;
        actionTaken?: string;
        alertSent?: boolean;
        correlationId?: string;
    }): string;
    /**
     * Log unauthorized API access attempts
     */
    unauthorizedAPIAccess(context?: {
        userId?: string;
        endpoint?: string;
        method?: string;
        userTier?: string;
        requiredTier?: string;
        ipAddress?: string;
        userAgent?: string;
        referer?: string | null;
        timestamp?: string;
        responseCode?: number;
        actionTaken?: string;
        correlationId?: string;
    }): string;
    /**
     * Log sensitive data access events
     */
    sensitiveDataAccess(context?: {
        userId?: string;
        adminUserId?: string;
        dataType?: string;
        accessReason?: string;
        ticketId?: string;
        accessedFields?: string[];
        ipAddress?: string;
        timestamp?: string;
        duration?: number;
        complianceNote?: string;
        correlationId?: string;
    }): string;
    /**
     * Log data privacy requests
     */
    dataPrivacyRequest(context?: {
        userId?: string;
        requestType?: string;
        requestId?: string;
        requestedData?: string[];
        legalBasis?: string;
        processingTime?: number;
        status?: string;
        deliveryMethod?: string;
        ipAddress?: string;
        correlationId?: string;
    }): string;
    /**
     * Log suspicious system activity
     */
    systemSuspiciousActivity(context?: {
        pattern?: string;
        metrics?: {
            normalBaseline: number;
            currentRate: number;
            percentageIncrease: number;
        };
        timeWindow?: string;
        affectedEndpoints?: string[];
        potentialThreat?: string;
        riskLevel?: string;
        actionTaken?: string;
        alertsSent?: string[];
        correlationId?: string;
    }): string;
    /**
     * Log security configuration changes
     */
    securityConfigurationChange(context?: {
        adminUserId?: string;
        configType?: string;
        changedSettings?: Array<{
            setting: string;
            oldValue: string;
            newValue: string;
        }>;
        changeReason?: string;
        approvalId?: string;
        ipAddress?: string;
        timestamp?: string;
        rollbackPlan?: string;
        correlationId?: string;
    }): string;
    /**
     * Execute callback with correlation ID context
     */
    withCorrelation(correlationId: string, callback: () => string): string;
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry(): import("..").LogEntry | null;
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries(): import("..").LogEntry[];
}
//# sourceMappingURL=SecurityLogger.d.ts.map