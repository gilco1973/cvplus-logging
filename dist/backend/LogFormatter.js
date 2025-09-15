/**
 * T021: Log formatter with structured format in packages/core/src/logging/LogFormatter.ts
 *
 * Formats log entries for different outputs (console, file, Firebase Cloud Logging)
 * Provides consistent structured formatting across all CVPlus packages
 */
import { LogLevel } from './types/index';
/**
 * Color codes for console output
 */
const CONSOLE_COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};
/**
 * Log level to color mapping for console output
 */
const LEVEL_COLORS = {
    [LogLevel.DEBUG]: CONSOLE_COLORS.cyan,
    [LogLevel.INFO]: CONSOLE_COLORS.green,
    [LogLevel.WARN]: CONSOLE_COLORS.yellow,
    [LogLevel.ERROR]: CONSOLE_COLORS.red,
    [LogLevel.FATAL]: CONSOLE_COLORS.magenta
};
/**
 * Log level to Firebase severity mapping
 */
const FIREBASE_SEVERITY_MAP = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARNING',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.FATAL]: 'CRITICAL'
};
/**
 * Log formatting service for different output targets
 */
export class LogFormatter {
    /**
     * Format log entry to common structured format
     */
    static formatLogEntry(logEntry) {
        const formatted = {
            '@timestamp': logEntry.timestamp,
            level: logEntry.level,
            message: this.sanitizeMessage(logEntry.message),
            correlationId: logEntry.correlationId,
            domain: logEntry.domain,
            package: logEntry.package,
            context: logEntry.context || {}
        };
        // Add optional fields if present
        if (logEntry.error) {
            formatted.error = logEntry.error;
        }
        if (logEntry.performance) {
            formatted.performance = logEntry.performance;
        }
        if (logEntry.userId) {
            formatted.userId = logEntry.userId;
        }
        if (logEntry.sessionId) {
            formatted.sessionId = logEntry.sessionId;
        }
        if (logEntry.requestId) {
            formatted.requestId = logEntry.requestId;
        }
        return formatted;
    }
    /**
     * Format log entry for console output with colors and readable layout
     */
    static formatForConsole(logEntry) {
        var _a, _b;
        const timestamp = logEntry.timestamp;
        const level = logEntry.level.toUpperCase();
        const domain = logEntry.domain;
        const correlationId = ((_a = logEntry.correlationId) === null || _a === void 0 ? void 0 : _a.substring(0, 8)) || 'unknown'; // Truncate for readability
        const packageName = ((_b = logEntry.package) === null || _b === void 0 ? void 0 : _b.replace('@cvplus/', '')) || 'unknown';
        const message = this.sanitizeMessage(logEntry.message);
        // Apply colors
        const levelColor = LEVEL_COLORS[logEntry.level] || CONSOLE_COLORS.white;
        const coloredLevel = `${levelColor}${level}${CONSOLE_COLORS.reset}`;
        // Build main log line
        let output = `[${timestamp}] [${coloredLevel}] [${domain}] [${correlationId}] ${CONSOLE_COLORS.dim}${packageName}${CONSOLE_COLORS.reset} ${message}`;
        // Add context if present
        if (logEntry.context && Object.keys(logEntry.context).length > 0) {
            const contextStr = this.formatContextForConsole(logEntry.context);
            output += `\\n  ${CONSOLE_COLORS.dim}Context: ${contextStr}${CONSOLE_COLORS.reset}`;
        }
        // Add error details if present
        if (logEntry.error) {
            output += `\\n  ${CONSOLE_COLORS.red}Error: ${logEntry.error.name}: ${logEntry.error.message}${CONSOLE_COLORS.reset}`;
            if (logEntry.error.stack && process.env.NODE_ENV !== 'production') {
                output += `\\n  ${CONSOLE_COLORS.dim}Stack: ${logEntry.error.stack.split('\\n').slice(0, 3).join('\\n  ')}${CONSOLE_COLORS.reset}`;
            }
        }
        // Add performance metrics if present
        if (logEntry.performance) {
            const perfStr = this.formatPerformanceForConsole(logEntry.performance);
            output += `\\n  ${CONSOLE_COLORS.blue}Performance: ${perfStr}${CONSOLE_COLORS.reset}`;
        }
        return output;
    }
    /**
     * Format log entry for file output as JSON
     */
    static formatForFile(logEntry) {
        const formatted = this.formatLogEntry(logEntry);
        return JSON.stringify(formatted);
    }
    /**
     * Format log entry for Firebase Cloud Logging
     */
    static formatForFirebase(logEntry) {
        const firebaseEntry = {
            timestamp: logEntry.timestamp,
            severity: FIREBASE_SEVERITY_MAP[logEntry.level],
            message: this.sanitizeMessage(logEntry.message),
            labels: {
                correlationId: logEntry.correlationId,
                domain: logEntry.domain,
                package: logEntry.package
            }
        };
        // Add optional fields to jsonPayload
        const jsonPayload = {};
        if (logEntry.context && Object.keys(logEntry.context).length > 0) {
            jsonPayload.context = logEntry.context;
        }
        if (logEntry.error) {
            jsonPayload.error = logEntry.error;
        }
        if (logEntry.performance) {
            jsonPayload.performance = logEntry.performance;
        }
        if (logEntry.userId) {
            jsonPayload.userId = logEntry.userId;
        }
        if (logEntry.sessionId) {
            jsonPayload.sessionId = logEntry.sessionId;
        }
        if (logEntry.requestId) {
            jsonPayload.requestId = logEntry.requestId;
        }
        if (Object.keys(jsonPayload).length > 0) {
            firebaseEntry.jsonPayload = jsonPayload;
        }
        // Add resource information for Firebase
        firebaseEntry.resource = {
            type: 'cloud_function',
            labels: {
                function_name: process.env.FUNCTION_NAME || 'unknown',
                region: process.env.FUNCTION_REGION || 'us-central1',
                project_id: process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'unknown'
            }
        };
        return firebaseEntry;
    }
    /**
     * Sanitize log message by removing control characters and limiting length
     */
    static sanitizeMessage(message, maxLength = 5000) {
        if (!message || typeof message !== 'string') {
            return String(message || '');
        }
        // Remove control characters except newlines and tabs
        let sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Replace newlines and tabs with spaces for single-line format
        sanitized = sanitized.replace(/[\n\r\t]/g, ' ');
        // Collapse multiple spaces
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength - 3) + '...';
        }
        return sanitized;
    }
    /**
     * Format context object for console display
     */
    static formatContextForConsole(context) {
        const parts = [];
        Object.entries(context).forEach(([key, value]) => {
            if (value === null) {
                parts.push(`${key}: null`);
            }
            else if (value === undefined) {
                parts.push(`${key}: undefined`);
            }
            else if (typeof value === 'string') {
                parts.push(`${key}: "${value}"`);
            }
            else if (typeof value === 'object') {
                parts.push(`${key}: ${JSON.stringify(value)}`);
            }
            else {
                parts.push(`${key}: ${value}`);
            }
        });
        return parts.join(', ');
    }
    /**
     * Format performance metrics for console display
     */
    static formatPerformanceForConsole(performance) {
        const parts = [];
        if (performance.duration !== undefined) {
            parts.push(`${performance.duration}ms`);
        }
        if (performance.memoryUsage !== undefined) {
            const mb = Math.round(performance.memoryUsage / 1024 / 1024 * 100) / 100;
            parts.push(`${mb}MB RAM`);
        }
        if (performance.cpuUsage !== undefined) {
            parts.push(`${performance.cpuUsage}% CPU`);
        }
        // Add any other performance metrics
        Object.entries(performance).forEach(([key, value]) => {
            if (!['duration', 'memoryUsage', 'cpuUsage'].includes(key)) {
                parts.push(`${key}: ${value}`);
            }
        });
        return parts.join(', ');
    }
    /**
     * Create a structured log template for specific domains
     */
    static createTemplate(domain) {
        return {
            format: (message, context = {}) => ({
                message: this.sanitizeMessage(message),
                domain: domain,
                context: {
                    ...context,
                    template: `${domain}-template`
                }
            })
        };
    }
    /**
     * Batch format multiple log entries for efficient processing
     */
    static formatBatch(entries, format = 'file') {
        return entries.map(entry => {
            switch (format) {
                case 'console':
                    return this.formatForConsole(entry);
                case 'file':
                    return this.formatForFile(entry);
                case 'firebase':
                    return JSON.stringify(this.formatForFirebase(entry));
                default:
                    return this.formatForFile(entry);
            }
        });
    }
    /**
     * Validate log entry format
     */
    static validateLogEntry(logEntry) {
        return (logEntry &&
            typeof logEntry.timestamp === 'string' &&
            typeof logEntry.level === 'string' &&
            typeof logEntry.message === 'string' &&
            typeof logEntry.correlationId === 'string' &&
            typeof logEntry.domain === 'string' &&
            typeof logEntry.package === 'string' &&
            typeof logEntry.context === 'object');
    }
}
//# sourceMappingURL=LogFormatter.js.map