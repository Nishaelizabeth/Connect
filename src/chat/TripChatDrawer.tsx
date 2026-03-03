import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, MessageSquare, Wifi, WifiOff, BarChart3 } from 'lucide-react';
import {
    getChatMessages,
    createPoll,
    votePoll,
    removeVotePoll,
    closePoll,
    type ChatMessage,
    type PollData,
} from '@/api/chat.api';
import { useTripChat } from '@/hooks/useTripChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { CreatePollModal } from './CreatePollModal';
// PollMessage is rendered via MessageBubble
import { getUser } from '@/utils/storage';

interface TripMember {
    id: number;
    full_name: string;
    status: string;
}

interface TripChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: number;
    tripTitle: string;
    members: TripMember[];
    currentUserStatus: 'accepted' | 'invited' | 'rejected' | null;
}

/**
 * Slide-out drawer for trip chat.
 * Connects to WebSocket for real-time messaging.
 */
export const TripChatDrawer: React.FC<TripChatDrawerProps> = ({
    isOpen,
    onClose,
    tripId,
    tripTitle,
    members,
    currentUserStatus,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const isAccepted = currentUserStatus === 'accepted';
    const currentUser = getUser();
    const currentUserId: number | undefined = currentUser?.id;

    // Derived poll stats — recalculated whenever messages change
    const pollStats = useMemo(() => {
        const pollMessages = messages.filter(m => m.message_type === 'poll' && m.poll);
        const total = pollMessages.length;
        const active = pollMessages.filter(m => !m.poll?.is_closed).length;
        const needsVote = pollMessages.filter(
            m => !m.poll?.is_closed && (m.poll?.user_vote_option_ids.length ?? 0) === 0
        ).length;
        return { total, active, needsVote, pollMessages };
    }, [messages]);

    // Handle new incoming message
    const handleNewMessage = useCallback((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    // Handle poll update from WebSocket - update the matching message's poll data
    const handlePollUpdate = useCallback((poll: PollData & { message_id: number }) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.poll?.id === poll.id || msg.id === poll.message_id
                    ? { ...msg, poll }
                    : msg
            )
        );
    }, []);

    // Handle typing indicator
    const handleTyping = useCallback((userId: number, userName: string, isTyping: boolean) => {
        setTypingUsers((prev) => {
            const newMap = new Map(prev);
            if (isTyping) {
                newMap.set(userId, userName);
            } else {
                newMap.delete(userId);
            }
            return newMap;
        });
    }, []);

    // Handle WebSocket errors
    const handleError = useCallback((errorMessage: string) => {
        console.error('Chat error:', errorMessage);
        setError(errorMessage);
    }, []);

    // WebSocket connection - only enable when drawer is open and user is accepted
    const {
        isConnected,
        isConnecting,
        sendMessage,
        sendTyping,
    } = useTripChat({
        tripId,
        enabled: isOpen && isAccepted,
        onMessage: handleNewMessage,
        onPollUpdate: handlePollUpdate,
        onTyping: handleTyping,
        onError: handleError,
        onConnected: () => setError(null),
    });

    // Poll vote handler
    const handleVote = useCallback(async (pollId: number, optionIds: number[]) => {
        await votePoll(tripId, pollId, optionIds);
        // WS poll_update will refresh the UI
    }, [tripId]);

    // Poll remove vote handler
    const handleRemoveVote = useCallback(async (pollId: number) => {
        await removeVotePoll(tripId, pollId);
    }, [tripId]);

    // Poll close handler
    const handleClosePoll = useCallback(async (pollId: number) => {
        await closePoll(tripId, pollId);
    }, [tripId]);

    // Poll creation handler
    const handleCreatePoll = useCallback(async (data: {
        question: string;
        options: string[];
        allow_multiple: boolean;
    }) => {
        await createPoll(tripId, data);
        // WS chat_message will deliver the new poll message
    }, [tripId]);

    // Load initial messages
    useEffect(() => {
        if (!isOpen || !isAccepted) return;

        const loadMessages = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getChatMessages(tripId);
                setMessages(data.messages);
            } catch (err: any) {
                console.error('Failed to load messages:', err);
                setError(err.response?.data?.detail || 'Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [isOpen, tripId, isAccepted]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle send message
    const handleSendMessage = (content: string) => {
        const success = sendMessage(content);
        if (!success) {
            setError('Failed to send message - reconnecting...');
        }
    };

    // Get accepted members for header
    const acceptedMembers = members.filter((m) => m.status === 'accepted');

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-gray-900 line-clamp-1">{tripTitle}</h2>
                                {/* Live poll count badge */}
                                {pollStats.total > 0 && (
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                                            <BarChart3 className="w-2.5 h-2.5 text-blue-500" />
                                            <span className="text-[10px] font-semibold text-blue-600">
                                                {pollStats.active} poll{pollStats.active !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {pollStats.needsVote > 0 && (
                                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[10px] font-semibold text-amber-600">
                                                    {pollStats.needsVote} need{pollStats.needsVote === 1 ? 's' : ''} vote
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    {acceptedMembers.length} member{acceptedMembers.length !== 1 ? 's' : ''}
                                </span>
                                {isConnected ? (
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                        <Wifi className="w-3 h-3" />
                                        Live
                                    </span>
                                ) : isConnecting ? (
                                    <span className="text-xs text-yellow-600">Connecting...</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-red-500">
                                        <WifiOff className="w-3 h-3" />
                                        Disconnected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Member Avatars */}
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-1">
                        {acceptedMembers.slice(0, 5).map((member) => (
                            <div
                                key={member.id}
                                className="w-8 h-8 -ml-1 first:ml-0 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center border-2 border-white"
                                title={member.full_name}
                            >
                                <span className="text-white text-[10px] font-semibold">
                                    {getInitials(member.full_name)}
                                </span>
                            </div>
                        ))}
                        {acceptedMembers.length > 5 && (
                            <div className="w-8 h-8 -ml-1 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                                <span className="text-gray-600 text-[10px] font-semibold">
                                    +{acceptedMembers.length - 5}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 bg-gray-50"
                >
                    {!isAccepted ? (
                        // Not accepted member
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-2">
                                {currentUserStatus === 'invited'
                                    ? 'Waiting for Acceptance'
                                    : 'Access Denied'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {currentUserStatus === 'invited'
                                    ? 'You need to accept the trip invitation to join the chat.'
                                    : 'You must be an accepted member to view this chat.'}
                            </p>
                        </div>
                    ) : loading ? (
                        // Loading state
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Loading messages...</div>
                        </div>
                    ) : error ? (
                        // Error state
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <p className="text-red-500 mb-2">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Dismiss
                            </button>
                        </div>
                    ) : messages.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-2">No messages yet</h3>
                            <p className="text-sm text-gray-500">
                                Start the conversation with your trip buddies!
                            </p>
                        </div>
                    ) : (
                        // Messages list
                        <>
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    tripId={tripId}
                                    currentUserId={currentUserId}
                                    onVote={handleVote}
                                    onRemoveVote={handleRemoveVote}
                                    onClosePoll={handleClosePoll}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}

                    {/* Typing indicator */}
                    {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                <span
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                />
                                <span
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                />
                            </div>
                            {Array.from(typingUsers.values()).join(', ')} typing...
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {isAccepted ? (
                    <ChatInput
                        onSend={handleSendMessage}
                        onTyping={sendTyping}
                        onCreatePoll={() => setShowCreatePoll(true)}
                        disabled={!isConnected}
                        placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                    />
                ) : (
                    <div className="p-4 border-t border-gray-200 bg-gray-100">
                        <p className="text-sm text-gray-500 text-center">
                            {currentUserStatus === 'invited'
                                ? 'Accept the invitation to start chatting'
                                : 'Chat unavailable'}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Poll Modal */}
            <CreatePollModal
                isOpen={showCreatePoll}
                onClose={() => setShowCreatePoll(false)}
                onSubmit={handleCreatePoll}
            />
        </>
    );
};

export default TripChatDrawer;
