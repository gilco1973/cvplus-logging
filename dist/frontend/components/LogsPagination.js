import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export const LogsPagination = ({ currentPage, totalCount, pageSize, loading, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };
    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };
    return (_jsx("div", { className: "flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-700", children: ["Showing ", startItem, " to ", endItem, " of ", totalCount.toLocaleString(), " logs"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: handlePrevious, disabled: currentPage <= 1 || loading, className: "px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: handleNext, disabled: currentPage >= totalPages || loading, className: "px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white", children: "Next" })] })] }) }));
};
//# sourceMappingURL=LogsPagination.js.map