/**
 * Streaming manager component
 * Handles WebSocket connections for real-time log streaming
 */
import React from 'react';
import { LogFilter } from './types';
interface StreamingManagerProps {
    filters: LogFilter;
    maxVisibleLogs: number;
    onUpdate: (data: any) => void;
}
export interface StreamingManagerRef {
    start: () => void;
    stop: () => void;
    updateFilters: (filters: LogFilter) => void;
    cleanup: () => void;
}
export declare const StreamingManager: React.ForwardRefExoticComponent<StreamingManagerProps & React.RefAttributes<StreamingManagerRef>>;
export {};
//# sourceMappingURL=StreamingManager.d.ts.map