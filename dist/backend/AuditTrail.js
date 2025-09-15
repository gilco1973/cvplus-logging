/**
 * T025: Audit trail system in packages/core/src/logging/AuditTrail.ts
 *
 * Implements comprehensive audit logging for compliance (GDPR, SOX, HIPAA)
 * Provides immutable audit logs with integrity verification and retention policies
 */
import { EventEmitter } from 'events';
import { createHmac } from 'crypto';
import { AuditAction, AlertSeverity } from './types/index';
/**
 * Audit event types based on common compliance frameworks
 */
export var AuditEventType;
(function (AuditEventType) {
    // Authentication & Authorization
    AuditEventType["USER_LOGIN"] = "user.login";
    AuditEventType["USER_LOGOUT"] = "user.logout";
    AuditEventType["USER_LOGIN_FAILED"] = "user.login.failed";
    AuditEventType["USER_PASSWORD_CHANGED"] = "user.password.changed";
    AuditEventType["USER_PERMISSION_GRANTED"] = "user.permission.granted";
    AuditEventType["USER_PERMISSION_REVOKED"] = "user.permission.revoked";
    // Data Access & Manipulation
    AuditEventType["DATA_READ"] = "data.read";
    AuditEventType["DATA_CREATE"] = "data.create";
    AuditEventType["DATA_UPDATE"] = "data.update";
    AuditEventType["DATA_DELETE"] = "data.delete";
    AuditEventType["DATA_EXPORT"] = "data.export";
    AuditEventType["DATA_IMPORT"] = "data.import";
    // System Administration
    AuditEventType["SYSTEM_CONFIG_CHANGED"] = "system.config.changed";
    AuditEventType["SYSTEM_USER_CREATED"] = "system.user.created";
    AuditEventType["SYSTEM_USER_DELETED"] = "system.user.deleted";
    AuditEventType["SYSTEM_BACKUP_CREATED"] = "system.backup.created";
    AuditEventType["SYSTEM_RESTORE_PERFORMED"] = "system.restore.performed";
    // Privacy & GDPR
    AuditEventType["PRIVACY_DATA_REQUEST"] = "privacy.data.request";
    AuditEventType["PRIVACY_DATA_DELETION"] = "privacy.data.deletion";
    AuditEventType["PRIVACY_CONSENT_GRANTED"] = "privacy.consent.granted";
    AuditEventType["PRIVACY_CONSENT_REVOKED"] = "privacy.consent.revoked";
    // Financial (SOX Compliance)
    AuditEventType["FINANCIAL_TRANSACTION"] = "financial.transaction";
    AuditEventType["FINANCIAL_REPORT_GENERATED"] = "financial.report.generated";
    AuditEventType["FINANCIAL_DATA_MODIFIED"] = "financial.data.modified";
    // Security Events
    AuditEventType["SECURITY_BREACH_DETECTED"] = "security.breach.detected";
    AuditEventType["SECURITY_VULNERABILITY_FOUND"] = "security.vulnerability.found";
    AuditEventType["SECURITY_POLICY_VIOLATION"] = "security.policy.violation";
    // Custom Events
    AuditEventType["CUSTOM"] = "custom";
})(AuditEventType || (AuditEventType = {}));
/**
 * Audit trail implementation
 */
