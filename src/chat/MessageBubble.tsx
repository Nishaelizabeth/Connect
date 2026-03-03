import React from 'react';
import type { ChatMessage, PollData } from '@/api/chat.api';
import { PollMessage } from './PollMessage';

interface MessageBubbleProps {
    message: ChatMessage;
    tripId: number;
    currentUserId?: number;
    onVote: (pollId: number, optionIds: number[]) => Promise<void>;
    onRemoveVote: (pollId: number) => Promise<void>;
    onClosePoll?: (pollId: number) => Promise<void>;
}

/**
 * Individual chat message bubble component.
 * Renders differently for own messages, other users, system messages, and polls.
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    tripId,
    currentUserId,
    onVote,
    onRemoveVote,
    onClosePoll,
}) => {
    // System messages (join/leave notifications)
    if (message.is_system) {
        return (
            <div className="flex justify-center my-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    const isMe = message.is_me;

    // Format timestamp
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Get initials for avatar
    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Poll messages
    if (message.message_type === 'poll' && message.poll) {
        return (
            <div className={`flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isMe && (
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                                {getInitials(message.sender_name)}
                            </span>
                        </div>
                    </div>
                )}
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">
                            {message.sender_name || 'Unknown'}
                        </p>
                    )}
                    <PollMessage
                        poll={message.poll}
                        isMe={isMe}
                        tripId={tripId}
                        currentUserId={currentUserId}
                        creatorId={message.sender_id}
                        onVote={onVote}
                        onRemoveVote={onRemoveVote}
                        onClose={onClosePoll}
                    />
                    <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(message.created_at)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {!isMe && (
                <div className="flex-shrink-0">
                    {message.sender_avatar ? (
                        <img
                            src={message.sender_avatar}
                            alt={message.sender_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                                {getInitials(message.sender_name)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Message content */}
            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender name (only for others) */}
                {!isMe && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">
                        {message.sender_name || 'Unknown'}
                    </p>
                )}

                {/* Message bubble */}
                <div
                    className={`px-4 py-2 rounded-2xl ${
                        isMe
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                {/* Timestamp */}
                <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {formatTime(message.created_at)}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
