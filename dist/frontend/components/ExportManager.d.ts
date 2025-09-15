/**
 * Export manager component
 * Handles log export functionality with support for various formats
 */
import React from 'react';
import type { LogEntry } from '../../backend/models/LogEntry';
interface ExportManagerProps {
    buildSearchParams: (page: number) => string;
    totalCount: number;
    filteredLogs: LogEntry[];
    onExport?: (logs: LogEntry[]) => void;
    onProgress: (inProgress: boolean) => void;
    onError: (error: string | null) => void;
}
export interface ExportManagerRef {
    export: (format: 'json' | 'csv' | 'txt') => Promise<void>;
}
export declare const ExportManager: React.ForwardRefExoticComponent<ExportManagerProps & React.RefAttributes<ExportManagerRef>>;
export {};
//# sourceMappingURL=ExportManager.d.ts.map