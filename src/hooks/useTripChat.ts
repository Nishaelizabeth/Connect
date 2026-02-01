import { useState, useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '@/utils/storage';
import type { ChatMessage } from '@/api/chat.api';

interface WebSocketMessage {
    type: string;
    message?: ChatMessage;
    user_id?: number;
    user_name?: string;
    is_typing?: boolean;
    error?: string;
}

interface UseTripChatOptions {
    tripId: number;
    enabled?: boolean;
    onMessage?: (message: ChatMessage) => void;
    onTyping?: (userId: number, userName: string, isTyping: boolean) => void;
    onError?: (error: string) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
}

export function useTripChat({
    tripId,
    enabled = true,
    onMessage,
    onTyping,
    onError,
    onConnected,
    onDisconnected,
}: UseTripChatOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldReconnectRef = useRef(true);

    // Store callbacks in refs to avoid dependency issues
    const onMessageRef = useRef(onMessage);
    const onTypingRef = useRef(onTyping);
    const onErrorRef = useRef(onError);
    const onConnectedRef = useRef(onConnected);
    const onDisconnectedRef = useRef(onDisconnected);

    // Update refs when callbacks change
    useEffect(() => {
        onMessageRef.current = onMessage;
        onTypingRef.current = onTyping;
        onErrorRef.current = onError;
        onConnectedRef.current = onConnected;
        onDisconnectedRef.current = onDisconnected;
    }, [onMessage, onTyping, onError, onConnected, onDisconnected]);

    // Main connection effect
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const token = getAccessToken();
        if (!token) {
            onErrorRef.current?.('Not authenticated');
            return;
        }

        // Prevent duplicate connections
        if (wsRef.current?.readyState === WebSocket.OPEN || 
            wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        shouldReconnectRef.current = true;
        setIsConnecting(true);

        // Connect to WebSocket with JWT token in query string
        const wsUrl = `ws://localhost:8000/ws/trips/${tripId}/chat/?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setIsConnecting(false);
            onConnectedRef.current?.();
        };

        ws.onmessage = (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);

                switch (data.type) {
                    case 'chat_message':
                        if (data.message) {
                            onMessageRef.current?.(data.message);
                        }
                        break;
                    case 'user_typing':
                        if (data.user_id && data.user_name !== undefined) {
                            onTypingRef.current?.(data.user_id, data.user_name, data.is_typing ?? false);
                        }
                        break;
                    case 'error':
                        onErrorRef.current?.(String(data.message) || 'Unknown error');
                        break;
                    case 'connection_established':
                        console.log('Connection established:', data);
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            setIsConnected(false);
            setIsConnecting(false);
            wsRef.current = null;
            onDisconnectedRef.current?.();

            // Handle specific close codes - don't reconnect
            if (event.code === 4001) {
                onErrorRef.current?.('Unauthorized - please login again');
                shouldReconnectRef.current = false;
            }
            if (event.code === 4003) {
                onErrorRef.current?.('Access denied - you must be an accepted trip member');
                shouldReconnectRef.current = false;
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Cleanup function
        return () => {
            shouldReconnectRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            setIsConnected(false);
            setIsConnecting(false);
        };
    }, [tripId, enabled]); // Only depend on tripId and enabled

    const sendMessage = useCallback((content: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            onErrorRef.current?.('Not connected');
            return false;
        }

        wsRef.current.send(JSON.stringify({
            type: 'chat_message',
            content: content,
        }));
        return true;
    }, []);

    const sendTyping = useCallback((isTyping: boolean) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        wsRef.current.send(JSON.stringify({
            type: 'typing',
            is_typing: isTyping,
        }));
    }, []);

    return {
        isConnected,
        isConnecting,
        sendMessage,
        sendTyping,
    };
}
