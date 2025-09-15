/**
 * T020: PII redaction utility in packages/core/src/logging/PiiRedaction.ts
 *
 * Automatically detects and redacts personally identifiable information (PII)
 * from log entries to ensure GDPR and privacy compliance
 */
import { LogEntry, PiiRedactionConfig } from './types';
/**
 * PII Redaction service for protecting sensitive information in logs
 */
export declare class PiiRedaction {
    private static enabled;
    private static customPatterns;
    private static customReplacements;
    /**
     * Check if PII redaction is currently enabled
     */
    static isEnabled(): boolean;
    /**
     * Enable or disable PII redaction globally
     */
    static setEnabled(enabled: boolean): void;
    /**
     * Add custom PII patterns for redaction
     */
    static addCustomPattern(name: string, pattern: RegExp, replacement?: (match: string) => string): void;
    /**
     * Remove a custom PII pattern
     */
    static removeCustomPattern(name: string): void;
    /**
     * Redact PII from a string
     */
    static redactString(text: string, customPatterns?: Record<string, RegExp>): string;
    /**
     * Recursively redact PII from an object
     */
    static redactObject<T>(obj: T): T;
    /**
     * Redact PII from a log entry
     */
    static redactLogEntry(logEntry: LogEntry): LogEntry;
    /**
     * Create a redaction configuration for specific use cases
     */
    static createConfig(options: {
        enabled?: boolean;
        patterns?: Record<string, RegExp>;
        customReplacements?: Record<string, (match: string) => string>;
    }): PiiRedactionConfig;
    /**
     * Validate that a string has been properly redacted
     */
    static validateRedaction(text: string): {
        isClean: boolean;
        violations: Array<{
            type: string;
            match: string;
            position: number;
        }>;
    };
    /**
     * Get statistics about redaction operations
     */
    static getRedactionStats(): {
        enabled: boolean;
        totalPatterns: number;
        customPatterns: number;
        patternNames: string[];
    };
    /**
     * Reset all custom patterns and settings
     */
    static reset(): void;
}
//# sourceMappingURL=PiiRedaction.d.ts.map