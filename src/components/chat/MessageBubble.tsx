import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface MessageBubbleProps {
    message: ChatMessageType;
    avatarUrl?: string;
    isLastMessage?: boolean;  // True if this is the last message in the list
    onTypewriterComplete?: () => void;
    onMarkAnimated?: (messageId: string) => void;  // Callback to mark message as animated
    enableTTS?: boolean;
    typewriterSpeed?: number;  // 0-100 where 0 = very fast (instant-ish), 100 = slow typing
}

export function MessageBubble({
    message,
    avatarUrl,
    isLastMessage = false,
    onTypewriterComplete,
    onMarkAnimated,
    enableTTS = true,
    typewriterSpeed = 0  // Default to fast (near-instant)
}: MessageBubbleProps) {
    const isUser = message.sender === 'user';
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const animationStartedRef = useRef(false);

    // Calculate character delay from speed (0-100)
    // Speed 0 = very fast (5ms), Speed 100 = slow (80ms per char)
    const charDelay = Math.max(5, Math.round(5 + (typewriterSpeed / 100) * 75));

    // Determine if we should skip animation
    const shouldSkipAnimation =
        isUser ||                           // User messages never animate
        message.isAnimated ||               // Already animated (stored)
        !isLastMessage ||                   // Not the last message
        typewriterSpeed === 0;              // Speed is instant

    // Typewriter effect for AI messages
    useEffect(() => {
        // Skip animation for stored/previous messages
        if (shouldSkipAnimation || !message.content) {
            setDisplayedText(message.content);
            setIsTyping(false);
            return;
        }

        // Prevent re-triggering animation
        if (animationStartedRef.current) {
            return;
        }

        // Start typing animation for new messages only
        animationStartedRef.current = true;
        setIsTyping(true);
        setDisplayedText('');
        let currentIndex = 0;

        typewriterIntervalRef.current = setInterval(() => {
            if (currentIndex < message.content.length) {
                setDisplayedText(message.content.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                // Typing complete
                if (typewriterIntervalRef.current) {
                    clearInterval(typewriterIntervalRef.current);
                }
                setIsTyping(false);

                // Mark this message as animated so it won't re-animate
                if (onMarkAnimated) {
                    onMarkAnimated(message.id);
                }

                if (onTypewriterComplete) {
                    onTypewriterComplete();
                }
            }
        }, charDelay);

        return () => {
            if (typewriterIntervalRef.current) {
                clearInterval(typewriterIntervalRef.current);
            }
        };
    }, [message.content, message.id, shouldSkipAnimation, charDelay, onTypewriterComplete, onMarkAnimated]);

    // Reset animation ref when message ID changes (new message)
    useEffect(() => {
        animationStartedRef.current = false;
    }, [message.id]);

    const handleSpeak = () => {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();

        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }

        // Chrome requires getVoices() to be called first (quirk)
        const voices = window.speechSynthesis.getVoices();

        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Use a voice if available
        if (voices.length > 0) {
            // Try to find an English voice
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }

        utterance.onstart = () => {
            console.log('[TTS] Started speaking');
            setIsSpeaking(true);
        };
        utterance.onend = () => {
            console.log('[TTS] Finished speaking');
            setIsSpeaking(false);
        };
        utterance.onerror = (event) => {
            console.error('[TTS] Error:', event.error);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar for AI messages */}
            {!isUser && avatarUrl && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden self-end">
                    <img
                        src={avatarUrl}
                        alt="AI Coach"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Message bubble with inline TTS button */}
            <div className={`max-w-[75%] flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                    className={`px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/5 ${isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-cyan-500/10'
                        : 'bg-white/10 text-white rounded-bl-md shadow-lg'
                        }`}
                >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {displayedText}
                        {/* Thin blinking cursor while typing - subtle pulse */}
                        {isTyping && !isUser && (
                            <span
                                className="inline-block w-[2px] h-[1em] bg-cyan-400 ml-0.5 align-middle shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                style={{
                                    animation: 'cursorPulse 1s ease-in-out infinite'
                                }}
                            />
                        )}
                    </p>
                </div>

                {/* TTS button for AI messages - always visible */}
                {!isUser && enableTTS && !isTyping && (
                    <button
                        onClick={handleSpeak}
                        className={`flex-shrink-0 p-2 rounded-full transition-colors ${isSpeaking
                            ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-400/50'
                            : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80'
                            }`}
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                    >
                        {isSpeaking ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* CSS for cursor animation */}
            <style>{`
                @keyframes cursorPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </motion.div>
    );
}
