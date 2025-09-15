import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Database } from 'lucide-react';
import { LogEntryItem } from './LogEntryItem';
import { LogLevel } from '../../backend/types/index';
export const LogsDisplayPanel = ({ logs, selectedLogIds, expandedLogIds, config, onLogSelect, onSelectionChange, onExpansionChange }) => {
    const toggleLogSelection = (logId) => {
        const newSelection = new Set(selectedLogIds);
        if (newSelection.has(logId)) {
            newSelection.delete(logId);
        }
        else {
            newSelection.add(logId);
        }
        onSelectionChange(newSelection);
    };
    const toggleLogExpansion = (logId) => {
        const newExpansion = new Set(expandedLogIds);
        if (newExpansion.has(logId)) {
            newExpansion.delete(logId);
        }
        else {
            newExpansion.add(logId);
        }
        onExpansionChange(newExpansion);
        const log = logs.find(l => l.id === logId);
        if (log && onLogSelect) {
            onLogSelect(log);
        }
    };
    const getLogLevelColor = (level) => {
        switch (level) {
            case LogLevel.FATAL: return 'text-red-500 bg-red-50 border-red-200';
            case LogLevel.ERROR: return 'text-red-600 bg-red-50 border-red-200';
            case LogLevel.WARN: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case LogLevel.INFO: return 'text-blue-600 bg-blue-50 border-blue-200';
            case LogLevel.DEBUG: return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    const formatTimestamp = (timestamp) => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    if (logs.length === 0) {
        return (_jsx("div", { className: "flex-1 overflow-hidden", children: _jsx("div", { className: "flex items-center justify-center h-full text-gray-500", children: _jsxs("div", { className: "text-center", children: [_jsx(Database, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { className: "text-lg font-medium", children: "No logs found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your filters or time range" })] }) }) }));
    }
    return (_jsx("div", { className: "flex-1 overflow-hidden", children: _jsx("div", { className: "h-full overflow-y-auto", children: _jsx("div", { className: "space-y-1 p-4", children: logs.map((log) => (_jsx(LogEntryItem, { log: log, isSelected: selectedLogIds.has(log.id), isExpanded: expandedLogIds.has(log.id), config: config, onSelect: () => toggleLogSelection(log.id), onToggleExpansion: () => toggleLogExpansion(log.id), getLogLevelColor: getLogLevelColor, formatTimestamp: formatTimestamp }, log.id))) }) }) }));
};
//# sourceMappingURL=LogsDisplayPanel.js.map