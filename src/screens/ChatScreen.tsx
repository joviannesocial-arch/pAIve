import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MessageBubble } from '../components/chat';
import { AvatarStage, FloatingInputBar, ProgressIndicator, BottomNav, QuickReplyChips } from '../components/ui';
import type { ChatMessage, QuickReply, StrategicReport, CoachPersonality } from '../types';
import { initializeChat, sendChatMessage, isGeminiConfigured, setToolCallCallback, type ToolCallResult } from '../utils/geminiService';
import { generateStrategicReport, createInitialConversationState, type ConversationState } from '../utils/careerAI';
import type { ProfileData } from './ProfileScreen';

interface ChatScreenProps {
    userName: string;
    coachAvatarUrl: string;
    userLocation?: string;
    userProfile?: ProfileData;
    personality?: CoachPersonality;  // The AI coaching personality
    typewriterSpeed?: number;  // 0-100: Controls text animation speed
    messages: ChatMessage[];
    onMessagesChange: (messages: ChatMessage[]) => void;
    onNavigate: (screen: 'home' | 'chat' | 'profile') => void;
    onGenerateReport?: (report: StrategicReport) => void;
    onProfileUpdate?: (updates: Partial<ProfileData>) => void;
}

const quickReplies: QuickReply[] = [
    { id: '1', label: 'Career change', value: "I'm considering a career change" },
    { id: '2', label: 'Job search', value: "I need help with my job search strategy" },
    { id: '3', label: 'Skill gaps', value: "I want to identify my skill gaps" },
];

