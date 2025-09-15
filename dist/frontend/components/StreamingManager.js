/**
 * Streaming manager component
 * Handles WebSocket connections for real-time log streaming
 */
import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { logger } from '../../backend/index';
export const StreamingManager = forwardRef(({ filters, maxVisibleLogs, onUpdate }, ref) => {
    const wsRef = useRef(null);
    const convertFiltersForStream = useCallback((filters) => {
        return {
            level: filters.levels,
            domain: filters.domains,
            serviceName: filters.services,
            userId: filters.users,
            keywords: filters.search.query ? [filters.search.query] : undefined,
            correlationId: filters.advanced.correlationId || undefined
        };
    }, []);
    const handleStreamMessage = useCallback((message) => {
        var _a;
        if (message.type === 'log' && ((_a = message.data) === null || _a === void 0 ? void 0 : _a.logs)) {
            const newLogs = message.data.logs;
            onUpdate((prev) => {
                const updatedLogs = [...newLogs, ...prev.logs].slice(0, maxVisibleLogs);
                return {
                    logs: updatedLogs,
                    filteredLogs: updatedLogs,
                    streamingStats: {
                        ...prev.streamingStats,
                        messagesReceived: prev.streamingStats.messagesReceived + 1,
                        bytesReceived: prev.streamingStats.bytesReceived + JSON.stringify(newLogs).length,
                        lastMessage: new Date()
                    }
                };
            });
            logger.info('logs_viewer.stream_message_processed', {
                messageCount: newLogs.length,
                totalBytes: JSON.stringify(newLogs).length
            });
        }
    }, [maxVisibleLogs, onUpdate]);
    const start = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/logs/stream`);
        ws.onopen = () => {
            logger.info('logs_viewer.stream_connected');
            onUpdate((prev) => ({
                ...prev,
                streaming: true,
                streamingStats: {
                    ...prev.streamingStats,
                    connected: true,
                    connectionTime: new Date()
                }
            }));
            // Subscribe to log stream with current filters
            const subscribeMessage = {
                action: 'subscribe',
                filters: convertFiltersForStream(filters),
                options: {
                    includeContext: true,
                    format: 'json'
                }
            };
            ws.send(JSON.stringify(subscribeMessage));
        };
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleStreamMessage(message);
            }
            catch (error) {
                logger.error('logs_viewer.stream_message_parse_error', {}, error instanceof Error ? error : undefined);
            }
        };
        ws.onclose = (event) => {
            logger.info('logs_viewer.stream_disconnected', {
                code: event.code,
                reason: event.reason
            });
            onUpdate((prev) => ({
                ...prev,
                streaming: false,
                streamingStats: {
                    ...prev.streamingStats,
                    connected: false
                }
            }));
        };
        ws.onerror = (error) => {
            logger.error('logs_viewer.stream_error', {}, error instanceof Error ? error : undefined);
            onUpdate((prev) => ({
                ...prev,
                error: 'WebSocket connection error'
            }));
        };
        wsRef.current = ws;
    }, [filters, convertFiltersForStream, handleStreamMessage, onUpdate]);
    const stop = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        onUpdate((prev) => ({
            ...prev,
            streaming: false,
            streamingStats: {
                ...prev.streamingStats,
                connected: false
            }
        }));
        logger.info('logs_viewer.stream_stopped');
    }, [onUpdate]);
    const updateFilters = useCallback((newFilters) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const updateMessage = {
                action: 'subscribe',
                filters: convertFiltersForStream(newFilters)
            };
            wsRef.current.send(JSON.stringify(updateMessage));
        }
    }, [convertFiltersForStream]);
    const cleanup = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);
    useImperativeHandle(ref, () => ({
        start,
        stop,
        updateFilters,
        cleanup
    }), [start, stop, updateFilters, cleanup]);
    return null; // This component doesn't render anything
});
//# sourceMappingURL=StreamingManager.js.map