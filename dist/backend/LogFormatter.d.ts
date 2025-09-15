/**
 * T021: Log formatter with structured format in packages/core/src/logging/LogFormatter.ts
 *
 * Formats log entries for different outputs (console, file, Firebase Cloud Logging)
 * Provides consistent structured formatting across all CVPlus packages
 */
import { LogEntry, FormattedLogEntry, FirebaseLogEntry } from './types';
/**
 * Log formatting service for different output targets
 */
export declare class LogFormatter {
    /**
     * Format log entry to common structured format
     */
    static formatLogEntry(logEntry: LogEntry): FormattedLogEntry;
    /**
     * Format log entry for console output with colors and readable layout
     */
    static formatForConsole(logEntry: LogEntry): string;
    /**
     * Format log entry for file output as JSON
     */
    static formatForFile(logEntry: LogEntry): string;
    /**
     * Format log entry for Firebase Cloud Logging
     */
    static formatForFirebase(logEntry: LogEntry): FirebaseLogEntry;
    /**
     * Sanitize log message by removing control characters and limiting length
     */
    static sanitizeMessage(message: string, maxLength?: number): string;
    /**
     * Format context object for console display
     */
    private static formatContextForConsole;
    /**
     * Format performance metrics for console display
     */
    private static formatPerformanceForConsole;
    /**
     * Create a structured log template for specific domains
     */
    static createTemplate(domain: string): {
        format: (message: string, context?: Record<string, unknown>) => Partial<LogEntry>;
    };
    /**
     * Batch format multiple log entries for efficient processing
     */
    static formatBatch(entries: LogEntry[], format?: 'console' | 'file' | 'firebase'): string[];
    /**
     * Validate log entry format
     */
    static validateLogEntry(logEntry: any): logEntry is LogEntry;
}
//# sourceMappingURL=LogFormatter.d.ts.map