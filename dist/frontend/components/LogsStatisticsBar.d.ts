/**
 * Statistics bar component for the logs viewer
 * Displays log statistics, error rates, and streaming metrics
 */
import React from 'react';
import { LogStats, StreamingStats } from './types';
interface LogsStatisticsBarProps {
    stats: LogStats;
    streamingStats: StreamingStats;
    streaming: boolean;
}
export declare const LogsStatisticsBar: React.FC<LogsStatisticsBarProps>;
export {};
//# sourceMappingURL=LogsStatisticsBar.d.ts.map