/**
 * CVPlus Core Logging Module
 * Comprehensive logging system for CVPlus platform
 *
 * Exports:
 * - LoggerFactory: Create and manage logger instances
 * - CorrelationService: Track requests across services
 * - PiiRedaction: Automatically redact sensitive information
 * - LogFormatter: Format logs for different outputs
 * - FirebaseTransport: Custom Winston transport for Firebase Cloud Logging
 * - LogStream: Real-time log streaming and filtering
 * - AlertRule: Intelligent alerting system for log events
 * - AuditTrail: Compliance-focused audit logging
 * - LogArchive: Long-term log storage and archival
 * - Types: TypeScript interfaces and enums
 */
import { LoggerFactory } from './LoggerFactory';
import { CorrelationService } from './CorrelationService';
export { LoggerFactory };
export { CorrelationService };
export { PiiRedaction } from './PiiRedaction';
export { LogFormatter } from './LogFormatter';
export { FirebaseTransport } from './FirebaseTransport';
export type { FirebaseTransportOptions } from './FirebaseTransport';
export { LogStream, LogStreamManager, globalStreamManager } from './LogStream';
export { AlertRule, AlertRuleManager, globalAlertManager } from './AlertRule';
export { AuditTrail, globalAuditTrail } from './AuditTrail';
export { LogArchive, globalLogArchive } from './LogArchive';
export * from './types/index';
export { AlertConditionType } from './AlertRule';
export { AuditEventType } from './AuditTrail';
export { ArchiveStorageType, CompressionType } from './LogArchive';
import PackageLoggerFactoryDefault from './PackageLoggerFactory';
export { PackageLoggerFactoryDefault as PackageLoggerFactory };
export { BasePackageLogger, AnalyticsLogger, PremiumLogger, RecommendationsLogger, ProfilesLogger, AdminLogger, WorkflowLogger, PaymentsLogger, createPackageLogger, analyticsLogger, premiumLogger, recommendationsLogger, profilesLogger, adminLogger, workflowLogger, paymentsLogger, packageLogging } from './PackageLoggerFactory';
/**
 * Quick start utility for creating a logger with sensible defaults
 */
export declare function createLogger(serviceName: string, level?: import('./types/index').LogLevel): import("./core/BaseLogger").BaseLogger;
/**
 * Express middleware for automatic correlation ID handling
 */
export declare const correlationMiddleware: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => void;
/**
 * Default logger instance for immediate use
 */
export declare const logger: import("./core/BaseLogger").BaseLogger;
/**
 * Version information
 */
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map