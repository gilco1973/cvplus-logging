/**
 * Pagination component for the logs viewer
 * Handles page navigation and displays current page information
 */
import React from 'react';
interface LogsPaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    loading: boolean;
    onPageChange: (page: number) => void;
}
export declare const LogsPagination: React.FC<LogsPaginationProps>;
export {};
//# sourceMappingURL=LogsPagination.d.ts.map