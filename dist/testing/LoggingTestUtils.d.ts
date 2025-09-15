/**
 * Advanced testing utilities for the CVPlus logging system
 * Provides comprehensive test helpers, mocks, and validation tools
 */
import { EventEmitter } from 'events';
import { LogLevel, LogMetadata, CorrelationContext } from '../backend/types/index';
import { LogEntry } from '../backend/models/LogEntry';
/**
 * Mock log entry generator for testing
 */
export declare class MockLogGenerator {
    private options;
    private sequenceNumber;
    private baseTimestamp;
    constructor(options?: {
        serviceName?: string;
        baseCorrelationId?: string;
        userIdPrefix?: string;
    });
    /**
     * Generate a single mock log entry
     */
    generateLogEntry(overrides?: Partial<LogEntry>): LogEntry;
    /**
     * Generate multiple log entries
     */
    generateLogEntries(count: number, baseOverrides?: Partial<LogEntry>): LogEntry[];
    /**
     * Generate log entries with specific patterns for testing
     */
    generatePatternedLogs(patterns: {
        errorBurst?: {
            count: number;
            timeSpanMs: number;
        };
        serviceLoad?: {
            service: string;
            requestsPerSecond: number;
            durationSeconds: number;
        };
        userJourney?: {
            userId: string;
            steps: string[];
            delayBetweenStepsMs: number;
        };
        performanceDegradation?: {
            baseResponseTime: number;
            degradationFactor: number;
            count: number;
        };
    }): LogEntry[];
    private randomLogLevel;
    private randomService;
    private generateMessage;
    private generateCorrelationId;
    private generateUserId;
    private generateMetadata;
    private generateContext;
    private generateTags;
    private generateFilename;
    private generateFunctionName;
}
/**
 * Mock logger implementation for testing
 */
export declare class MockLogger extends EventEmitter {
    private logs;
    private config;
    constructor(config?: Partial<typeof MockLogger.prototype.config>);
    log(level: LogLevel, message: string, metadata?: LogMetadata, context?: CorrelationContext): void;
    info(message: string, metadata?: LogMetadata, context?: CorrelationContext): void;
    warn(message: string, metadata?: LogMetadata, context?: CorrelationContext): void;
    error(message: string, metadata?: LogMetadata, context?: CorrelationContext): void;
    debug(message: string, metadata?: LogMetadata, context?: CorrelationContext): void;
    trace(message: string, metadata?: LogMetadata, context?: CorrelationContext): void;
    getLogs(): LogEntry[];
    getLogsByLevel(level: LogLevel): LogEntry[];
    getLogsByService(service: string): LogEntry[];
    clearLogs(): void;
    getLogCount(): number;
    hasLogWithMessage(message: string): boolean;
}
/**
 * Test assertion utilities for logging
 */
export declare class LoggingTestAssertions {
    /**
     * Assert that a logger has logged a specific message
     */
    static assertHasLogWithMessage(logger: MockLogger, expectedMessage: string, level?: LogLevel): void;
    /**
     * Assert log count
     */
    static assertLogCount(logger: MockLogger, expectedCount: number, level?: LogLevel): void;
    /**
     * Assert that logs are properly correlated
     */
    static assertLogsAreCorrelated(logs: LogEntry[], correlationId: string): void;
    /**
     * Assert log performance metrics
     */
    static assertLogPerformance(logs: LogEntry[], maxDuration: number): void;
    /**
     * Assert PII redaction
     */
    static assertPIIRedacted(logs: LogEntry[], piiPatterns: RegExp[]): void;
}
/**
 * Performance testing utilities for logging
 */
export declare class LoggingPerformanceTests {
    /**
     * Test logging performance under load
     */
    static testLoggingThroughput(logger: MockLogger, messageCount: number, concurrency?: number): Promise<{
        totalTime: number;
        averageTimePerLog: number;
        logsPerSecond: number;
        memoryUsed: number;
    }>;
    /**
     * Test memory usage during sustained logging
     */
    static testMemoryUsage(logger: MockLogger, durationMs: number, logsPerSecond: number): Promise<{
        peakMemoryUsage: number;
        averageMemoryUsage: number;
        memoryGrowthRate: number;
        totalLogs: number;
    }>;
}
/**
 * Integration test helpers
 */
export declare class LoggingIntegrationTestHelpers {
    /**
     * Create a complete test scenario with multiple services
     */
    static runMultiServiceScenario(loggers: Record<string, MockLogger>): Promise<{
        correlationId: string;
        logs: LogEntry[];
        duration: number;
    }>;
    private static delay;
}
export declare const CommonTestPatterns: {
    PII_PATTERNS: RegExp[];
    ERROR_SCENARIOS: string[];
    PERFORMANCE_THRESHOLDS: {
        maxResponseTime: number;
        maxMemoryGrowth: number;
        minThroughput: number;
    };
};
declare const _default: {
    MockLogGenerator: typeof MockLogGenerator;
    MockLogger: typeof MockLogger;
    LoggingTestAssertions: typeof LoggingTestAssertions;
    LoggingPerformanceTests: typeof LoggingPerformanceTests;
    LoggingIntegrationTestHelpers: typeof LoggingIntegrationTestHelpers;
    CommonTestPatterns: {
        PII_PATTERNS: RegExp[];
        ERROR_SCENARIOS: string[];
        PERFORMANCE_THRESHOLDS: {
            maxResponseTime: number;
            maxMemoryGrowth: number;
            minThroughput: number;
        };
    };
};
export default _default;
//# sourceMappingURL=LoggingTestUtils.d.ts.map