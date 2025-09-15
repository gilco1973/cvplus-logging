import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, Database } from 'lucide-react';
export const LogsStatisticsBar = ({ stats, streamingStats, streaming }) => {
    return (_jsx("div", { className: "flex-shrink-0 border-b border-gray-200 bg-blue-50 px-6 py-3", children: _jsxs("div", { className: "flex items-center gap-6 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsxs("span", { className: "text-gray-700", children: ["Error Rate: ", stats.errorRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Database, { className: "w-4 h-4 text-blue-600" }), _jsxs("span", { className: "text-gray-700", children: ["Avg Response: ", stats.averageResponseTime.toFixed(0), "ms"] })] }), _jsxs("div", { className: "text-gray-700", children: ["Total Logs: ", stats.totalLogs.toLocaleString()] }), _jsx("div", { className: "flex items-center gap-4", children: Object.entries(stats.logsByLevel).map(([level, count]) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: `w-2 h-2 rounded-full ${getLevelColor(level)}` }), _jsxs("span", { className: "text-xs text-gray-600", children: [level.toUpperCase(), ": ", count] })] }, level))) }), streaming && (_jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsxs("span", { className: "text-gray-700", children: [streamingStats.messagesReceived, " messages"] }), _jsxs("span", { className: "text-xs text-gray-500", children: ["(", formatBytes(streamingStats.bytesReceived), ")"] })] }))] }) }));
};
const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
        case 'fatal':
        case 'error':
            return 'bg-red-500';
        case 'warn':
            return 'bg-yellow-500';
        case 'info':
            return 'bg-blue-500';
        case 'debug':
            return 'bg-gray-500';
        default:
            return 'bg-gray-400';
    }
};
const formatBytes = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
//# sourceMappingURL=LogsStatisticsBar.js.map