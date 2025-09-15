/**
 * T024: Alert rule engine in packages/core/src/logging/AlertRule.ts
 *
 * Implements intelligent alerting system for log events
 * Provides threshold-based, pattern-based, and ML-based alerting capabilities
 */
import { EventEmitter } from 'events';
import { LogEntry, LogLevel, LogDomain, AlertRule as IAlertRule, AlertSeverity } from './types/index';
/**
 * Alert condition types
 */
export declare enum AlertConditionType {
    THRESHOLD = "threshold",
    PATTERN = "pattern",
    FREQUENCY = "frequency",
    ANOMALY = "anomaly",
    CHAIN = "chain"
}
/**
 * Threshold condition configuration
 */
export interface ThresholdCondition {
    type: AlertConditionType.THRESHOLD;
    /**
     * Metric to monitor
     */
    metric: 'error_count' | 'warning_count' | 'response_time' | 'memory_usage' | 'cpu_usage';
    /**
     * Threshold value
     */
    threshold: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
    /**
     * Comparison operator
     */
    operator: '>' | '>=' | '<' | '<=' | '==';
}
/**
 * Pattern condition configuration
 */
export interface PatternCondition {
    type: AlertConditionType.PATTERN;
    /**
     * Regular expression pattern to match
     */
    pattern: RegExp;
    /**
     * Fields to search in
     */
    fields: ('message' | 'error.message' | 'context')[];
    /**
     * Minimum occurrences to trigger alert
     */
    minOccurrences: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
}
/**
 * Frequency condition configuration
 */
export interface FrequencyCondition {
    type: AlertConditionType.FREQUENCY;
    /**
     * Log levels to monitor
     */
    levels: LogLevel[];
    /**
     * Maximum allowed frequency (events per window)
     */
    maxFrequency: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
}
/**
 * Anomaly detection condition
 */
export interface AnomalyCondition {
    type: AlertConditionType.ANOMALY;
    /**
     * Metric to analyze for anomalies
     */
    metric: string;
    /**
     * Sensitivity threshold (1-10, higher = more sensitive)
     */
    sensitivity: number;
    /**
     * Historical data points to consider
     */
    historicalWindow: number;
}
/**
 * Chain condition for related events
 */
export interface ChainCondition {
    type: AlertConditionType.CHAIN;
    /**
     * Sequence of events that must occur
     */
    eventChain: Array<{
        pattern: RegExp;
        maxTimeFromPrevious?: number;
    }>;
    /**
     * Maximum time for entire chain to complete
     */
    maxChainTimeMs: number;
}
/**
 * Union type for all condition types
 */
export type AlertCondition = ThresholdCondition | PatternCondition | FrequencyCondition | AnomalyCondition | ChainCondition;
/**
 * Alert rule configuration
 */
export interface AlertRuleConfig {
    id: string;
    name: string;
    description: string;
    severity: AlertSeverity;
    conditions: AlertCondition[];
    filters?: {
        levels?: LogLevel[];
        domains?: LogDomain[];
        packages?: string[];
        userIds?: string[];
    };
    actions: AlertAction[];
    enabled: boolean;
    cooldownMs?: number;
    maxAlertsPerHour?: number;
}
/**
 * Alert actions
 */
export declare enum AlertActionType {
    EMAIL = "email",
    WEBHOOK = "webhook",
    SLACK = "slack",
    SMS = "sms",
    PAGERDUTY = "pagerduty"
}
/**
 * Alert action configuration
 */
export interface AlertAction {
    type: AlertActionType;
    config: Record<string, any>;
    enabled: boolean;
}
/**
 * Triggered alert information
 */
export interface TriggeredAlert {
    ruleId: string;
    ruleName: string;
    severity: AlertSeverity;
    triggeredAt: Date;
    triggerEntries: LogEntry[];
    conditionsMet: string[];
    context: Record<string, any>;
}
/**
 * Alert rule statistics
 */
export interface AlertRuleStats {
    ruleId: string;
    totalTriggered: number;
    totalSuppressed: number;
    lastTriggered?: Date;
    averageTriggersPerDay: number;
    conditionBreakdown: Record<string, number>;
}
/**
 * Alert rule implementation
 */
export declare class AlertRule extends EventEmitter implements IAlertRule {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly condition: any;
    readonly actions: any[];
    readonly enabled: boolean;
    readonly cooldownMinutes?: number;
    private readonly config;
    private readonly logWindows;
    private readonly stats;
    private lastTriggered?;
    private alertsInLastHour;
    constructor(config: AlertRuleConfig);
    /**
     * Get rule ID
     */
    getId(): string;
    /**
     * Get rule configuration
     */
    getConfig(): AlertRuleConfig;
    /**
     * Check if rule is enabled
     */
    isEnabled(): boolean;
    /**
     * Process log entry against this rule
     */
    processLogEntry(entry: LogEntry): void;
    /**
     * Check if log entry passes rule filters
     */
    private passesFilters;
    /**
     * Add log entry to time windows for analysis
     */
    private addToWindows;
    /**
     * Check all conditions against current state
     */
    private checkConditions;
    /**
     * Check individual condition
     */
    private checkCondition;
    /**
     * Check threshold condition
     */
    private checkThresholdCondition;
    /**
     * Check pattern condition
     */
    private checkPatternCondition;
    /**
     * Check frequency condition
     */
    private checkFrequencyCondition;
    /**
     * Check anomaly condition (simplified implementation)
     */
    private checkAnomalyCondition;
    /**
     * Check chain condition
     */
    private checkChainCondition;
    /**
     * Handle triggered alert
     */
    private handleTriggeredAlert;
    /**
     * Check if rule is in cooldown period
     */
    private isInCooldown;
    /**
     * Check if rule is rate limited
     */
    private isRateLimited;
    /**
     * Execute configured actions
     */
    private executeActions;
    /**
     * Execute individual action
     */
    private executeAction;
    /**
     * Utility methods
     */
    private compareValues;
    private getFieldValue;
    /**
     * Get rule statistics
     */
    getStats(): AlertRuleStats;
    /**
     * Update rule configuration
     */
    updateConfig(newConfig: Partial<AlertRuleConfig>): void;
    /**
     * Enable/disable rule
     */
    setEnabled(enabled: boolean): void;
    /**
     * Clear all windows and reset state
     */
    reset(): void;
}
/**
 * Alert rule manager for handling multiple rules
 */
export declare class AlertRuleManager extends EventEmitter {
    private readonly rules;
    /**
     * Add new alert rule
     */
    addRule(config: AlertRuleConfig): AlertRule;
    /**
     * Process log entry against all rules
     */
    processLogEntry(entry: LogEntry): void;
    /**
     * Get rule by ID
     */
    getRule(id: string): AlertRule | undefined;
    /**
     * Remove rule
     */
    removeRule(id: string): boolean;
    /**
     * Get all rule IDs
     */
    getRuleIds(): string[];
    /**
     * Get manager statistics
     */
    getStats(): {
        totalRules: number;
        enabledRules: number;
        totalAlertsTriggered: number;
    };
}
/**
 * Global alert rule manager instance
 */
export declare const globalAlertManager: AlertRuleManager;
//# sourceMappingURL=AlertRule.d.ts.map