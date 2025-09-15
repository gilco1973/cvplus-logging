/**
 * Core logging types for CVPlus platform
 * These types define the structure for comprehensive logging system
 */
/**
 * Log severity levels following RFC 5424 standard
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
/**
 * Log domain categories for organizing logs by functional area
 */
export var LogDomain;
(function (LogDomain) {
    LogDomain["SECURITY"] = "security";
    LogDomain["PERFORMANCE"] = "performance";
    LogDomain["BUSINESS"] = "business";
    LogDomain["SYSTEM"] = "system";
    LogDomain["AUDIT"] = "audit";
})(LogDomain || (LogDomain = {}));
/**
 * Alert severity levels
 */
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["INFO"] = "info";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
/**
 * Audit actions
 */
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
//# sourceMappingURL=types.js.map