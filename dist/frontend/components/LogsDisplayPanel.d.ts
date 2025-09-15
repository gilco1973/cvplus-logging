/**
 * Log display panel component
 * Handles the virtualized display of log entries with selection and expansion
 */
import React from 'react';
import { LogViewerConfig } from './types';
import type { LogEntry } from '../../backend/models/LogEntry';
interface LogsDisplayPanelProps {
    logs: LogEntry[];
    selectedLogIds: Set<string>;
    expandedLogIds: Set<string>;
    config: LogViewerConfig;
    onLogSelect?: (log: LogEntry) => void;
    onSelectionChange: (selectedLogIds: Set<string>) => void;
    onExpansionChange: (expandedLogIds: Set<string>) => void;
}
export declare const LogsDisplayPanel: React.FC<LogsDisplayPanelProps>;
export {};
//# sourceMappingURL=LogsDisplayPanel.d.ts.map