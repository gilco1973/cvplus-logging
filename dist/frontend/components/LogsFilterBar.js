import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, Filter } from 'lucide-react';
import { TIME_RANGE_PRESETS } from './types';
import { LogLevel } from '../../backend/types/index';
export const LogsFilterBar = ({ filters, config, onFiltersChange, onApplyFilters, onResetFilters }) => {
    const updateFilters = (updates) => {
        onFiltersChange({ ...filters, ...updates });
    };
    const updateSearch = (searchUpdates) => {
        updateFilters({
            search: { ...filters.search, ...searchUpdates }
        });
    };
    const updateTimeRange = (timeRangeUpdates) => {
        updateFilters({
            timeRange: { ...filters.timeRange, ...timeRangeUpdates }
        });
    };
    const updateAdvanced = (advancedUpdates) => {
        updateFilters({
            advanced: { ...filters.advanced, ...advancedUpdates }
        });
    };
    return (_jsx("div", { className: "flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3", children: _jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [config.enableSearch && (_jsx("div", { className: "flex-1 min-w-64 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" }), _jsx("input", { type: "text", placeholder: "Search logs...", value: filters.search.query, onChange: (e) => updateSearch({ query: e.target.value }), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }) })), _jsx("select", { value: filters.timeRange.preset || 'custom', onChange: (e) => updateTimeRange({ preset: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500", children: TIME_RANGE_PRESETS.map(preset => (_jsx("option", { value: preset.value, children: preset.label }, preset.value))) }), _jsx("select", { multiple: true, value: filters.levels, onChange: (e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        updateFilters({ levels: selected });
                    }, className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500", children: Object.values(LogLevel).map(level => (_jsx("option", { value: level, children: level.toUpperCase() }, level))) }), _jsx("input", { type: "text", placeholder: "Service name...", value: filters.services.join(','), onChange: (e) => updateFilters({
                        services: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
                    }), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" }), _jsx("input", { type: "text", placeholder: "Correlation ID...", value: filters.advanced.correlationId, onChange: (e) => updateAdvanced({ correlationId: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex items-center gap-1 text-sm", children: [_jsx("input", { type: "checkbox", checked: filters.advanced.hasErrors, onChange: (e) => updateAdvanced({ hasErrors: e.target.checked }), className: "rounded" }), "Errors only"] }), _jsxs("label", { className: "flex items-center gap-1 text-sm", children: [_jsx("input", { type: "checkbox", checked: filters.search.regex, onChange: (e) => updateSearch({ regex: e.target.checked }), className: "rounded" }), "Regex"] }), _jsxs("label", { className: "flex items-center gap-1 text-sm", children: [_jsx("input", { type: "checkbox", checked: filters.search.caseSensitive, onChange: (e) => updateSearch({ caseSensitive: e.target.checked }), className: "rounded" }), "Case sensitive"] })] }), _jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [_jsxs("button", { onClick: onApplyFilters, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700", children: [_jsx(Filter, { className: "w-4 h-4" }), "Apply"] }), _jsx("button", { onClick: onResetFilters, className: "px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50", children: "Reset" })] })] }) }));
};
//# sourceMappingURL=LogsFilterBar.js.map