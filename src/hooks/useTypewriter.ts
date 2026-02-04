import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
    text: string;
    speed?: number;
    delay?: number;
    onComplete?: () => void;
}

export function useTypewriter({
    text,
    speed = 30,
    delay = 0,
    onComplete
}: UseTypewriterOptions) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    const reset = useCallback(() => {
        setDisplayedText('');
        setIsComplete(false);
        setIsStarted(false);
    }, []);

    useEffect(() => {
        reset();

        const startTimeout = setTimeout(() => {
            setIsStarted(true);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [text, delay, reset]);

    useEffect(() => {
        if (!isStarted || isComplete) return;

        if (displayedText.length < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            setIsComplete(true);
            onComplete?.();
        }
    }, [displayedText, text, speed, isStarted, isComplete, onComplete]);

    return { displayedText, isComplete, reset };
}