export function ChatScreen({
    userName,
    coachAvatarUrl,
    userLocation = 'Singapore',
    userProfile,
    personality = 'mix',
    typewriterSpeed = 0,
    messages,
    onMessagesChange,
    onNavigate,
    onGenerateReport,
    onProfileUpdate
}: ChatScreenProps) {
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [progress, setProgress] = useState(15);
    const [conversationState, setConversationState] = useState<ConversationState>(
        createInitialConversationState(userName)
    );
    const [isReportReady, setIsReportReady] = useState(false);  // AI signals when ready
    const [chatInitialized, setChatInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messageCount, setMessageCount] = useState(messages.length);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initRef = useRef(false);

    // Handle tool calls from AI (profile updates, report offers)
    const handleToolCall = useCallback((result: ToolCallResult) => {
        console.log('[ChatScreen] Tool call received:', result);

        if (result.toolName === 'updateCareerInterests' && result.success) {
            // Update the user's profile with new career interests
            if (onProfileUpdate && result.data) {
                const updates: Partial<ProfileData> = {
                    interests: {
                        industries: result.data.industries || [],
                        jobTitles: result.data.job_titles || []
                    }
                };
                onProfileUpdate(updates);

                // Show toast notification
                setToast({
                    message: '✨ Career interests updated in your profile!',
                    type: 'success'
                });
                setTimeout(() => setToast(null), 3000);
            }
        } else if (result.toolName === 'offerStrategicReport' && result.success) {
            // AI is ready to generate a report
            setIsReportReady(true);
            setProgress(100);
        }
    }, [onProfileUpdate]);

    // Set up tool callback when component mounts
    useEffect(() => {
        setToolCallCallback(handleToolCall);
        return () => setToolCallCallback(null);  // Cleanup on unmount
    }, [handleToolCall]);

    // Initialize chat with Gemini (only once, skip if messages already exist)
    useEffect(() => {
        // Skip if we already have messages (coming back to chat)
        if (messages.length > 0) {
            setChatInitialized(true);
            return;
        }

        // Skip if already initializing
        if (initRef.current) return;
        initRef.current = true;

        const initChat = async () => {
            if (!isGeminiConfigured()) {
                // Fallback to static greeting if no API key
                const greeting: ChatMessage = {
                    id: '1',
                    content: `Hey ${userName}! 👋 I'm Aura, your AI Career Coach. I'm here to help you navigate your career journey. What's on your mind today?`,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                onMessagesChange([greeting]);
                return;
            }

            setIsAiTyping(true);
            try {
                // Pass user profile for personalized AI context
                const profileContext = userProfile || { countries: [userLocation] };
                const greeting = await initializeChat(userName, profileContext, personality);
                const greetingMessage: ChatMessage = {
                    id: '1',
                    content: greeting,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                onMessagesChange([greetingMessage]);
                setChatInitialized(true);
            } catch (err) {
                setError('Failed to initialize AI chat. Using fallback mode.');
                const fallbackGreeting: ChatMessage = {
                    id: '1',
                    content: `Hey ${userName}! 👋 I'm Aura, your AI Career Coach. I'm here to help you navigate your career journey. What's on your mind today?`,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                onMessagesChange([fallbackGreeting]);
            } finally {
                setIsAiTyping(false);
            }
        };

        initChat();
    }, [userName, userLocation, messages.length, onMessagesChange]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text: string) => {
        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: text,
            sender: 'user',
            timestamp: new Date(),
        };
        const newMessages = [...messages, userMessage];
        onMessagesChange(newMessages);
        setMessageCount(prev => prev + 1);

        // Show typing indicator
        setIsAiTyping(true);
        setError(null);

        // Update conversation state for report generation
        setConversationState(prev => ({
            ...prev,
            messageCount: prev.messageCount + 1,
            collectedData: {
                ...prev.collectedData,
                // Extract career-related info from message if mentioned
                ...(text.toLowerCase().includes('change') && { careerChange: true }),
                ...(text.toLowerCase().includes('skill') && { skillDevelopment: true }),
            }
        }));

        try {
            // Typewriter effect is now handled by MessageBubble component
            // Just a small delay for the typing indicator

            let responseText: string;

            if (isGeminiConfigured() && chatInitialized) {
                // Check if session needs re-initialization (e.g. after HMR)
                const { isChatInitialized, reinitializeChatSession } = await import('../utils/geminiService');
                if (!isChatInitialized()) {
                    console.log('[ChatScreen] Session lost, re-initializing...');
                    const profileContext = userProfile || { countries: [userLocation] };
                    await reinitializeChatSession(userName, profileContext, messages);
                }
                
                // Use real Gemini AI
                responseText = await sendChatMessage(text);
            } else {
                // Fallback response
                responseText = getFallbackResponse(text, messageCount);
            }

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: responseText,
                sender: 'ai',
                timestamp: new Date(),
            };

            onMessagesChange([...messages, userMessage, aiMessage]);
            setProgress(prev => Math.min(prev + 8, 88));

            // Note: Report readiness is now triggered by AI via offerStrategicReport tool call
            // No automatic completion based on message count (fixes Section B3)
        } catch (err) {
            setError('Failed to get AI response. Please try again.');
            console.error('Chat error:', err);
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleQuickReply = (reply: QuickReply) => {
        handleSend(reply.value);
    };

    const handleGenerateReport = () => {
        const report = generateStrategicReport(conversationState, userLocation);
        if (onGenerateReport) {
            onGenerateReport(report);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-transparent flex flex-col"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 glass-card border-none rounded-none border-b border-white/5">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="w-10" />
                    <h1 className="text-xl font-bold text-white">pAlve</h1>
                    <ProgressIndicator progress={progress} className="scale-75" />
                </div>

                {/* Coach avatar */}
                <div className="flex justify-center pb-3">
                    <AvatarStage
                        avatarUrl={coachAvatarUrl}
                        size="md"
                        isThinking={isAiTyping}
                    />
                </div>

                {/* Date */}
                <p className="text-center text-sm text-slate-400 pb-3">
                    {formatDate(new Date())}
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Toast notification for profile updates */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                        style={{
                            backgroundColor: toast.type === 'error' ? '#ef4444' :
                                toast.type === 'success' ? '#10b981' : '#3b82f6',
                            color: 'white'
                        }}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-48 hide-scrollbar">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            avatarUrl={message.sender === 'ai' ? coachAvatarUrl : undefined}
                            enableTTS={message.sender === 'ai'}
                            typewriterSpeed={typewriterSpeed}
                            isLastMessage={index === messages.length - 1}
                            onMarkAnimated={(messageId) => {
                                // Update messages to mark as animated
                                onMessagesChange(
                                    messages.map(m =>
                                        m.id === messageId ? { ...m, isAnimated: true } : m
                                    )
                                );
                            }}
                        />
                    ))}

                    {/* Typing indicator */}
                    {isAiTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-2 items-center"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                <img
                                    src={coachAvatarUrl}
                                    alt="AI Coach"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="px-4 py-3 bg-white/10 rounded-2xl rounded-bl-md backdrop-blur-sm border border-white/5">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.span
                                            key={i}
                                            className="w-2 h-2 bg-white/50 rounded-full"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: Infinity,
                                                delay: i * 0.15
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Generate Report Button */}
                    {isReportReady && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center pt-4"
                        >
                            <button
                                onClick={handleGenerateReport}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                <FileText className="w-5 h-5" />
                                Generate Strategy Report
                            </button>
                        </motion.div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Quick replies - positioned above input */}
            {!isAiTyping && messages.length > 0 && messages.length < 3 && !isReportReady && (
                <div className="fixed bottom-36 left-0 right-0 px-4 z-20">
                    <QuickReplyChips
                        options={quickReplies}
                        onSelect={handleQuickReply}
                    />
                </div>
            )}

            {/* Input bar - positioned above bottom nav - ALWAYS active (Section B3 fix) */}
            <FloatingInputBar
                onSend={handleSend}
                placeholder="Message..."
                disabled={isAiTyping}
                className="bottom-16"
                onSpeechError={(errorMsg) => {
                    setToast({
                        message: `🎤 ${errorMsg}`,
                        type: 'error'
                    });
                    setTimeout(() => setToast(null), 4000);
                }}
            />

            {/* Bottom Navigation */}
            <BottomNav
                activeItem="chat"
                onNavigate={onNavigate}
            />
        </motion.div>
    );
}

// Fallback responses when Gemini is not configured
function getFallbackResponse(message: string, count: number): string {
    const lowerMessage = message.toLowerCase();

    if (count === 0) {
        return "That's great to hear! Tell me more about your current situation. What field are you working in, or what are you studying?";
    }

    if (lowerMessage.includes('career change') || lowerMessage.includes('switch')) {
        return "Career transitions can be exciting! What draws you to making a change? And what industries or roles have caught your interest?";
    }

    if (lowerMessage.includes('job') || lowerMessage.includes('search')) {
        return "Job searching requires strategy. Are you looking in a specific industry? And what's your timeline for finding a new position?";
    }

    if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
        return "Continuous learning is key to career growth! What skills do you think would be most valuable for your goals? Have you considered any certifications?";
    }

    if (count >= 4) {
        return "I've gathered a lot of valuable insights from our conversation! I think I have enough information to create a personalized strategy report for you. Click the button below whenever you're ready!";
    }

    return "That's really interesting! Can you tell me more about what motivates you in your career? What does success look like to you?";
}
