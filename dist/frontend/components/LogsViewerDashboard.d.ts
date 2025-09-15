/**
 * T052: Main logs viewer dashboard component
 *
 * Orchestrates the complete log viewing experience by coordinating specialized components
 * for filtering, streaming, display, and export functionality.
 */
import React from 'react';
import { LogViewerConfig } from './types';
import type { LogEntry } from '../../backend/models/LogEntry';
export interface LogsViewerDashboardProps {
    config?: Partial<LogViewerConfig>;
    onLogSelect?: (log: LogEntry) => void;
    onExport?: (logs: LogEntry[]) => void;
}
export declare const LogsViewerDashboard: React.FC<LogsViewerDashboardProps>;
export default LogsViewerDashboard;
//# sourceMappingURL=LogsViewerDashboard.d.ts.map