import React, { useState } from 'react';
import { BarChart3, Lock, CheckCircle2, Users } from 'lucide-react';
import type { PollData } from '@/api/chat.api';

interface PollMessageProps {
    poll: PollData;
    isMe: boolean;
    tripId: number;
    currentUserId?: number;
    creatorId?: number | null;
    onVote: (pollId: number, optionIds: number[]) => Promise<void>;
    onRemoveVote: (pollId: number) => Promise<void>;
    onClose?: (pollId: number) => Promise<void>;
}

export const PollMessage: React.FC<PollMessageProps> = ({
    poll: initialPoll,
    isMe,
    currentUserId,
    creatorId,
    onVote,
    onRemoveVote,
    onClose,
}) => {
    const [poll, setPoll] = useState<PollData>(initialPoll);
    const [isVoting, setIsVoting] = useState(false);

    // Keep poll in sync with parent updates (real-time WS)
    React.useEffect(() => {
        setPoll(initialPoll);
    }, [initialPoll]);

    const hasVoted = poll.user_vote_option_ids.length > 0;
    const isCreator = currentUserId !== undefined && creatorId === currentUserId;
    const totalVotes = poll.total_votes;

    const getVotePercent = (optionId: number): number => {
        if (totalVotes === 0) return 0;
        const option = poll.options.find(o => o.id === optionId);
        return Math.round(((option?.vote_count ?? 0) / totalVotes) * 100);
    };

    // Instant vote on tap — WhatsApp style
    const handleOptionClick = async (optionId: number) => {
        if (poll.is_closed || isVoting) return;
        setIsVoting(true);
        try {
            const alreadyVoted = poll.user_vote_option_ids.includes(optionId);
            if (poll.allow_multiple) {
                const newSelection = alreadyVoted
                    ? poll.user_vote_option_ids.filter(id => id !== optionId)
                    : [...poll.user_vote_option_ids, optionId];
                if (newSelection.length === 0) {
                    await onRemoveVote(poll.id);
                } else {
                    await onVote(poll.id, newSelection);
                }
            } else {
                if (alreadyVoted) {
                    await onRemoveVote(poll.id);
                } else {
                    await onVote(poll.id, [optionId]);
                }
            }
        } finally {
            setIsVoting(false);
        }
    };

    const handleClose = async () => {
        if (isVoting || !onClose) return;
        setIsVoting(true);
        try {
            await onClose(poll.id);
        } finally {
            setIsVoting(false);
        }
    };

    const showResults = hasVoted || poll.is_closed;

    return (
        <div className={`poll-card ${isMe ? 'poll-card--me' : 'poll-card--other'}`}>
            {/* Header */}
            <div className="poll-card-header">
                <div className="poll-card-header-left">
                    <div className="poll-card-icon">
                        <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="poll-card-tag">
                        {poll.is_closed ? 'Closed Poll' : poll.allow_multiple ? 'Multiple Choice Poll' : 'Poll'}
                    </span>
                </div>
                {poll.is_closed && <Lock className="w-3 h-3 text-gray-400" />}
            </div>

            {/* Question */}
            <p className="poll-card-question">{poll.question}</p>

            {/* Options */}
            <div className="poll-card-options">
                {poll.options.map(option => {
                    const percent = getVotePercent(option.id);
                    const isSelected = poll.user_vote_option_ids.includes(option.id);
                    const isWinner =
                        showResults &&
                        poll.is_closed &&
                        option.vote_count === Math.max(...poll.options.map(o => o.vote_count));

                    return (
                        <button
                            key={option.id}
                            className={`poll-option
                                ${isSelected ? 'poll-option--selected' : ''}
                                ${poll.is_closed ? 'poll-option--closed' : ''}
                                ${isWinner && poll.is_closed ? 'poll-option--winner' : ''}
                            `}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={poll.is_closed || isVoting}
                        >
                            {/* Progress fill */}
                            {showResults && (
                                <div
                                    className="poll-option-fill"
                                    style={{ width: `${percent}%` }}
                                />
                            )}

                            <div className="poll-option-inner">
                                <div className="poll-option-left">
                                    <span className={`poll-option-dot ${isSelected ? 'poll-option-dot--active' : ''}`}>
                                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </span>
                                    <span className="poll-option-text">{option.text}</span>
                                </div>
                                {showResults && (
                                    <div className="poll-option-stats">
                                        <span className="poll-option-count">{option.vote_count}</span>
                                        <span className="poll-option-percent">{percent}%</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="poll-card-footer">
                <div className="poll-card-meta">
                    <Users className="w-3 h-3" />
                    <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
                    {poll.allow_multiple && <span>· Multiple choice</span>}
                </div>

                {isCreator && !poll.is_closed && (
                    <div className="poll-card-actions">
                        <button
                            className="poll-btn poll-btn--close"
                            onClick={handleClose}
                            disabled={isVoting}
                        >
                            End poll
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollMessage;
