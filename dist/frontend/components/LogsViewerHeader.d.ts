/**
 * Header component for the logs viewer dashboard
 * Handles primary actions like refresh, streaming toggle, and export
 */
import React from 'react';
import { LogViewerConfig, LogsViewerState } from './types';
interface LogsViewerHeaderProps {
    state: LogsViewerState;
    config: LogViewerConfig;
    onRefresh: () => void;
    onStreamToggle: (streaming: boolean) => void;
    onExport: (format: 'json' | 'csv' | 'txt') => void;
    onError: (error: string | null) => void;
}
export declare const LogsViewerHeader: React.FC<LogsViewerHeaderProps>;
export {};
//# sourceMappingURL=LogsViewerHeader.d.ts.map