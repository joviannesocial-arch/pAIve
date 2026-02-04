import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Smile, ImageIcon, Send, X } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useSpeechToText } from '../../hooks/useSpeechToText';

interface FloatingInputBarProps {
    onSend: (message: string, imageFile?: File) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    onSpeechError?: (error: string) => void;
}

export function FloatingInputBar({
    onSend,
    placeholder = 'Message...',
    disabled = false,
    className = '',
    onSpeechError
}: FloatingInputBarProps) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Speech-to-text integration
    const {
        isListening,
        transcript,
        toggleListening,
        isSupported,
        error: speechError
    } = useSpeechToText({
        onResult: (text) => {
            // Append transcript to current message
            setMessage(prev => prev + (prev ? ' ' : '') + text);
        },
        onError: (error) => {
            if (onSpeechError) {
                onSpeechError(error);
            }
        }
    });

    // Show interim transcript while speaking
    useEffect(() => {
        if (isListening && transcript) {
            // Show live preview of what's being transcribed
            // (transcript updates as user speaks)
        }
    }, [transcript, isListening]);

    // Handle speech error
    useEffect(() => {
        if (speechError && onSpeechError) {
            onSpeechError(speechError);
        }
    }, [speechError, onSpeechError]);

    const handleSend = () => {
        if ((message.trim() || selectedImage) && !disabled) {
            onSend(message.trim(), selectedImage || undefined);
            setMessage('');
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiSelect = (emoji: { native: string }) => {
        setMessage(prev => prev + emoji.native);
        setShowEmojiPicker(false);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleMicClick = () => {
        if (!isSupported) {
            if (onSpeechError) {
                onSpeechError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
            }
            return;
        }
        toggleListening();
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed bottom-0 left-0 right-0 p-4 ${className}`}
        >
            <div className="max-w-lg mx-auto">
                {/* Image preview */}
                <AnimatePresence>
                    {imagePreview && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-2 relative inline-block"
                        >
                            <img
                                src={imagePreview}
                                alt="Selected"
                                className="h-20 rounded-lg object-cover"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Emoji picker */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-20 left-4 right-4 z-50"
                        >
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                <Picker
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                    theme="light"
                                    previewPosition="none"
                                    skinTonePosition="none"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Live transcript indicator */}
                <AnimatePresence>
                    {isListening && transcript && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                        >
                            <span className="animate-pulse mr-2">🎙️</span>
                            {transcript || 'Listening...'}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? 'Listening...' : placeholder}
                        disabled={disabled}
                        className="flex-1 bg-transparent text-white placeholder-white/40 
                       focus:outline-none text-base"
                    />

                    <div className="flex items-center gap-1">
                        {/* Microphone button with active state */}
                        <button
                            type="button"
                            onClick={handleMicClick}
                            disabled={disabled}
                            className={`p-2 transition-all rounded-full ${isListening
                                ? 'text-white bg-red-500 hover:bg-red-600 animate-pulse'
                                : 'text-white/40 hover:text-white hover:bg-white/10'
                                }`}
                            aria-label={isListening ? 'Stop listening' : 'Voice input'}
                            title={isListening ? 'Click to stop' : 'Click to speak'}
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2 transition-colors rounded-full hover:bg-white/10 ${showEmojiPicker ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                                }`}
                            aria-label="Add emoji"
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10"
                            aria-label="Add image"
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        {(message.trim() || selectedImage) && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                type="button"
                                onClick={handleSend}
                                disabled={disabled}
                                className="p-2 text-white bg-cyan-600 hover:bg-cyan-500 
                           transition-colors rounded-full disabled:opacity-50"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
