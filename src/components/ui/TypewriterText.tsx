import { motion } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    onComplete?: () => void;
    className?: string;
}

export function TypewriterText({
    text,
    speed = 30,
    delay = 0,
    onComplete,
    className = ''
}: TypewriterTextProps) {
    const { displayedText, isComplete } = useTypewriter({
        text,
        speed,
        delay,
        onComplete
    });

    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
        >
            {displayedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle"
                />
            )}
        </motion.span>
    );
}
