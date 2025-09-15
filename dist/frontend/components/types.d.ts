/**
 * Shared types for the LogsViewer dashboard components
 */
import { LogLevel, LogDomain } from '../../backend/types/index';
import type { LogEntry } from '../../backend/models/LogEntry';
export interface LogViewerConfig {
    autoRefresh: boolean;
    refreshInterval: number;
    realTimeStreaming: boolean;
    pageSize: number;
    maxVisibleLogs: number;
    enableVirtualization: boolean;
    defaultTimeRange: string;
    enableExport: boolean;
    enableFiltering: boolean;
    enableSearch: boolean;
    compactMode: boolean;
}
export interface LogFilter {
    levels: LogLevel[];
    domains: LogDomain[];
    services: string[];
    users: string[];
    timeRange: {
        start: Date | null;
        end: Date | null;
        preset?: string;
    };
    search: {
        query: string;
        regex: boolean;
        caseSensitive: boolean;
    };
    advanced: {
        correlationId: string;
        hasErrors: boolean;
        hasContext: boolean;
        minDuration: number | null;
        maxDuration: number | null;
    };
}
export interface LogsViewerState {
    logs: LogEntry[];
    filteredLogs: LogEntry[];
    loading: boolean;
    streaming: boolean;
    error: string | null;
    totalCount: number;
    currentPage: number;
    selectedLogIds: Set<string>;
    expandedLogIds: Set<string>;
    filters: LogFilter;
    stats: LogStats | null;
    exportInProgress: boolean;
    streamingStats: StreamingStats;
}
export interface LogStats {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByDomain: Record<LogDomain, number>;
    logsByService: Record<string, number>;
    errorRate: number;
    averageResponseTime: number;
    timeRange: {
        start: Date;
        end: Date;
    };
}
export interface StreamingStats {
    connected: boolean;
    messagesReceived: number;
    bytesReceived: number;
    connectionTime: Date | null;
    lastMessage: Date | null;
    subscriptionId: string | null;
}
export declare const DEFAULT_CONFIG: LogViewerConfig;
export declare const TIME_RANGE_PRESETS: {
    label: string;
    value: string;
}[];
//# sourceMappingURL=types.d.ts.map