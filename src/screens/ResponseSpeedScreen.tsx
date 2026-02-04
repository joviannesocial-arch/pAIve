import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock } from 'lucide-react';

interface ResponseSpeedScreenProps {
    coachName: string;
    coachAvatarUrl: string;
    userName: string;
    onComplete: (speed: number) => void;
}

// Get descriptive label for speed value
function getSpeedLabel(speed: number): string {
    if (speed <= 20) return 'Very Fast';
    if (speed <= 40) return 'Fast';
    if (speed <= 60) return 'Normal';
    if (speed <= 80) return 'Thoughtful';
    return 'Very Thoughtful';
}

export function ResponseSpeedScreen({
    coachName,
    coachAvatarUrl,
    userName,
    onComplete
}: ResponseSpeedScreenProps) {
    const [speed, setSpeed] = useState(50); // Default 50 (middle)
    const [typingText, setTypingText] = useState('');
    const previewMessage = `Hi ${userName || 'Jane'}...`;

    // Simulated typing effect based on speed (0-100 maps to delay)
    useEffect(() => {
        setTypingText('');
        let index = 0;
        // Map 0-100 to typing delay: 50ms (fast) to 300ms (slow)
        const baseDelay = 50 + (speed / 100) * 250;

        const timer = setInterval(() => {
            if (index < previewMessage.length) {
                setTypingText(previewMessage.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, baseDelay);

        return () => clearInterval(timer);
    }, [speed, previewMessage]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white flex flex-col px-6 py-12"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
            >
                <h1 className="text-3xl font-bold text-slate-900 mb-6">
                    And finally...
                </h1>

                {/* Coach avatar */}
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden shadow-xl mb-6">
                    <img
                        src={coachAvatarUrl}
                        alt={coachName}
                        className="w-full h-full object-cover"
                    />
                </div>

                <p className="text-slate-600 leading-relaxed">
                    How fast would you like<br />
                    your responses?
                </p>
            </motion.div>

            {/* Speed slider section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
            >
                {/* Slider with icons */}
                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={speed}
                            onChange={(e) => setSpeed(parseInt(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer
                                bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:w-6
                                [&::-webkit-slider-thumb]:h-6
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:bg-white
                                [&::-webkit-slider-thumb]:shadow-lg
                                [&::-webkit-slider-thumb]:shadow-purple-500/50
                                [&::-webkit-slider-thumb]:border-2
                                [&::-webkit-slider-thumb]:border-purple-500
                                [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-webkit-slider-thumb]:transition-transform
                                [&::-webkit-slider-thumb]:hover:scale-110
                                [&::-moz-range-thumb]:w-6
                                [&::-moz-range-thumb]:h-6
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:bg-white
                                [&::-moz-range-thumb]:shadow-lg
                                [&::-moz-range-thumb]:border-2
                                [&::-moz-range-thumb]:border-purple-500
                                [&::-moz-range-thumb]:cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-between mt-4 text-sm">
                        <span className="text-slate-500 flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            Faster
                        </span>
                        <span className="font-semibold text-purple-600">
                            {getSpeedLabel(speed)}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                            Slower
                            <Clock className="w-4 h-4" />
                        </span>
                    </div>
                </div>

                {/* Preview section */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                    <p className="text-center text-sm font-medium text-indigo-600 mb-4">
                        This is how it will look
                    </p>

                    {/* Message preview */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <img
                                src={coachAvatarUrl}
                                alt={coachName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <p className="text-slate-700">
                                {typingText}
                                <span className="animate-pulse">|</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Start button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onComplete(speed)}
                    className="w-full flex items-center justify-center gap-2 py-4 text-slate-900 font-medium
                        hover:text-indigo-600 transition-colors"
                >
                    <span>I'm ready to start chatting</span>
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center mt-4"
            >
                <p className="text-sm text-slate-400 mb-4">
                    You can always edit your choices later!
                </p>
                <h3 className="text-xl font-semibold text-slate-900">pAlve</h3>
                <div className="mt-4 mx-auto w-32 h-1 bg-slate-900 rounded-full" />
            </motion.div>
        </motion.div>
    );
}
