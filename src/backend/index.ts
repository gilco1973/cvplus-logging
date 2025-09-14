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

// Core services
export { LoggerFactory } from './LoggerFactory';
export { CorrelationService } from './CorrelationService';
export { PiiRedaction } from './PiiRedaction';
export { LogFormatter } from './LogFormatter';

// Firebase integration
export { FirebaseTransport } from './FirebaseTransport';
export type { FirebaseTransportOptions } from './FirebaseTransport';

// Data models and systems
export { LogStream, LogStreamManager, globalStreamManager } from './LogStream';
export { AlertRule, AlertRuleManager, globalAlertManager } from './AlertRule';
export { AuditTrail, globalAuditTrail } from './AuditTrail';
export { LogArchive, globalLogArchive } from './LogArchive';

// Types and interfaces
export * from './types';

// Enums for data models
export { AlertConditionType } from './AlertRule';
export { AuditEventType } from './AuditTrail';
export { ArchiveStorageType, CompressionType } from './LogArchive';

// Package logger factory and implementations
export {
  PackageLoggerFactory,
  BasePackageLogger,
  AnalyticsLogger,
  PremiumLogger,
  RecommendationsLogger,
  ProfilesLogger,
  AdminLogger,
  WorkflowLogger,
  PaymentsLogger,
  createPackageLogger,
  analyticsLogger,
  premiumLogger,
  recommendationsLogger,
  profilesLogger,
  adminLogger,
  workflowLogger,
  paymentsLogger,
  packageLogging
} from './PackageLoggerFactory';

// Re-export commonly used types for convenience
export type {
  Logger,
  LoggerConfig,
  LogEntry,
  LogStream,
  AlertRule,
  AuditTrail,
  PiiRedactionConfig,
  TransportConfig
} from './types';

export {
  LogLevel,
  LogDomain
} from './types';

/**
 * Quick start utility for creating a logger with sensible defaults
 */
export function createLogger(serviceName: string, level: LogLevel = LogLevel.INFO) {
  return LoggerFactory.createLogger(serviceName, { level });
}

/**
 * Express middleware for automatic correlation ID handling
 */
export const correlationMiddleware = CorrelationService.middleware();

/**
 * Default logger instance for immediate use
 */
export const logger = LoggerFactory.createLogger('@cvplus/core');

/**
 * Version information
 */
export const VERSION = '1.0.0';