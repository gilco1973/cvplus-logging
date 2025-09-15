/**
 * T026: Security-specific logging implementation
 * CVPlus Logging System - Security Event Logger
 */
import { BaseLogger } from '../core/BaseLogger';
import { LogLevel, LogDomain } from '../types';
export class SecurityLogger extends BaseLogger {
    constructor(serviceName = 'security-service') {
        super(serviceName, {
            package: '@cvplus/auth',
            level: LogLevel.WARN
        });
    }
    /**
     * Log brute force attack detection
     */
    bruteForceDetected(context = {}) {
        return this.log(LogLevel.ERROR, 'Brute force attack detected', {
            domain: LogDomain.SECURITY,
            event: 'BRUTE_FORCE_DETECTED',
            ipAddress: context.ipAddress,
            targetEmail: '[EMAIL_REDACTED]', // PII redacted
            attemptCount: context.attemptCount,
            timeWindow: context.timeWindow,
            actionTaken: context.actionTaken,
            blockDuration: context.blockDuration,
            severity: 'critical'
        });
    }
    /**
     * Log account takeover attempts
     */
    accountTakeoverAttempt(context = {}) {
        return this.log(LogLevel.ERROR, 'Account takeover attempt detected', {
            domain: LogDomain.SECURITY,
            event: 'ACCOUNT_TAKEOVER_ATTEMPT',
            userId: context.userId,
            suspiciousActivities: context.suspiciousActivities,
            riskScore: context.riskScore,
            actionTaken: context.actionTaken,
            notificationSent: context.notificationSent,
            severity: 'critical'
        });
    }
    /**
     * Log MFA bypass attempts
     */
    mfaBypassAttempt(context = {}) {
        return this.log(LogLevel.ERROR, 'MFA bypass attempt detected', {
            domain: LogDomain.SECURITY,
            event: 'MFA_BYPASS_ATTEMPT',
            userId: context.userId,
            bypassMethod: context.bypassMethod,
            attemptedFactors: context.attemptedFactors,
            suspicionLevel: context.suspicionLevel,
            actionTaken: context.actionTaken,
            alertLevel: context.alertLevel,
            severity: 'critical'
        });
    }
    /**
     * Log privilege escalation attempts
     */
    privilegeEscalationAttempt(context = {}) {
        return this.log(LogLevel.ERROR, 'Privilege escalation attempt detected', {
            domain: LogDomain.SECURITY,
            event: 'PRIVILEGE_ESCALATION_ATTEMPT',
            userId: context.userId,
            currentRole: context.currentRole,
            attemptedRole: context.attemptedRole,
            method: context.method,
            endpoint: context.endpoint,
            actionTaken: context.actionTaken,
            alertSent: context.alertSent,
            severity: 'high'
        });
    }
    /**
     * Log unauthorized API access attempts
     */
    unauthorizedAPIAccess(context = {}) {
        return this.log(LogLevel.WARN, 'Unauthorized API access attempt', {
            domain: LogDomain.SECURITY,
            event: 'UNAUTHORIZED_API_ACCESS',
            userId: context.userId,
            endpoint: context.endpoint,
            method: context.method,
            userTier: context.userTier,
            requiredTier: context.requiredTier,
            responseCode: context.responseCode,
            actionTaken: context.actionTaken
        });
    }
    /**
     * Log sensitive data access events
     */
    sensitiveDataAccess(context = {}) {
        var _a;
        const performance = context.duration ? {
            duration: context.duration
        } : undefined;
        return this.log(LogLevel.INFO, 'Sensitive data accessed', {
            domain: LogDomain.AUDIT,
            event: 'SENSITIVE_DATA_ACCESS',
            userId: context.userId,
            adminUserId: context.adminUserId,
            dataType: context.dataType,
            accessReason: context.accessReason,
            accessedFieldsCount: (_a = context.accessedFields) === null || _a === void 0 ? void 0 : _a.length,
            complianceNote: context.complianceNote,
            performance
        });
    }
    /**
     * Log data privacy requests
     */
    dataPrivacyRequest(context = {}) {
        var _a;
        const performance = context.processingTime ? {
            duration: context.processingTime
        } : undefined;
        return this.log(LogLevel.INFO, 'Data privacy request processed', {
            domain: LogDomain.AUDIT,
            event: 'DATA_PRIVACY_REQUEST',
            userId: context.userId,
            requestType: context.requestType,
            requestId: context.requestId,
            legalBasis: context.legalBasis,
            status: context.status,
            deliveryMethod: context.deliveryMethod,
            requestedDataTypes: (_a = context.requestedData) === null || _a === void 0 ? void 0 : _a.length,
            performance
        });
    }
    /**
     * Log suspicious system activity
     */
    systemSuspiciousActivity(context = {}) {
        var _a, _b;
        return this.log(LogLevel.ERROR, 'Suspicious system activity detected', {
            domain: LogDomain.SECURITY,
            event: 'SYSTEM_SUSPICIOUS_ACTIVITY',
            pattern: context.pattern,
            timeWindow: context.timeWindow,
            percentageIncrease: (_a = context.metrics) === null || _a === void 0 ? void 0 : _a.percentageIncrease,
            affectedEndpointsCount: (_b = context.affectedEndpoints) === null || _b === void 0 ? void 0 : _b.length,
            potentialThreat: context.potentialThreat,
            riskLevel: context.riskLevel,
            actionTaken: context.actionTaken,
            severity: 'high'
        });
    }
    /**
     * Log security configuration changes
     */
    securityConfigurationChange(context = {}) {
        var _a;
        return this.log(LogLevel.WARN, 'Security configuration changed', {
            domain: LogDomain.AUDIT,
            event: 'SECURITY_CONFIGURATION_CHANGE',
            adminUserId: context.adminUserId,
            configType: context.configType,
            changedSettingsCount: (_a = context.changedSettings) === null || _a === void 0 ? void 0 : _a.length,
            changeReason: context.changeReason,
            approvalId: context.approvalId,
            rollbackPlan: context.rollbackPlan
        });
    }
    /**
     * Execute callback with correlation ID context
     */
    withCorrelation(correlationId, callback) {
        return super.withCorrelation(correlationId, callback);
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
//# sourceMappingURL=SecurityLogger.js.map