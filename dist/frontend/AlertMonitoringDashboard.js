import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * T053: Alert monitoring dashboard component
 *
 * Comprehensive alert monitoring dashboard with real-time updates,
 * alert management, escalation tracking, and interactive visualizations.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Bell, BellOff, CheckCircle, XCircle, ArrowUp, Filter, RefreshCw, Settings, Eye, MoreHorizontal, Zap } from 'lucide-react';
import { logger } from '../backend/index';
// Alert types and interfaces
export var AlertStatus;
(function (AlertStatus) {
    AlertStatus["TRIGGERED"] = "triggered";
    AlertStatus["ACKNOWLEDGED"] = "acknowledged";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["ESCALATED"] = "escalated";
    AlertStatus["SUPPRESSED"] = "suppressed";
})(AlertStatus || (AlertStatus = {}));
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
const DEFAULT_CONFIG = {
    autoRefresh: true,
    refreshInterval: 30000,
    realTimeUpdates: true,
    showResolvedAlerts: false,
    compactMode: false,
    enableBulkActions: true,
    enableNotifications: true,
    pageSize: 25,
    defaultTimeRange: '24h'
};
const TIME_RANGE_PRESETS = [
    { label: 'Last hour', value: '1h' },
    { label: 'Last 6 hours', value: '6h' },
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Custom range', value: 'custom' }
];
export const AlertMonitoringDashboard = ({ config: userConfig = {}, onAlertSelect, onBulkAction }) => {
    const config = { ...DEFAULT_CONFIG, ...userConfig };
    // State management
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAlertIds, setSelectedAlertIds] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    // Filter state
    const [filters, setFilters] = useState({
        status: config.showResolvedAlerts ? [] : [AlertStatus.TRIGGERED, AlertStatus.ACKNOWLEDGED, AlertStatus.ESCALATED],
        severity: [],
        ruleId: [],
        ruleName: '',
        acknowledgedBy: [],
        unacknowledged: false,
        escalationLevel: [],
        timeRange: { start: null, end: null, preset: config.defaultTimeRange },
        search: '',
        tags: [],
        environment: []
    });
    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [bulkActionMode, setBulkActionMode] = useState(false);
    const [sortBy, setSortBy] = useState('triggerTime');
    const [sortOrder, setSortOrder] = useState('desc');
    // Refs
    const refreshTimerRef = useRef(null);
    const wsRef = useRef(null);
    /**
     * Initialize dashboard
     */
    useEffect(() => {
        logger.info('alert_dashboard.initialized', {
            config,
            defaultTimeRange: config.defaultTimeRange
        });
        loadAlerts();
        loadStats();
        if (config.autoRefresh) {
            startAutoRefresh();
        }
        if (config.realTimeUpdates) {
            connectWebSocket();
        }
        return () => {
            cleanup();
        };
    }, []);
    /**
     * Load alerts from API
     */
    const loadAlerts = useCallback(async (page = 1) => {
        var _a;
        setLoading(true);
        setError(null);
        try {
            const searchParams = buildAlertSearchParams(page);
            const response = await fetch(`/api/v1/alerts?${searchParams}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(((_a = result.error) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to load alerts');
            }
            const alertData = result.data.alerts || [];
            const pagination = result.data.pagination || {};
            setAlerts(alertData);
            setTotalCount(pagination.total || 0);
            setCurrentPage(page);
            logger.info('alert_dashboard.alerts_loaded', {
                count: alertData.length,
                total: pagination.total,
                page
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            logger.error('alert_dashboard.load_alerts_failed', {
                page
            });
        }
        finally {
            setLoading(false);
        }
    }, [filters, sortBy, sortOrder, config.pageSize]);
    /**
     * Load statistics from API
     */
    const loadStats = useCallback(async () => {
        try {
            const timeRange = filters.timeRange.preset || '24h';
            const response = await fetch(`/api/v1/alerts/stats?timeRange=${timeRange}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        }
        catch (error) {
            logger.error('alert_dashboard.load_stats_failed', {}, error instanceof Error ? error : undefined);
        }
    }, [filters.timeRange.preset]);
    /**
     * Build search parameters for alerts API
     */
    const buildAlertSearchParams = useCallback((page) => {
        const params = new URLSearchParams();
        // Pagination
        params.set('page', page.toString());
        params.set('limit', config.pageSize.toString());
        // Sorting
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        // Filters
        if (filters.status.length > 0) {
            filters.status.forEach(status => params.append('status', status));
        }
        if (filters.severity.length > 0) {
            filters.severity.forEach(severity => params.append('severity', severity));
        }
        if (filters.ruleId.length > 0) {
            filters.ruleId.forEach(ruleId => params.append('ruleId', ruleId));
        }
        if (filters.ruleName) {
            params.set('ruleName', filters.ruleName);
        }
        if (filters.acknowledgedBy.length > 0) {
            filters.acknowledgedBy.forEach(user => params.append('acknowledgedBy', user));
        }
        if (filters.unacknowledged) {
            params.set('unacknowledged', 'true');
        }
        if (filters.search) {
            params.set('search', filters.search);
        }
        // Time range
        if (filters.timeRange.preset && filters.timeRange.preset !== 'custom') {
            params.set('timeRange', filters.timeRange.preset);
        }
        else if (filters.timeRange.start && filters.timeRange.end) {
            params.set('triggerTimeStart', filters.timeRange.start.toISOString());
            params.set('triggerTimeEnd', filters.timeRange.end.toISOString());
        }
        // Include resolved alerts
        params.set('includeResolvedAlerts', config.showResolvedAlerts.toString());
        return params.toString();
    }, [filters, sortBy, sortOrder, config.pageSize, config.showResolvedAlerts]);
    /**
     * WebSocket connection for real-time updates
     */
    const connectWebSocket = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/alerts/stream`);
        ws.onopen = () => {
            logger.info('alert_dashboard.websocket_connected');
        };
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            }
            catch (error) {
                logger.error('alert_dashboard.websocket_message_error', {}, error instanceof Error ? error : undefined);
            }
        };
        ws.onclose = () => {
            logger.info('alert_dashboard.websocket_disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (config.realTimeUpdates) {
                    connectWebSocket();
                }
            }, 5000);
        };
        ws.onerror = (error) => {
            logger.error('alert_dashboard.websocket_error', {}, error instanceof Error ? error : undefined);
        };
        wsRef.current = ws;
    }, [config.realTimeUpdates]);
    /**
     * Handle WebSocket messages
     */
    const handleWebSocketMessage = useCallback((message) => {
        if (message.type === 'alert_update') {
            const updatedAlert = message.data;
            setAlerts(prev => {
                const index = prev.findIndex(alert => alert.id === updatedAlert.id);
                if (index >= 0) {
                    const newAlerts = [...prev];
                    newAlerts[index] = updatedAlert;
                    return newAlerts;
                }
                else {
                    return [updatedAlert, ...prev];
                }
            });
            // Show notification for new high-priority alerts
            if (config.enableNotifications &&
                updatedAlert.severity === AlertSeverity.CRITICAL &&
                updatedAlert.status === AlertStatus.TRIGGERED) {
                showNotification(updatedAlert);
            }
            // Refresh stats
            loadStats();
        }
    }, [config.enableNotifications, loadStats]);
    /**
     * Show browser notification
     */
    const showNotification = useCallback((alert) => {
        if (Notification.permission === 'granted') {
            new Notification('Critical Alert', {
                body: `${alert.ruleName}: ${alert.context.message || 'Critical alert triggered'}`,
                icon: '/favicon.ico',
                tag: alert.id
            });
        }
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification(alert);
                }
            });
        }
    }, []);
    /**
     * Auto-refresh functionality
     */
    const startAutoRefresh = useCallback(() => {
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }
        refreshTimerRef.current = setInterval(() => {
            loadAlerts(currentPage);
            loadStats();
        }, config.refreshInterval);
    }, [config.refreshInterval, currentPage, loadAlerts, loadStats]);
    /**
     * Alert actions
     */
    const acknowledgeAlert = useCallback(async (alertId, note) => {
        try {
            const response = await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note })
            });
            if (!response.ok) {
                throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
            }
            logger.info('alert_dashboard.alert_acknowledged', {
                alertId,
                hasNote: !!note
            });
            // Refresh alerts
            loadAlerts(currentPage);
        }
        catch (error) {
            logger.error('alert_dashboard.acknowledge_failed', { alertId }, error instanceof Error ? error : undefined);
            setError(`Failed to acknowledge alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [currentPage, loadAlerts]);
    const resolveAlert = useCallback(async (alertId, note, resolution) => {
        try {
            const response = await fetch(`/api/v1/alerts/${alertId}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note, resolution })
            });
            if (!response.ok) {
                throw new Error(`Failed to resolve alert: ${response.statusText}`);
            }
            logger.info('alert_dashboard.alert_resolved', {
                alertId,
                hasNote: !!note,
                resolution
            });
            // Refresh alerts
            loadAlerts(currentPage);
        }
        catch (error) {
            logger.error('alert_dashboard.resolve_failed', { alertId }, error instanceof Error ? error : undefined);
            setError(`Failed to resolve alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [currentPage, loadAlerts]);
    const performBulkAction = useCallback(async (action, parameters) => {
        var _a, _b, _c, _d;
        if (selectedAlertIds.size === 0)
            return;
        try {
            const response = await fetch('/api/v1/alerts/bulk-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alertIds: Array.from(selectedAlertIds),
                    action,
                    parameters
                })
            });
            if (!response.ok) {
                throw new Error(`Bulk action failed: ${response.statusText}`);
            }
            const result = await response.json();
            logger.info('alert_dashboard.bulk_action_performed', {
                action,
                alertCount: selectedAlertIds.size,
                successful: ((_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.successful) === null || _b === void 0 ? void 0 : _b.length) || 0,
                failed: ((_d = (_c = result.data) === null || _c === void 0 ? void 0 : _c.failed) === null || _d === void 0 ? void 0 : _d.length) || 0
            });
            // Clear selection and refresh
            setSelectedAlertIds(new Set());
            setBulkActionMode(false);
            loadAlerts(currentPage);
            if (onBulkAction) {
                onBulkAction(Array.from(selectedAlertIds), action);
            }
        }
        catch (error) {
            logger.error('alert_dashboard.bulk_action_failed', {
                action,
                alertCount: selectedAlertIds.size
            }, error instanceof Error ? error : undefined);
            setError(`Bulk action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [selectedAlertIds, currentPage, loadAlerts, onBulkAction]);
    /**
     * Helper functions
     */
    const getSeverityColor = (severity) => {
        switch (severity) {
            case AlertSeverity.CRITICAL: return 'text-red-600 bg-red-100 border-red-200';
            case AlertSeverity.HIGH: return 'text-orange-600 bg-orange-100 border-orange-200';
            case AlertSeverity.MEDIUM: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case AlertSeverity.LOW: return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case AlertStatus.TRIGGERED: return 'text-red-600 bg-red-50';
            case AlertStatus.ACKNOWLEDGED: return 'text-blue-600 bg-blue-50';
            case AlertStatus.RESOLVED: return 'text-green-600 bg-green-50';
            case AlertStatus.ESCALATED: return 'text-purple-600 bg-purple-50';
            case AlertStatus.SUPPRESSED: return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case AlertStatus.TRIGGERED: return _jsx(AlertTriangle, { className: "w-4 h-4" });
            case AlertStatus.ACKNOWLEDGED: return _jsx(Eye, { className: "w-4 h-4" });
            case AlertStatus.RESOLVED: return _jsx(CheckCircle, { className: "w-4 h-4" });
            case AlertStatus.ESCALATED: return _jsx(ArrowUp, { className: "w-4 h-4" });
            case AlertStatus.SUPPRESSED: return _jsx(BellOff, { className: "w-4 h-4" });
            default: return _jsx(Bell, { className: "w-4 h-4" });
        }
    };
    const formatDuration = (start, end) => {
        const endTime = end || new Date();
        const duration = endTime.getTime() - start.getTime();
        const minutes = Math.floor(duration / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ${hours % 24}h`;
        if (hours > 0)
            return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    };
    const formatTimestamp = (timestamp) => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        return date.toLocaleString();
    };
    const cleanup = useCallback(() => {
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
    }, []);
    return (_jsxs("div", { className: "h-full flex flex-col bg-white", children: [_jsxs("div", { className: "flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Alert Monitor" }), _jsxs("div", { className: "flex items-center gap-4", children: [config.realTimeUpdates && (_jsxs("div", { className: "flex items-center gap-1 text-green-600", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm", children: "Live" })] })), loading && (_jsxs("div", { className: "flex items-center gap-1 text-blue-600", children: [_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }), _jsx("span", { className: "text-sm", children: "Loading" })] })), _jsxs("div", { className: "text-sm text-gray-500", children: [totalCount, " total alerts"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`, children: [_jsx(Filter, { className: "w-4 h-4" }), "Filters"] }), config.enableBulkActions && (_jsxs("button", { onClick: () => setBulkActionMode(!bulkActionMode), className: `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${bulkActionMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`, children: [_jsx(Settings, { className: "w-4 h-4" }), "Bulk Actions"] })), _jsxs("button", { onClick: () => {
                                            loadAlerts(1);
                                            loadStats();
                                        }, disabled: loading, className: "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] })] }), error && (_jsxs("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-md", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [_jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Error" })] }), _jsx("button", { onClick: () => setError(null), className: "text-red-600 hover:text-red-800", children: _jsx(XCircle, { className: "w-4 h-4" }) })] }), _jsx("p", { className: "mt-1 text-sm text-red-700", children: error })] }))] }), stats && (_jsx("div", { className: "flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3", children: _jsxs("div", { className: "grid grid-cols-6 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: stats.byStatus[AlertStatus.TRIGGERED] || 0 }), _jsx("div", { className: "text-xs text-gray-600", children: "Active" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: stats.byStatus[AlertStatus.ACKNOWLEDGED] || 0 }), _jsx("div", { className: "text-xs text-gray-600", children: "Acknowledged" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: stats.byStatus[AlertStatus.RESOLVED] || 0 }), _jsx("div", { className: "text-xs text-gray-600", children: "Resolved" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: stats.escalationStats.escalatedAlerts }), _jsx("div", { className: "text-xs text-gray-600", children: "Escalated" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [Math.round(stats.responseStats.averageAcknowledgmentTime / 60000), "m"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Avg Response" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-gray-600", children: [Math.round(stats.responseStats.averageResolutionTime / 60000), "m"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Avg Resolution" })] })] }) })), showFilters && (_jsxs("div", { className: "flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-4", children: [_jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Status" }), _jsx("select", { multiple: true, value: filters.status, onChange: (e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFilters(prev => ({ ...prev, status: selected }));
                                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm", children: Object.values(AlertStatus).map(status => (_jsx("option", { value: status, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Severity" }), _jsx("select", { multiple: true, value: filters.severity, onChange: (e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFilters(prev => ({ ...prev, severity: selected }));
                                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm", children: Object.values(AlertSeverity).map(severity => (_jsx("option", { value: severity, children: severity.charAt(0).toUpperCase() + severity.slice(1) }, severity))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Time Range" }), _jsx("select", { value: filters.timeRange.preset || 'custom', onChange: (e) => setFilters(prev => ({
                                            ...prev,
                                            timeRange: { ...prev.timeRange, preset: e.target.value }
                                        })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm", children: TIME_RANGE_PRESETS.map(preset => (_jsx("option", { value: preset.value, children: preset.label }, preset.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Search" }), _jsx("input", { type: "text", placeholder: "Search alerts...", value: filters.search, onChange: (e) => setFilters(prev => ({ ...prev, search: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm" })] })] }), _jsxs("div", { className: "mt-4 flex items-center gap-2", children: [_jsx("button", { onClick: () => {
                                    setCurrentPage(1);
                                    loadAlerts(1);
                                }, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm", children: "Apply Filters" }), _jsx("button", { onClick: () => setFilters({
                                    status: config.showResolvedAlerts ? [] : [AlertStatus.TRIGGERED, AlertStatus.ACKNOWLEDGED, AlertStatus.ESCALATED],
                                    severity: [],
                                    ruleId: [],
                                    ruleName: '',
                                    acknowledgedBy: [],
                                    unacknowledged: false,
                                    escalationLevel: [],
                                    timeRange: { start: null, end: null, preset: config.defaultTimeRange },
                                    search: '',
                                    tags: [],
                                    environment: []
                                }), className: "px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm", children: "Reset" })] })] })), bulkActionMode && selectedAlertIds.size > 0 && (_jsx("div", { className: "flex-shrink-0 border-b border-gray-200 bg-blue-50 px-6 py-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-blue-800", children: [selectedAlertIds.size, " alert", selectedAlertIds.size !== 1 ? 's' : '', " selected"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => performBulkAction('acknowledge'), className: "px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm", children: "Acknowledge" }), _jsx("button", { onClick: () => performBulkAction('resolve'), className: "px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm", children: "Resolve" }), _jsx("button", { onClick: () => {
                                        setSelectedAlertIds(new Set());
                                        setBulkActionMode(false);
                                    }, className: "px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm", children: "Cancel" })] })] }) })), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx("div", { className: "h-full overflow-y-auto", children: alerts.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-gray-500", children: _jsxs("div", { className: "text-center", children: [_jsx(Bell, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { className: "text-lg font-medium", children: "No alerts found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your filters" })] }) })) : (_jsx("div", { className: "divide-y divide-gray-200", children: alerts.map((alert) => (_jsx("div", { className: `p-4 hover:bg-gray-50 cursor-pointer ${selectedAlertIds.has(alert.id) ? 'bg-blue-50' : ''}`, onClick: () => {
                                if (bulkActionMode) {
                                    const newSelection = new Set(selectedAlertIds);
                                    if (newSelection.has(alert.id)) {
                                        newSelection.delete(alert.id);
                                    }
                                    else {
                                        newSelection.add(alert.id);
                                    }
                                    setSelectedAlertIds(newSelection);
                                }
                                else if (onAlertSelect) {
                                    onAlertSelect(alert);
                                }
                            }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [bulkActionMode && (_jsx("input", { type: "checkbox", checked: selectedAlertIds.has(alert.id), onChange: () => { }, className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" })), _jsx("span", { className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`, children: alert.severity.toUpperCase() }), _jsxs("span", { className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`, children: [getStatusIcon(alert.status), alert.status.charAt(0).toUpperCase() + alert.status.slice(1)] }), _jsx("span", { className: "text-xs text-gray-500", children: formatTimestamp(alert.triggerTime) }), alert.escalationLevel > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800", children: [_jsx(Zap, { className: "w-3 h-3" }), "L", alert.escalationLevel] })), _jsxs("span", { className: "text-xs text-gray-500", children: ["Duration: ", formatDuration(alert.triggerTime, alert.resolvedTime)] })] }), _jsx("h3", { className: "text-sm font-medium text-gray-900 mb-1", children: alert.ruleName }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: alert.context.message || 'No additional details available' }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [_jsx("span", { className: "bg-gray-100 px-2 py-0.5 rounded", children: alert.metadata.environment }), _jsx("span", { className: "bg-gray-100 px-2 py-0.5 rounded", children: alert.metadata.source }), alert.acknowledgedBy && (_jsxs("span", { className: "bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: ["Acked by ", alert.acknowledgedBy] }))] })] }), !bulkActionMode && (_jsxs("div", { className: "ml-4 flex items-center gap-2", children: [alert.status === AlertStatus.TRIGGERED && (_jsx("button", { onClick: (e) => {
                                                    e.stopPropagation();
                                                    acknowledgeAlert(alert.id);
                                                }, className: "p-1 text-blue-600 hover:bg-blue-50 rounded", title: "Acknowledge", children: _jsx(Eye, { className: "w-4 h-4" }) })), (alert.status === AlertStatus.TRIGGERED || alert.status === AlertStatus.ACKNOWLEDGED) && (_jsx("button", { onClick: (e) => {
                                                    e.stopPropagation();
                                                    resolveAlert(alert.id);
                                                }, className: "p-1 text-green-600 hover:bg-green-50 rounded", title: "Resolve", children: _jsx(CheckCircle, { className: "w-4 h-4" }) })), _jsx("button", { className: "p-1 text-gray-400 hover:bg-gray-50 rounded", title: "More actions", children: _jsx(MoreHorizontal, { className: "w-4 h-4" }) })] }))] }) }, alert.id))) })) }) }), totalCount > config.pageSize && (_jsx("div", { className: "flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-700", children: ["Showing ", ((currentPage - 1) * config.pageSize) + 1, " to ", Math.min(currentPage * config.pageSize, totalCount), " of ", totalCount, " alerts"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => loadAlerts(currentPage - 1), disabled: currentPage <= 1 || loading, className: "px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm", children: ["Page ", currentPage, " of ", Math.ceil(totalCount / config.pageSize)] }), _jsx("button", { onClick: () => loadAlerts(currentPage + 1), disabled: currentPage >= Math.ceil(totalCount / config.pageSize) || loading, className: "px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50", children: "Next" })] })] }) }))] }));
};
export default AlertMonitoringDashboard;
//# sourceMappingURL=AlertMonitoringDashboard.js.map