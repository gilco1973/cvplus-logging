/**
 * T025: Audit trail system in packages/core/src/logging/AuditTrail.ts
 *
 * Implements comprehensive audit logging for compliance (GDPR, SOX, HIPAA)
 * Provides immutable audit logs with integrity verification and retention policies
 */
import { EventEmitter } from 'events';
import { LogEntry, AuditTrail as IAuditTrail, AuditAction, AlertSeverity } from './types/index';
/**
 * Audit event types based on common compliance frameworks
 */
export declare enum AuditEventType {
    USER_LOGIN = "user.login",
    USER_LOGOUT = "user.logout",
    USER_LOGIN_FAILED = "user.login.failed",
    USER_PASSWORD_CHANGED = "user.password.changed",
    USER_PERMISSION_GRANTED = "user.permission.granted",
    USER_PERMISSION_REVOKED = "user.permission.revoked",
    DATA_READ = "data.read",
    DATA_CREATE = "data.create",
    DATA_UPDATE = "data.update",
    DATA_DELETE = "data.delete",
    DATA_EXPORT = "data.export",
    DATA_IMPORT = "data.import",
    SYSTEM_CONFIG_CHANGED = "system.config.changed",
    SYSTEM_USER_CREATED = "system.user.created",
    SYSTEM_USER_DELETED = "system.user.deleted",
    SYSTEM_BACKUP_CREATED = "system.backup.created",
    SYSTEM_RESTORE_PERFORMED = "system.restore.performed",
    PRIVACY_DATA_REQUEST = "privacy.data.request",
    PRIVACY_DATA_DELETION = "privacy.data.deletion",
    PRIVACY_CONSENT_GRANTED = "privacy.consent.granted",
    PRIVACY_CONSENT_REVOKED = "privacy.consent.revoked",
    FINANCIAL_TRANSACTION = "financial.transaction",
    FINANCIAL_REPORT_GENERATED = "financial.report.generated",
    FINANCIAL_DATA_MODIFIED = "financial.data.modified",
    SECURITY_BREACH_DETECTED = "security.breach.detected",
    SECURITY_VULNERABILITY_FOUND = "security.vulnerability.found",
    SECURITY_POLICY_VIOLATION = "security.policy.violation",
    CUSTOM = "custom"
}
/**
 * Audit entry structure
 */
export interface AuditEntry {
    /**
     * Unique audit entry ID
     */
    id: string;
    /**
     * Timestamp of the event
     */
    timestamp: Date;
    /**
     * Type of audit event
     */
    eventType: AuditEventType;
    /**
     * Severity level
     */
    severity: AlertSeverity;
    /**
     * User who performed the action
     */
    userId?: string;
    /**
     * User's email or identifier
     */
    userEmail?: string;
    /**
     * Session ID
     */
    sessionId?: string;
    /**
     * IP address of the user
     */
    ipAddress?: string;
    /**
     * User agent string
     */
    userAgent?: string;
    /**
     * Resource that was affected
     */
    resource?: string;
    /**
     * Resource ID
     */
    resourceId?: string;
    /**
     * Action performed
     */
    action: AuditAction;
    /**
     * Result of the action
     */
    result: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    /**
     * Detailed description
     */
    description: string;
    /**
     * Additional context data
     */
    context: Record<string, any>;
    /**
     * Original request data (if applicable)
     */
    requestData?: Record<string, any>;
    /**
     * Response data (if applicable)
     */
    responseData?: Record<string, any>;
    /**
     * Error information (if result is FAILURE)
     */
    error?: {
        code: string;
        message: string;
        stack?: string;
    };
    /**
     * Geographic location (if available)
     */
    location?: {
        country?: string;
        region?: string;
        city?: string;
        coordinates?: {
            lat: number;
            lon: number;
        };
    };
    /**
     * Compliance tags for regulation mapping
     */
    complianceTags: string[];
    /**
     * Data hash for integrity verification
     */
    hash: string;
    /**
     * Previous entry hash for chain verification
     */
    previousHash?: string;
}
/**
 * Retention policy configuration
 */
export interface RetentionPolicy {
    /**
     * Retention period in days
     */
    retentionDays: number;
    /**
     * Archive after days (move to long-term storage)
     */
    archiveAfterDays?: number;
    /**
     * Compress old entries
     */
    compress?: boolean;
    /**
     * Event types this policy applies to
     */
    eventTypes?: AuditEventType[];
    /**
     * Severity levels this policy applies to
     */
    severities?: AlertSeverity[];
}
/**
 * Audit trail configuration
 */
