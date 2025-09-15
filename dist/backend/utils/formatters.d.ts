/**
 * T020: Log formatters and PII redaction
 * CVPlus Logging System - Formatting and Data Protection
 */
import { LogEntry, ErrorInfo, PerformanceInfo, LogFormatter } from '../types/index';
export declare class CVPlusLogFormatter implements LogFormatter {
    private enablePIIRedaction;
    private customSensitiveFields;
    constructor(options?: {
        enablePIIRedaction?: boolean;
        customSensitiveFields?: string[];
    });
    /**
     * Format complete log entry
     */
    format(entry: LogEntry): string;
    /**
     * Format error information with proper structure
     */
    formatError(error: ErrorInfo): string;
    /**
     * Format performance information
     */
    formatPerformance(perf: PerformanceInfo): string;
    /**
     * Redact PII from data structures
     */
    redactPII(data: any): any;
    /**
     * Redact PII from string content
     */
    private redactStringPII;
    /**
     * Redact PII from object properties
     */
    private redactObjectPII;
    /**
     * Redact IP address (keep first 3 octets for IPv4, first 4 groups for IPv6)
     */
    private redactIPAddress;
    /**
     * Redact user agent (keep browser/platform info, remove specific versions)
     */
    private redactUserAgent;
    /**
     * Sanitize stack traces to remove potential file path information
     */
    private sanitizeStackTrace;
    /**
     * Create a simple text formatter for console output
     */
    formatSimple(entry: LogEntry): string;
    /**
     * Create a detailed formatter with color coding (for development)
     */
    formatDetailed(entry: LogEntry): string;
}
export declare const defaultFormatter: CVPlusLogFormatter;
export declare function createFormatter(options?: {
    enablePIIRedaction?: boolean;
    customSensitiveFields?: string[];
}): CVPlusLogFormatter;
//# sourceMappingURL=formatters.d.ts.map