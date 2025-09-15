/**
 * Filter bar component for the logs viewer
 * Handles search, time range, level filters, and advanced filtering options
 */
import React from 'react';
import { LogFilter, LogViewerConfig } from './types';
interface LogsFilterBarProps {
    filters: LogFilter;
    config: LogViewerConfig;
    onFiltersChange: (filters: LogFilter) => void;
    onApplyFilters: () => void;
    onResetFilters: () => void;
}
export declare const LogsFilterBar: React.FC<LogsFilterBarProps>;
export {};
//# sourceMappingURL=LogsFilterBar.d.ts.map