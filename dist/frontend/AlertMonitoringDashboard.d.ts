/**
 * T053: Alert monitoring dashboard component
 *
 * Comprehensive alert monitoring dashboard with real-time updates,
 * alert management, escalation tracking, and interactive visualizations.
 */
import React from 'react';
export declare enum AlertStatus {
    TRIGGERED = "triggered",
    ACKNOWLEDGED = "acknowledged",
    RESOLVED = "resolved",
    ESCALATED = "escalated",
    SUPPRESSED = "suppressed"
}
export declare enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface AlertInstance {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: AlertSeverity;
    status: AlertStatus;
    triggerTime: Date;
    resolvedTime?: Date;
    acknowledgedTime?: Date;
    acknowledgedBy?: string;
    escalationLevel: number;
    matchedLogs: string[];
    context: Record<string, any>;
    actions: AlertActionResult[];
    metadata: {
        environment: string;
        region: string;
        source: string;
        tags: string[];
    };
}
export interface AlertActionResult {
    id: string;
    actionType: string;
    status: 'pending' | 'completed' | 'failed' | 'skipped';
    executedAt?: Date;
    completedAt?: Date;
    attempts: number;
    lastError?: string;
    result?: any;
}
export interface AlertStats {
    total: number;
    byStatus: Record<AlertStatus, number>;
    bySeverity: Record<AlertSeverity, number>;
    byRule: Record<string, number>;
    escalationStats: {
        averageEscalationLevel: number;
        highestEscalationLevel: number;
        escalatedAlerts: number;
    };
    responseStats: {
        averageAcknowledgmentTime: number;
        averageResolutionTime: number;
        unacknowledgedCount: number;
        unresolvedCount: number;
    };
    timeRange: {
        start: Date;
        end: Date;
    };
}
export interface AlertFilter {
    status: AlertStatus[];
    severity: AlertSeverity[];
    ruleId: string[];
    ruleName: string;
    acknowledgedBy: string[];
    unacknowledged: boolean;
    escalationLevel: number[];
    timeRange: {
        start: Date | null;
        end: Date | null;
        preset?: string;
    };
    search: string;
    tags: string[];
    environment: string[];
}
export interface AlertDashboardConfig {
    autoRefresh: boolean;
    refreshInterval: number;
    realTimeUpdates: boolean;
    showResolvedAlerts: boolean;
    compactMode: boolean;
    enableBulkActions: boolean;
    enableNotifications: boolean;
    pageSize: number;
    defaultTimeRange: string;
}
export declare const AlertMonitoringDashboard: React.FC<{
    config?: Partial<AlertDashboardConfig>;
    onAlertSelect?: (alert: AlertInstance) => void;
    onBulkAction?: (alertIds: string[], action: string) => void;
}>;
export default AlertMonitoringDashboard;
//# sourceMappingURL=AlertMonitoringDashboard.d.ts.map