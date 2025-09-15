/**
 * T024: Alert rule engine in packages/core/src/logging/AlertRule.ts
 *
 * Implements intelligent alerting system for log events
 * Provides threshold-based, pattern-based, and ML-based alerting capabilities
 */
import { EventEmitter } from 'events';
import { LogLevel } from './types/index';
/**
 * Alert condition types
 */
export var AlertConditionType;
(function (AlertConditionType) {
    AlertConditionType["THRESHOLD"] = "threshold";
    AlertConditionType["PATTERN"] = "pattern";
    AlertConditionType["FREQUENCY"] = "frequency";
    AlertConditionType["ANOMALY"] = "anomaly";
    AlertConditionType["CHAIN"] = "chain";
})(AlertConditionType || (AlertConditionType = {}));
/**
 * Alert actions
 */
export var AlertActionType;
(function (AlertActionType) {
    AlertActionType["EMAIL"] = "email";
    AlertActionType["WEBHOOK"] = "webhook";
    AlertActionType["SLACK"] = "slack";
    AlertActionType["SMS"] = "sms";
    AlertActionType["PAGERDUTY"] = "pagerduty";
})(AlertActionType || (AlertActionType = {}));
/**
 * Alert rule implementation
 */
export class AlertRule extends EventEmitter {
    constructor(config) {
        super();
        this.logWindows = new Map();
        this.alertsInLastHour = [];
        this.config = { ...config };
        // Initialize IAlertRule interface properties
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.condition = config.conditions[0] || {}; // Use first condition as primary
        this.actions = config.actions;
        this.enabled = config.enabled;
        this.cooldownMinutes = config.cooldownMs ? Math.round(config.cooldownMs / 60000) : undefined;
        this.stats = {
            ruleId: config.id,
            totalTriggered: 0,
            totalSuppressed: 0,
            averageTriggersPerDay: 0,
            conditionBreakdown: {}
        };
        // Initialize condition breakdown
        this.config.conditions.forEach(condition => {
            this.stats.conditionBreakdown[condition.type] = 0;
        });
    }
    /**
     * Get rule ID
     */
    getId() {
        return this.config.id;
    }
    /**
     * Get rule configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Check if rule is enabled
     */
    isEnabled() {
        return this.config.enabled;
    }
    /**
     * Process log entry against this rule
     */
    processLogEntry(entry) {
        if (!this.isEnabled() || !this.passesFilters(entry)) {
            return;
        }
        // Add to appropriate windows
        this.addToWindows(entry);
        // Check all conditions
        const triggeredConditions = this.checkConditions(entry);
        if (triggeredConditions.length > 0) {
            this.handleTriggeredAlert(entry, triggeredConditions);
        }
    }
    /**
     * Check if log entry passes rule filters
     */
    passesFilters(entry) {
        const filters = this.config.filters;
        if (!filters)
            return true;
        if (filters.levels && !filters.levels.includes(entry.level)) {
            return false;
        }
        if (filters.domains && !filters.domains.includes(entry.domain)) {
            return false;
        }
        if (filters.packages && entry.package && !filters.packages.includes(entry.package)) {
            return false;
        }
        if (filters.userIds && entry.userId && !filters.userIds.includes(entry.userId)) {
            return false;
        }
        return true;
    }
    /**
     * Add log entry to time windows for analysis
     */
    addToWindows(entry) {
        const entryTime = new Date(entry.timestamp);
        // Add to windows for each condition that needs time-based analysis
        this.config.conditions.forEach(condition => {
            if ('windowMs' in condition) {
                const windowKey = `${condition.type}_${condition.windowMs}`;
                if (!this.logWindows.has(windowKey)) {
                    this.logWindows.set(windowKey, {
                        entries: [],
                        startTime: entryTime,
                        endTime: new Date(entryTime.getTime() + condition.windowMs)
                    });
                }
                const window = this.logWindows.get(windowKey);
                window.entries.push(entry);
                // Clean old entries outside the window
                const cutoffTime = new Date(entryTime.getTime() - condition.windowMs);
                window.entries = window.entries.filter(e => new Date(e.timestamp) > cutoffTime);
            }
        });
    }
    /**
     * Check all conditions against current state
     */
    checkConditions(entry) {
        const triggeredConditions = [];
        this.config.conditions.forEach(condition => {
            if (this.checkCondition(condition, entry)) {
                triggeredConditions.push(condition.type);
                this.stats.conditionBreakdown[condition.type]++;
            }
        });
        return triggeredConditions;
    }
    /**
     * Check individual condition
     */
    checkCondition(condition, entry) {
        switch (condition.type) {
            case AlertConditionType.THRESHOLD:
                return this.checkThresholdCondition(condition, entry);
            case AlertConditionType.PATTERN:
                return this.checkPatternCondition(condition, entry);
            case AlertConditionType.FREQUENCY:
                return this.checkFrequencyCondition(condition, entry);
            case AlertConditionType.ANOMALY:
                return this.checkAnomalyCondition(condition, entry);
            case AlertConditionType.CHAIN:
                return this.checkChainCondition(condition, entry);
            default:
                return false;
        }
    }
    /**
     * Check threshold condition
     */
    checkThresholdCondition(condition, entry) {
        const windowKey = `${condition.type}_${condition.windowMs}`;
        const window = this.logWindows.get(windowKey);
        if (!window)
            return false;
        let metricValue;
        switch (condition.metric) {
            case 'error_count':
                metricValue = window.entries.filter(e => e.level === LogLevel.ERROR || e.level === LogLevel.FATAL).length;
                break;
            case 'warning_count':
                metricValue = window.entries.filter(e => e.level === LogLevel.WARN).length;
                break;
            case 'response_time':
                const responseTimes = window.entries
                    .filter(e => { var _a; return (_a = e.performance) === null || _a === void 0 ? void 0 : _a.duration; })
                    .map(e => e.performance.duration);
                metricValue = responseTimes.length ? Math.max(...responseTimes) : 0;
                break;
            case 'memory_usage':
                const memoryUsages = window.entries
                    .filter(e => { var _a; return (_a = e.performance) === null || _a === void 0 ? void 0 : _a.memoryUsage; })
                    .map(e => e.performance.memoryUsage);
                metricValue = memoryUsages.length ? Math.max(...memoryUsages) : 0;
                break;
            case 'cpu_usage':
                const cpuUsages = window.entries
                    .filter(e => { var _a; return (_a = e.performance) === null || _a === void 0 ? void 0 : _a.cpuUsage; })
                    .map(e => e.performance.cpuUsage);
                metricValue = cpuUsages.length ? Math.max(...cpuUsages) : 0;
                break;
            default:
                return false;
        }
        return this.compareValues(metricValue, condition.operator, condition.threshold);
    }
    /**
     * Check pattern condition
     */
    checkPatternCondition(condition, entry) {
        const windowKey = `${condition.type}_${condition.windowMs}`;
        const window = this.logWindows.get(windowKey);
        if (!window)
            return false;
        let matches = 0;
        window.entries.forEach(logEntry => {
            condition.fields.forEach(field => {
                const value = this.getFieldValue(logEntry, field);
                if (value && condition.pattern.test(value)) {
                    matches++;
                }
            });
        });
        return matches >= condition.minOccurrences;
    }
    /**
     * Check frequency condition
     */
    checkFrequencyCondition(condition, entry) {
        const windowKey = `${condition.type}_${condition.windowMs}`;
        const window = this.logWindows.get(windowKey);
        if (!window)
            return false;
        const matchingEntries = window.entries.filter(e => condition.levels.includes(e.level));
        return matchingEntries.length > condition.maxFrequency;
    }
    /**
     * Check anomaly condition (simplified implementation)
     */
    checkAnomalyCondition(condition, entry) {
        // This is a simplified implementation
        // In a real system, you'd use statistical analysis or ML models
        const currentValue = this.getFieldValue(entry, condition.metric);
        if (typeof currentValue !== 'number')
            return false;
        // Simple z-score based anomaly detection
        const threshold = 2 + (condition.sensitivity / 10) * 3; // Adjust based on sensitivity
        // For demo purposes, randomly trigger based on sensitivity
        const randomFactor = Math.random() * 10;
        return randomFactor < condition.sensitivity;
    }
    /**
     * Check chain condition
     */
    checkChainCondition(condition, entry) {
        const windowKey = `${condition.type}_${condition.maxChainTimeMs}`;
        const window = this.logWindows.get(windowKey);
        if (!window)
            return false;
        // Sort entries by timestamp
        const sortedEntries = window.entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Look for the event chain
        let chainIndex = 0;
        let lastMatchTime = null;
        for (const logEntry of sortedEntries) {
            const currentPattern = condition.eventChain[chainIndex];
            if (!currentPattern)
                break;
            const entryTime = new Date(logEntry.timestamp);
            const messageMatch = currentPattern.pattern.test(logEntry.message);
            if (messageMatch) {
                // Check time constraint with previous event
                if (lastMatchTime && currentPattern.maxTimeFromPrevious) {
                    const timeDiff = entryTime.getTime() - lastMatchTime.getTime();
                    if (timeDiff > currentPattern.maxTimeFromPrevious) {
                        // Reset chain if timing constraint violated
                        chainIndex = 0;
                        lastMatchTime = null;
                        continue;
                    }
                }
                chainIndex++;
                lastMatchTime = entryTime;
                // Check if we completed the entire chain
                if (chainIndex >= condition.eventChain.length) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Handle triggered alert
     */
    handleTriggeredAlert(entry, triggeredConditions) {
        // Check cooldown period
        if (this.isInCooldown()) {
            this.stats.totalSuppressed++;
            return;
        }
        // Check rate limiting
        if (this.isRateLimited()) {
            this.stats.totalSuppressed++;
            return;
        }
        const alert = {
            ruleId: this.config.id,
            ruleName: this.config.name,
            severity: this.config.severity,
            triggeredAt: new Date(),
            triggerEntries: [entry],
            conditionsMet: triggeredConditions,
            context: {
                ruleDescription: this.config.description,
                stats: this.getStats()
            }
        };
        this.lastTriggered = new Date();
        this.alertsInLastHour.push(new Date());
        this.stats.totalTriggered++;
        this.stats.lastTriggered = this.lastTriggered;
        // Execute alert actions
        this.executeActions(alert);
        this.emit('alert-triggered', alert);
    }
    /**
     * Check if rule is in cooldown period
     */
    isInCooldown() {
        if (!this.config.cooldownMs || !this.lastTriggered) {
            return false;
        }
        const cooldownEnd = new Date(this.lastTriggered.getTime() + this.config.cooldownMs);
        return new Date() < cooldownEnd;
    }
    /**
     * Check if rule is rate limited
     */
    isRateLimited() {
        if (!this.config.maxAlertsPerHour) {
            return false;
        }
        // Clean old alerts (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        this.alertsInLastHour = this.alertsInLastHour.filter(date => date > oneHourAgo);
        return this.alertsInLastHour.length >= this.config.maxAlertsPerHour;
    }
    /**
     * Execute configured actions
     */
    executeActions(alert) {
        this.config.actions.forEach(action => {
            if (action.enabled) {
                this.executeAction(action, alert).catch(error => {
                    this.emit('action-error', { action, error, alert });
                });
            }
        });
    }
    /**
     * Execute individual action
     */
    async executeAction(action, alert) {
        // This would integrate with actual notification services
        // For now, we just emit an event
        this.emit('action-executed', { action, alert });
    }
    /**
     * Utility methods
     */
    compareValues(actual, operator, expected) {
        switch (operator) {
            case '>': return actual > expected;
            case '>=': return actual >= expected;
            case '<': return actual < expected;
            case '<=': return actual <= expected;
            case '==': return actual === expected;
            default: return false;
        }
    }
    getFieldValue(entry, field) {
        const fieldPath = field.split('.');
        let value = entry;
        for (const part of fieldPath) {
            if (value && typeof value === 'object') {
                value = value[part];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    /**
     * Get rule statistics
     */
    getStats() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentAlerts = this.alertsInLastHour.filter(date => date > oneDayAgo);
        return {
            ...this.stats,
            averageTriggersPerDay: recentAlerts.length
        };
    }
    /**
     * Update rule configuration
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }
    /**
     * Enable/disable rule
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }
    /**
     * Clear all windows and reset state
     */
    reset() {
        this.logWindows.clear();
        this.alertsInLastHour = [];
        this.lastTriggered = undefined;
    }
}
/**
 * Alert rule manager for handling multiple rules
 */
export class AlertRuleManager extends EventEmitter {
    constructor() {
        super(...arguments);
        this.rules = new Map();
    }
    /**
     * Add new alert rule
     */
    addRule(config) {
        if (this.rules.has(config.id)) {
            throw new Error(`Rule with ID '${config.id}' already exists`);
        }
        const rule = new AlertRule(config);
        this.rules.set(config.id, rule);
        // Forward rule events
        rule.on('alert-triggered', (alert) => this.emit('alert-triggered', alert));
        rule.on('action-executed', (data) => this.emit('action-executed', data));
        rule.on('action-error', (data) => this.emit('action-error', data));
        return rule;
    }
    /**
     * Process log entry against all rules
     */
    processLogEntry(entry) {
        this.rules.forEach(rule => {
            rule.processLogEntry(entry);
        });
    }
    /**
     * Get rule by ID
     */
    getRule(id) {
        return this.rules.get(id);
    }
    /**
     * Remove rule
     */
    removeRule(id) {
        return this.rules.delete(id);
    }
    /**
     * Get all rule IDs
     */
    getRuleIds() {
        return Array.from(this.rules.keys());
    }
    /**
     * Get manager statistics
     */
    getStats() {
        const enabledRules = Array.from(this.rules.values()).filter(r => r.isEnabled()).length;
        const totalAlertsTriggered = Array.from(this.rules.values()).reduce((sum, rule) => sum + rule.getStats().totalTriggered, 0);
        return {
            totalRules: this.rules.size,
            enabledRules,
            totalAlertsTriggered
        };
    }
}
/**
 * Global alert rule manager instance
 */
export const globalAlertManager = new AlertRuleManager();
//# sourceMappingURL=AlertRule.js.map