export interface AuditTrailConfig {
    /**
     * Unique identifier for the audit trail
     */
    id?: string;
    /**
     * Enable audit trail
     */
    enabled: boolean;
    /**
     * Secret key for hash generation
     */
    secretKey: string;
    /**
     * Hash algorithm
     */
    hashAlgorithm: 'sha256' | 'sha512';
    /**
     * Maximum entries to keep in memory
     */
    maxMemoryEntries: number;
    /**
     * Retention policies
     */
    retentionPolicies: RetentionPolicy[];
    /**
     * Enable integrity verification
     */
    enableIntegrityVerification: boolean;
    /**
     * Auto-archive old entries
     */
    autoArchive: boolean;
}
/**
 * Audit trail statistics
 */
export interface AuditTrailStats {
    totalEntries: number;
    entriesByType: Record<AuditEventType, number>;
    entriesBySeverity: Record<AlertSeverity, number>;
    entriesByResult: Record<string, number>;
    oldestEntry?: Date;
    newestEntry?: Date;
    averageEntriesPerDay: number;
    integrityChecksPassed: number;
    integrityChecksFailed: number;
    lastIntegrityCheck?: Date;
}
/**
 * Audit trail implementation
 */
export declare class AuditTrail extends EventEmitter implements IAuditTrail {
    readonly id: string;
    readonly timestamp: string;
    readonly userId: string;
    readonly action: string;
    readonly resource: string;
    readonly outcome: 'success' | 'failure';
    readonly details: Record<string, any>;
    readonly correlationId?: string;
    readonly ipAddress?: string;
    readonly userAgent?: string;
    private readonly config;
    private readonly entries;
    private readonly stats;
    private lastHash?;
    constructor(config: AuditTrailConfig);
    /**
     * Log an audit event
     */
    logEvent(eventType: AuditEventType, action: AuditAction, options?: {
        severity?: AlertSeverity;
        userId?: string;
        userEmail?: string;
        sessionId?: string;
        ipAddress?: string;
        userAgent?: string;
        resource?: string;
        resourceId?: string;
        result?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
        description?: string;
        context?: Record<string, any>;
        requestData?: Record<string, any>;
        responseData?: Record<string, any>;
        error?: {
            code: string;
            message: string;
            stack?: string;
        };
        location?: AuditEntry['location'];
        complianceTags?: string[];
    }): string;
    /**
     * Log from regular log entry
     */
    logFromEntry(logEntry: LogEntry, auditMapping?: {
        eventType?: AuditEventType;
        action?: AuditAction;
        complianceTags?: string[];
    }): string;
    /**
     * Add entry to trail
     */
    private addEntry;
    /**
     * Update statistics
     */
    private updateStats;
    /**
     * Generate unique ID for audit entry
     */
    private generateId;
    /**
     * Generate hash for entry integrity
     */
    private generateEntryHash;
    /**
     * Infer audit event type from log entry
     */
    private inferEventType;
    /**
     * Map log level to audit severity
     */
    private mapLogLevelToAlertSeverity;
    /**
     * Apply retention policies
     */
    private applyRetentionPolicies;
    /**
     * Query audit entries
     */
    query(filters?: {
        eventTypes?: AuditEventType[];
        severities?: AlertSeverity[];
        userIds?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        actions?: AuditAction[];
        results?: ('SUCCESS' | 'FAILURE' | 'PARTIAL')[];
        resources?: string[];
        complianceTags?: string[];
        limit?: number;
        offset?: number;
    }): AuditEntry[];
    /**
     * Verify audit trail integrity
     */
    verifyIntegrity(): {
        isValid: boolean;
        invalidEntries: Array<{
            entry: AuditEntry;
            reason: string;
        }>;
        totalChecked: number;
    };
    /**
     * Get statistics
     */
    getStats(): AuditTrailStats;
    /**
     * Export audit trail for compliance reporting
     */
    exportForCompliance(format?: 'json' | 'csv'): string;
    /**
     * Clear all entries (use with caution!)
     */
    clearAll(): number;
}
/**
 * Global audit trail instance
 */
export declare const globalAuditTrail: AuditTrail;
//# sourceMappingURL=AuditTrail.d.ts.map