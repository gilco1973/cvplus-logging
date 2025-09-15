/**
 * T018: Core logging types implementation
 * CVPlus Logging System - Core Type Definitions
 */
import { Logger as WinstonLogger } from 'winston';
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    FATAL = "fatal"
}
export declare enum LogDomain {
    SYSTEM = "system",
    BUSINESS = "business",
    SECURITY = "security",
    PERFORMANCE = "performance",
    AUDIT = "audit"
}
export interface LogEntry {
    id: string;
    level: LogLevel;
    domain: LogDomain;
    message: string;
    context?: Record<string, any>;
    error?: ErrorInfo;
    performance?: PerformanceInfo;
    timestamp: number;
    correlationId?: string;
    service?: string;
    package?: string;
    source?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
}
export interface LogMetadata {
    [key: string]: any;
    version?: string;
    environment?: string;
    buildId?: string;
    deploymentId?: string;
    region?: string;
    instanceId?: string;
}
export interface LogSource {
    file?: string;
    function?: string;
    line?: number;
    column?: number;
    module?: string;
    package?: string;
}
export interface ErrorInfo {
    message: string;
    code?: string;
    stack?: string;
    name?: string;
    details?: Record<string, any>;
    componentStack?: string;
}
export interface PerformanceInfo {
    duration?: number;
    value?: number;
    requestSize?: number;
    responseSize?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    additionalMetrics?: Record<string, number>;
}
export interface LoggerConfig {
    level?: LogLevel;
    service?: string;
    environment?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
    enableFirebase?: boolean;
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
    format?: 'json' | 'simple' | 'detailed';
    redactPII?: boolean;
    metadata?: Record<string, any>;
    package?: string;
    enablePiiRedaction?: boolean;
}
export declare enum AlertSeverity {
    LOW = "low",
    INFO = "info",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum AuditAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout",
    ACCESS = "access",
    EXPORT = "export",
    IMPORT = "import",
    CONFIGURE = "configure"
}
export interface ILogger {
    error(message: string, context?: Record<string, any>, error?: Error): string;
    warn(message: string, context?: Record<string, any>): string;
    info(message: string, context?: Record<string, any>): string;
    debug(message: string, context?: Record<string, any>): string;
    log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): string;
    withContext(context: Record<string, any>): ILogger;
    withCorrelation(correlationId: string, callback: () => string): string;
    setUserContext(userContext: UserContext): void;
    setContext(context: Record<string, any>): void;
    clearContext(): void;
    performanceMetric(metric: string, value: number, context?: Record<string, any>): string;
    businessEvent(event: string, context?: Record<string, any>): string;
    securityEvent(event: string, context?: Record<string, any>): string;
    auditEvent(event: string, context?: Record<string, any>): string;
    getLastLogEntry(): LogEntry | null;
    getAllLogEntries(): LogEntry[];
    clearEntries(): void;
}
export interface UserContext {
    userId?: string;
    sessionId?: string;
    tier?: string;
    role?: string;
    email?: string;
    experimentGroups?: string[];
    metadata?: Record<string, any>;
}
export interface CorrelationContext {
    correlationId: string;
    parentId?: string;
    traceId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
}
export interface TransportConfig {
    type: 'console' | 'file' | 'firebase' | 'external';
    level?: LogLevel;
    format?: string;
    options?: Record<string, any>;
}
export interface LogFormatter {
    format(entry: LogEntry): string;
    formatError(error: ErrorInfo): string;
    formatPerformance(perf: PerformanceInfo): string;
    redactPII(data: any): any;
}
export interface LoggerFactoryConfig {
    defaultLevel?: LogLevel;
    defaultTransports?: TransportConfig[];
    globalContext?: Record<string, any>;
    enableCorrelationTracking?: boolean;
    enablePIIRedaction?: boolean;
    maxLogEntries?: number;
}
export interface LogAggregatorConfig {
    aggregationInterval: number;
    batchSize: number;
    enableMetrics: boolean;
    enableAlerts: boolean;
    retentionPeriod: number;
    storageBackend: 'memory' | 'firebase' | 'external';
}
export interface AggregatedLogData {
    totalLogs: number;
    timeRange: {
        start: number;
        end: number;
    };
    logsByLevel: Record<LogLevel, number>;
    logsByDomain: Record<LogDomain, number>;
    logsBySource: Record<string, number>;
    correlationChains?: CorrelationChain[];
    logs?: LogEntry[];
}
export interface CorrelationChain {
    correlationId: string;
    logCount: number;
    sources: string[];
    duration: number;
    timeline?: TimelineEntry[];
    totalDuration?: number;
    services?: string[];
}
export interface TimelineEntry {
    timestamp: number;
    source: string;
    event: string;
    step?: number;
}
export interface PerformanceMetrics {
    averageResponseTimes: Record<string, number>;
    responseTimePercentiles: {
        p50: number;
        p95: number;
        p99: number;
    };
    slowOperations: Array<{
        source: string;
        duration: number;
        message: string;
    }>;
    performanceAlerts: Array<{
        type: string;
        threshold: number;
        actualValue: number;
    }>;
}
export interface ErrorAnalysis {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySource: Record<string, number>;
    topErrors: Array<{
        code: string;
        count: number;
        message: string;
        lastOccurrence: number;
    }>;
    errorRate: number;
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    condition: AlertCondition;
    actions: AlertAction[];
    enabled: boolean;
    cooldownMinutes?: number;
}
export interface AlertCondition {
    level?: LogLevel;
    domain?: LogDomain;
    package?: string;
    messagePattern?: RegExp | string;
    threshold?: {
        count: number;
        timeWindowMinutes: number;
    };
    customFilter?: (logEntry: LogEntry) => boolean;
}
export interface AlertAction {
    type: 'email' | 'webhook' | 'slack' | 'firebase';
    config: Record<string, any>;
}
export interface AuditTrail {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    resource: string;
    outcome: 'success' | 'failure';
    details: Record<string, any>;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
}
export interface Alert {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    source: string;
    timestamp: number;
    metadata?: Record<string, any>;
    resolved?: boolean;
}
export type AlertCallback = (alert: Alert) => void;
export interface ExtendedWinstonLogger extends WinstonLogger {
    setLevel(level: LogLevel): void;
    addContext(context: Record<string, any>): void;
}
export type LoggerMethod = (message: string, context?: Record<string, any>, error?: Error) => string;
export type CorrelationCallback<T = string> = () => T;
export declare const LOG_LEVELS: LogLevel[];
export declare const LOG_DOMAINS: LogDomain[];
export declare const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig>;
export declare const DEFAULT_FACTORY_CONFIG: Required<LoggerFactoryConfig>;
//# sourceMappingURL=index.d.ts.map