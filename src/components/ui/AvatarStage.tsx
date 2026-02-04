import { motion } from 'framer-motion';

interface AvatarStageProps {
    avatarUrl: string;
    name?: string;
    isThinking?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
};

export function AvatarStage({
    avatarUrl,
    name,
    isThinking = false,
    size = 'lg',
    className = ''
}: AvatarStageProps) {
    return (
        <div className={`flex flex-col items-center ${className}`}>
            <motion.div
                className="relative"
                animate={isThinking ? { scale: [1, 1.05, 1] } : {}}
                transition={{
                    duration: 2,
                    repeat: isThinking ? Infinity : 0,
                    ease: 'easeInOut'
                }}
            >
                {/* Gradient ring background */}
                <motion.div
                    className={`absolute -inset-1 rounded-full bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 opacity-50 blur-sm ${sizeClasses[size]}`}
                    animate={isThinking ? { opacity: [0.5, 0.8, 0.5] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Avatar image */}
                <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl`}>
                    <img
                        src={avatarUrl}
                        alt={name || 'AI Coach Avatar'}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Thinking indicator dots */}
                {isThinking && (
                    <motion.div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.15
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {name && (
                <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm font-medium text-slate-600"
                >
                    {name}
                </motion.p>
            )}
        </div>
    );
}
