/**
 * Individual log entry item component
 * Displays a single log entry with expansion and selection capabilities
 */
import React from 'react';
import { LogViewerConfig } from './types';
import { LogLevel } from '../../backend/types/index';
import type { LogEntry } from '../../backend/models/LogEntry';
interface LogEntryItemProps {
    log: LogEntry;
    isSelected: boolean;
    isExpanded: boolean;
    config: LogViewerConfig;
    onSelect: () => void;
    onToggleExpansion: () => void;
    getLogLevelColor: (level: LogLevel) => string;
    formatTimestamp: (timestamp: Date | string) => string;
}
export declare const LogEntryItem: React.FC<LogEntryItemProps>;
export {};
//# sourceMappingURL=LogEntryItem.d.ts.map