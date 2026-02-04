import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechToTextOptions {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    continuous?: boolean;
    language?: string;
}

interface UseSpeechToTextReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    isSupported: boolean;
    error: string | null;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognitionInstance;
}

/**
 * Custom hook for Web Speech API (Speech-to-Text)
 * Uses browser native SpeechRecognition API
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
    const {
        onResult,
        onError,
        continuous = false,
        language = 'en-US'
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    // Check if SpeechRecognition is supported
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Initialize recognition on mount
    useEffect(() => {
        if (!isSupported) {
            return;
        }

        // Get the SpeechRecognition constructor (with webkit fallback)
        const SpeechRecognitionAPI = (window as WindowWithSpeechRecognition).SpeechRecognition ||
            (window as WindowWithSpeechRecognition).webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            return;
        }

        recognitionRef.current = new SpeechRecognitionAPI();

        const recognition = recognitionRef.current;
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
            console.log('[SpeechToText] Started listening');
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            console.log('[SpeechToText] Stopped listening');
            setIsListening(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Show interim results while speaking
            const currentTranscript = finalTranscript || interimTranscript;
            setTranscript(currentTranscript);

            // Call onResult with final transcript
            if (finalTranscript && onResult) {
                onResult(finalTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[SpeechToText] Error:', event.error);
            let errorMessage = 'Speech recognition error';

            switch (event.error) {
                case 'not-allowed':
                case 'audio-capture':
                    errorMessage = 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage = 'Network error occurred during speech recognition.';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'aborted':
                    errorMessage = 'Speech recognition was aborted.';
                    break;
                default:
                    errorMessage = `Speech recognition error: ${event.error}`;
            }

            setError(errorMessage);
            setIsListening(false);

            if (onError) {
                onError(errorMessage);
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSupported, continuous, language, onResult, onError]);

    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) {
            setError('Speech recognition is not supported in this browser.');
            if (onError) {
                onError('Speech recognition is not supported in this browser.');
            }
            return;
        }

        setTranscript('');
        setError(null);

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('[SpeechToText] Start error:', err);
            setError('Failed to start speech recognition.');
        }
    }, [isSupported, onError]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        toggleListening,
        isSupported,
        error
    };
}

// TypeScript declarations for Web Speech API
interface WindowWithSpeechRecognition extends Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
}
