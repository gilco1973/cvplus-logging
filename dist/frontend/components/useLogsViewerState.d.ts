/**
 * Custom hook for logs viewer state management
 * Handles all state logic for the logs viewer dashboard
 */
import { LogsViewerState, LogViewerConfig } from './types';
export declare const useLogsViewerState: (config: LogViewerConfig) => {
    state: LogsViewerState;
    updateState: (updates: Partial<LogsViewerState> | ((prev: LogsViewerState) => LogsViewerState)) => void;
    resetFilters: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLogsData: (logsData: {
        logs: any[];
        totalCount: number;
        currentPage: number;
        stats?: any;
        append?: boolean;
    }) => void;
    setFilters: (filters: LogsViewerState["filters"]) => void;
    setSelectedLogIds: (selectedLogIds: Set<string>) => void;
    setExpandedLogIds: (expandedLogIds: Set<string>) => void;
    setExportInProgress: (exportInProgress: boolean) => void;
    updateStreamingStats: (streamingData: any) => void;
};
//# sourceMappingURL=useLogsViewerState.d.ts.map