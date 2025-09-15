/**
 * T018: Core logging types implementation
 * CVPlus Logging System - Core Type Definitions
 */
// Core Log Levels
export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
// Log Domains for categorization
export var LogDomain;
(function (LogDomain) {
    LogDomain["SYSTEM"] = "system";
    LogDomain["BUSINESS"] = "business";
    LogDomain["SECURITY"] = "security";
    LogDomain["PERFORMANCE"] = "performance";
    LogDomain["AUDIT"] = "audit";
})(LogDomain || (LogDomain = {}));
// Audit severity levels
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["INFO"] = "info";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
// Audit actions
export var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "create";
    AuditAction["READ"] = "read";
    AuditAction["UPDATE"] = "update";
    AuditAction["DELETE"] = "delete";
    AuditAction["LOGIN"] = "login";
    AuditAction["LOGOUT"] = "logout";
    AuditAction["ACCESS"] = "access";
    AuditAction["EXPORT"] = "export";
    AuditAction["IMPORT"] = "import";
    AuditAction["CONFIGURE"] = "configure";
})(AuditAction || (AuditAction = {}));
// Constants
export const LOG_LEVELS = Object.values(LogLevel);
export const LOG_DOMAINS = Object.values(LogDomain);
// Default configurations
export const DEFAULT_LOGGER_CONFIG = {
    level: LogLevel.INFO,
    service: 'unknown',
    environment: process.env.NODE_ENV || 'development',
    enableConsole: true,
    enableFile: false,
    enableFirebase: false,
    filePath: './logs/application.log',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    format: 'json',
    redactPII: true,
    metadata: {},
    package: 'unknown',
    enablePiiRedaction: true
};
export const DEFAULT_FACTORY_CONFIG = {
    defaultLevel: LogLevel.INFO,
    defaultTransports: [
        { type: 'console', level: LogLevel.INFO },
        { type: 'file', level: LogLevel.DEBUG }
    ],
    globalContext: {},
    enableCorrelationTracking: true,
    enablePIIRedaction: true,
    maxLogEntries: 1000
};
//# sourceMappingURL=index.js.map