/**
 * API service for logs operations
 * Handles all API calls and data management for the logs viewer
 */
import { LogFilter, LogViewerConfig } from './types';
export declare const useLogsApiService: (config: LogViewerConfig) => {
    loadLogs: (filters: LogFilter, page?: number, append?: boolean) => Promise<{
        logs: any;
        pagination: any;
        stats: any;
    }>;
    buildSearchParams: (filters: LogFilter, page: number) => string;
};
//# sourceMappingURL=LogsApiService.d.ts.map