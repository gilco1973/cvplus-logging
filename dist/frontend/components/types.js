/**
 * Shared types for the LogsViewer dashboard components
 */
export const DEFAULT_CONFIG = {
    autoRefresh: false,
    refreshInterval: 30000,
    realTimeStreaming: false,
    pageSize: 50,
    maxVisibleLogs: 1000,
    enableVirtualization: true,
    defaultTimeRange: '1h',
    enableExport: true,
    enableFiltering: true,
    enableSearch: true,
    compactMode: false
};
export const TIME_RANGE_PRESETS = [
    { label: 'Last 15 minutes', value: '15m' },
    { label: 'Last hour', value: '1h' },
    { label: 'Last 6 hours', value: '6h' },
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Custom range', value: 'custom' }
];
//# sourceMappingURL=types.js.map