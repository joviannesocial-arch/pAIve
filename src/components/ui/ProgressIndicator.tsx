import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface ProgressIndicatorProps {
    progress: number; // 0-100
    className?: string;
}

export function ProgressIndicator({ progress, className = '' }: ProgressIndicatorProps) {
    const isActive = progress > 0;
    const isComplete = progress >= 100;

    return (
        <motion.div
            className={`relative flex items-center justify-center ${className}`}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
            {/* Glow effect behind the icon */}
            <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                    boxShadow: isComplete
                        ? '0 0 30px rgba(250, 204, 21, 0.8), 0 0 60px rgba(250, 204, 21, 0.4)'
                        : isActive
                            ? `0 0 ${10 + progress * 0.2}px rgba(250, 204, 21, ${0.3 + progress * 0.005})`
                            : 'none'
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Background circle with fill */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-yellow-300"
                    initial={{ height: '0%' }}
                    animate={{ height: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb
                        className={`w-5 h-5 transition-colors duration-300 ${isComplete
                                ? 'text-yellow-900'
                                : isActive
                                    ? 'text-yellow-200'
                                    : 'text-slate-500'
                            }`}
                    />
                </div>
            </div>

            {/* Progress label */}
            <span className="ml-2 text-xs font-medium text-slate-400">
                {Math.round(progress)}%
            </span>
        </motion.div>
    );
}
