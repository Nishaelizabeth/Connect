import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Zap, 
    Send, 
    Map, 
    Users, 
    ListOrdered, 
    Compass,
    Loader2,
    Sparkles,
    ChevronDown
} from 'lucide-react';
import { 
    sendAssistantMessage, 
    type ChatResponse,
    type BuddyCard
} from '@/api/assistant.api';
import AssistantBuddyCard from './AssistantBuddyCard';

interface TravelAssistantDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Quick action buttons configuration
const QUICK_ACTIONS = [
    { 
        id: 'plan', 
        label: 'Plan my trip', 
        icon: Map, 
        message: 'Help me plan a new trip. What information do you need to get started?',
        color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    { 
        id: 'buddies', 
        label: 'Suggest buddies', 
        icon: Users, 
        message: 'Based on my preferences, can you suggest some compatible travel buddies for me?',
        color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    { 
        id: 'itinerary', 
        label: 'Optimize itinerary', 
        icon: ListOrdered, 
        message: 'Help me optimize my current trip itinerary to make the best use of my time.',
        color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
    },
    { 
        id: 'destinations', 
        label: 'Recommend destinations', 
        icon: Compass, 
        message: 'Based on my travel preferences and interests, what destinations would you recommend for my next trip?',
        color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    },
];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    buddy_cards?: BuddyCard[];
    has_more_buddies?: boolean;
}

const TravelAssistantDrawer: React.FC<TravelAssistantDrawerProps> = ({ 
    isOpen, 
    onClose 
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input when drawer opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Send message handler
    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response: ChatResponse = await sendAssistantMessage(
                messageText.trim(),
                conversationId || undefined
            );

            // Update conversation ID for subsequent messages
            if (!conversationId) {
                setConversationId(response.conversation_id);
            }

            const assistantMessage: Message = {
                id: `assistant-${response.message_id}`,
                role: 'assistant',
                content: response.reply,
                timestamp: new Date(),
                buddy_cards: response.buddy_cards,
                has_more_buddies: response.has_more_buddies,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Show error message
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    // Handle quick action click
    const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
        handleSendMessage(action.message);
    };

    // Start new conversation
    const handleNewConversation = () => {
        setMessages([]);
        setConversationId(null);
    };

    // Format message content with basic markdown-like styling
    const formatContent = (content: string) => {
        return content.split('\n').map((line, index) => {
            // Bold text
            let formattedLine: React.ReactNode = line;
            
            // Handle bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                    <div key={index} className="flex gap-2 ml-2">
                        <span className="text-blue-500">•</span>
                        <span>{line.replace(/^[\s•-]+/, '')}</span>
                    </div>
                );
            }
            
            // Handle bold markers
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                formattedLine = parts.map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                );
            }
            
            return <p key={index} className={line.trim() === '' ? 'h-2' : ''}>{formattedLine}</p>;
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-blue-600 to-purple-600">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white fill-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white">Travel Buddy AI</h2>
                                    <p className="text-xs text-white/80">Your intelligent travel assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {messages.length > 0 && (
                                    <button
                                        onClick={handleNewConversation}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                                        title="New conversation"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            {messages.length === 0 ? (
                                /* Empty State - Quick Actions */
                                <div className="p-4 space-y-6">
                                    {/* Welcome Section */}
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                                            <Zap className="w-8 h-8 text-white fill-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            How can I help you today?
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Ask me anything about travel planning, destinations, or buddies
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Quick Actions
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {QUICK_ACTIONS.map((action) => (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleQuickAction(action)}
                                                    disabled={isLoading}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 transition-all ${action.color} disabled:opacity-50`}
                                                >
                                                    <action.icon className="w-5 h-5" />
                                                    <span className="text-xs font-medium text-center">
                                                        {action.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Or try asking...
                                        </h4>
                                        <div className="space-y-2">
                                            {[
                                                "What's the best time to visit Goa?",
                                                "Help me pack for a beach vacation",
                                                "Suggest budget-friendly destinations"
                                            ].map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSendMessage(suggestion)}
                                                    disabled={isLoading}
                                                    className="w-full text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    "{suggestion}"
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Chat Messages */
                                <div className="p-4 space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id}>
                                            <div
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                                        message.role === 'user'
                                                            ? 'bg-blue-600 text-white rounded-br-md'
                                                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                                                    }`}
                                                >
                                                    {message.role === 'assistant' ? (
                                                        <div className="space-y-1 text-sm">
                                                            {formatContent(message.content)}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm">{message.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Buddy Cards */}
                                            {message.buddy_cards && message.buddy_cards.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {message.buddy_cards.map((buddy) => (
                                                        <AssistantBuddyCard 
                                                            key={buddy.id} 
                                                            buddy={buddy}
                                                        />
                                                    ))}
                                                    
                                                    {/* Show More Button */}
                                                    {message.has_more_buddies && (
                                                        <button
                                                            onClick={() => handleSendMessage('Show more buddies')}
                                                            disabled={isLoading}
                                                            className="w-full py-2 mt-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                            Show More Buddies
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Typing Indicator */}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything about travel..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-400 text-center mt-2">
                                Powered by AI • Responses may not always be accurate
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TravelAssistantDrawer;