export class AuditTrail extends EventEmitter {
    constructor(config) {
        super();
        this.entries = [];
        this.config = { ...config };
        // Initialize IAuditTrail interface properties (with defaults)
        this.id = config.id || `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.timestamp = new Date().toISOString();
        this.userId = 'system'; // Default system user
        this.action = 'initialize';
        this.resource = 'audit-trail';
        this.outcome = 'success';
        this.details = { config: this.config };
        this.stats = {
            totalEntries: 0,
            entriesByType: {},
            entriesBySeverity: {},
            entriesByResult: {},
            averageEntriesPerDay: 0,
            integrityChecksPassed: 0,
            integrityChecksFailed: 0
        };
        // Initialize stats objects
        Object.values(AuditEventType).forEach(type => {
            this.stats.entriesByType[type] = 0;
        });
        Object.values(AlertSeverity).forEach(severity => {
            this.stats.entriesBySeverity[severity] = 0;
        });
    }
    /**
     * Log an audit event
     */
    logEvent(eventType, action, options = {}) {
        if (!this.config.enabled) {
            return '';
        }
        const entry = {
            id: this.generateId(),
            timestamp: new Date(),
            eventType,
            severity: options.severity || AlertSeverity.INFO,
            userId: options.userId,
            userEmail: options.userEmail,
            sessionId: options.sessionId,
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            resource: options.resource,
            resourceId: options.resourceId,
            action,
            result: options.result || 'SUCCESS',
            description: options.description || `${eventType} performed`,
            context: options.context || {},
            requestData: options.requestData,
            responseData: options.responseData,
            error: options.error,
            location: options.location,
            complianceTags: options.complianceTags || [],
            hash: '',
            previousHash: this.lastHash
        };
        // Generate hash for integrity
        entry.hash = this.generateEntryHash(entry);
        this.lastHash = entry.hash;
        // Add to entries
        this.addEntry(entry);
        this.emit('audit-logged', entry);
        return entry.id;
    }
    /**
     * Log from regular log entry
     */
    logFromEntry(logEntry, auditMapping) {
        const eventType = (auditMapping === null || auditMapping === void 0 ? void 0 : auditMapping.eventType) || this.inferEventType(logEntry);
        const action = (auditMapping === null || auditMapping === void 0 ? void 0 : auditMapping.action) || AuditAction.READ;
        const severity = this.mapLogLevelToAlertSeverity(logEntry.level);
        return this.logEvent(eventType, action, {
            severity,
            userId: logEntry.userId,
            sessionId: logEntry.sessionId,
            description: logEntry.message,
            context: logEntry.context,
            error: logEntry.error ? {
                code: logEntry.error.code || 'UNKNOWN',
                message: logEntry.error.message,
                stack: logEntry.error.stack
            } : undefined,
            complianceTags: (auditMapping === null || auditMapping === void 0 ? void 0 : auditMapping.complianceTags) || []
        });
    }
    /**
     * Add entry to trail
     */
    addEntry(entry) {
        this.entries.push(entry);
        // Update statistics
        this.updateStats(entry);
        // Manage memory usage
        if (this.entries.length > this.config.maxMemoryEntries) {
            const removed = this.entries.shift();
            if (removed) {
                this.emit('entry-archived', removed);
            }
        }
        // Apply retention policies
        this.applyRetentionPolicies();
    }
    /**
     * Update statistics
     */
    updateStats(entry) {
        this.stats.totalEntries++;
        this.stats.entriesByType[entry.eventType]++;
        this.stats.entriesBySeverity[entry.severity]++;
        this.stats.entriesByResult[entry.result] = (this.stats.entriesByResult[entry.result] || 0) + 1;
        if (!this.stats.oldestEntry || entry.timestamp < this.stats.oldestEntry) {
            this.stats.oldestEntry = entry.timestamp;
        }
        if (!this.stats.newestEntry || entry.timestamp > this.stats.newestEntry) {
            this.stats.newestEntry = entry.timestamp;
        }
        // Calculate average entries per day
        if (this.stats.oldestEntry && this.stats.newestEntry) {
            const daysDiff = Math.max(1, Math.ceil((this.stats.newestEntry.getTime() - this.stats.oldestEntry.getTime()) / (1000 * 60 * 60 * 24)));
            this.stats.averageEntriesPerDay = this.stats.totalEntries / daysDiff;
        }
    }
    /**
     * Generate unique ID for audit entry
     */
    generateId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    /**
     * Generate hash for entry integrity
     */
    generateEntryHash(entry) {
        const dataToHash = {
            id: entry.id,
            timestamp: entry.timestamp.toISOString(),
            eventType: entry.eventType,
            userId: entry.userId,
            action: entry.action,
            result: entry.result,
            description: entry.description,
            context: entry.context,
            previousHash: entry.previousHash
        };
        const serialized = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());
        return createHmac(this.config.hashAlgorithm, this.config.secretKey)
            .update(serialized)
            .digest('hex');
    }
    /**
     * Infer audit event type from log entry
     */
    inferEventType(logEntry) {
        const message = logEntry.message.toLowerCase();
        if (message.includes('login'))
            return AuditEventType.USER_LOGIN;
        if (message.includes('logout'))
            return AuditEventType.USER_LOGOUT;
        if (message.includes('password'))
            return AuditEventType.USER_PASSWORD_CHANGED;
        if (message.includes('created'))
            return AuditEventType.DATA_CREATE;
        if (message.includes('updated'))
            return AuditEventType.DATA_UPDATE;
        if (message.includes('deleted'))
            return AuditEventType.DATA_DELETE;
        if (message.includes('export'))
            return AuditEventType.DATA_EXPORT;
        if (message.includes('import'))
            return AuditEventType.DATA_IMPORT;
        return AuditEventType.CUSTOM;
    }
    /**
     * Map log level to audit severity
     */
    mapLogLevelToAlertSeverity(level) {
        switch (level.toLowerCase()) {
            case 'debug':
                return AlertSeverity.LOW;
            case 'info':
                return AlertSeverity.INFO;
            case 'warn':
                return AlertSeverity.MEDIUM;
            case 'error':
                return AlertSeverity.HIGH;
            case 'fatal':
                return AlertSeverity.CRITICAL;
            default:
                return AlertSeverity.INFO;
        }
    }
    /**
     * Apply retention policies
     */
    applyRetentionPolicies() {
        if (!this.config.autoArchive)
            return;
        const now = new Date();
        this.config.retentionPolicies.forEach(policy => {
            const cutoffDate = new Date(now.getTime() - (policy.retentionDays * 24 * 60 * 60 * 1000));
            // Find entries that should be removed based on retention policy
            const indicesToRemove = [];
            this.entries.forEach((entry, index) => {
                if (entry.timestamp < cutoffDate) {
                    // Check if policy applies to this entry
                    const appliesToType = !policy.eventTypes || policy.eventTypes.includes(entry.eventType);
                    const appliesToSeverity = !policy.severities || policy.severities.includes(entry.severity);
                    if (appliesToType && appliesToSeverity) {
                        indicesToRemove.push(index);
                    }
                }
            });
            // Remove entries (in reverse order to maintain indices)
            indicesToRemove.reverse().forEach(index => {
                const removed = this.entries.splice(index, 1)[0];
                this.emit('entry-expired', removed);
            });
        });
    }
    /**
     * Query audit entries
     */
    query(filters = {}) {
        let filtered = [...this.entries];
        // Apply filters
        if (filters.eventTypes) {
            filtered = filtered.filter(entry => filters.eventTypes.includes(entry.eventType));
        }
        if (filters.severities) {
            filtered = filtered.filter(entry => filters.severities.includes(entry.severity));
        }
        if (filters.userIds) {
            filtered = filtered.filter(entry => entry.userId && filters.userIds.includes(entry.userId));
        }
        if (filters.dateRange) {
            filtered = filtered.filter(entry => entry.timestamp >= filters.dateRange.start &&
                entry.timestamp <= filters.dateRange.end);
        }
        if (filters.actions) {
            filtered = filtered.filter(entry => filters.actions.includes(entry.action));
        }
        if (filters.results) {
            filtered = filtered.filter(entry => filters.results.includes(entry.result));
        }
        if (filters.resources) {
            filtered = filtered.filter(entry => entry.resource && filters.resources.includes(entry.resource));
        }
        if (filters.complianceTags) {
            filtered = filtered.filter(entry => filters.complianceTags.some(tag => entry.complianceTags.includes(tag)));
        }
        // Sort by timestamp (newest first)
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || filtered.length;
        return filtered.slice(offset, offset + limit);
    }
    /**
     * Verify audit trail integrity
     */
    verifyIntegrity() {
        if (!this.config.enableIntegrityVerification) {
            return { isValid: true, invalidEntries: [], totalChecked: 0 };
        }
        const invalidEntries = [];
        let previousHash;
        this.entries.forEach(entry => {
            // Verify entry hash
            const expectedHash = this.generateEntryHash({
                ...entry,
                hash: '' // Exclude hash from hash calculation
            });
            if (entry.hash !== expectedHash) {
                invalidEntries.push({ entry, reason: 'Hash mismatch' });
            }
            // Verify chain integrity
            if (entry.previousHash !== previousHash) {
                invalidEntries.push({ entry, reason: 'Chain integrity violation' });
            }
            previousHash = entry.hash;
        });
        const isValid = invalidEntries.length === 0;
        if (isValid) {
            this.stats.integrityChecksPassed++;
        }
        else {
            this.stats.integrityChecksFailed++;
        }
        this.stats.lastIntegrityCheck = new Date();
        return {
            isValid,
            invalidEntries,
            totalChecked: this.entries.length
        };
    }
    /**
     * Get statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Export audit trail for compliance reporting
     */
    exportForCompliance(format = 'json') {
        const exportData = {
            exportTimestamp: new Date().toISOString(),
            trailStats: this.getStats(),
            integrityCheck: this.verifyIntegrity(),
            entries: this.entries
        };
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }
        // CSV format (simplified)
        const csvRows = [
            'ID,Timestamp,EventType,Severity,UserId,Action,Result,Description,ComplianceTags'
        ];
        this.entries.forEach(entry => {
            const row = [
                entry.id,
                entry.timestamp.toISOString(),
                entry.eventType,
                entry.severity,
                entry.userId || '',
                entry.action,
                entry.result,
                `"${entry.description.replace(/"/g, '""')}"`,
                entry.complianceTags.join(';')
            ].join(',');
            csvRows.push(row);
        });
        return csvRows.join('\n');
    }
    /**
     * Clear all entries (use with caution!)
     */
    clearAll() {
        const count = this.entries.length;
        this.entries.length = 0;
        this.lastHash = undefined;
        // Reset stats
        Object.values(AuditEventType).forEach(type => {
            this.stats.entriesByType[type] = 0;
        });
        Object.values(AlertSeverity).forEach(severity => {
            this.stats.entriesBySeverity[severity] = 0;
        });
        this.stats.entriesByResult = {};
        this.stats.totalEntries = 0;
        this.stats.oldestEntry = undefined;
        this.stats.newestEntry = undefined;
        this.stats.averageEntriesPerDay = 0;
        this.emit('trail-cleared', count);
        return count;
    }
}
/**
 * Global audit trail instance
 */
export const globalAuditTrail = new AuditTrail({
    enabled: process.env.AUDIT_ENABLED !== 'false',
    secretKey: process.env.AUDIT_SECRET_KEY || 'default-secret-key',
    hashAlgorithm: 'sha256',
    maxMemoryEntries: 10000,
    retentionPolicies: [
        {
            retentionDays: 365, // Keep for 1 year
            archiveAfterDays: 90, // Archive after 90 days
            severities: [AlertSeverity.HIGH, AlertSeverity.CRITICAL]
        },
        {
            retentionDays: 90, // Keep regular events for 90 days
            archiveAfterDays: 30
        }
    ],
    enableIntegrityVerification: true,
    autoArchive: true
});
//# sourceMappingURL=AuditTrail.js.map