import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { AVATARS, type Avatar } from '../constants';

// Re-export Avatar type for use in App.tsx
export type { Avatar } from '../constants';

interface AvatarSelectionScreenProps {
    onSelect: (avatar: Avatar) => void;
    onBack: () => void;
}

export function AvatarSelectionScreen({ onSelect, onBack }: AvatarSelectionScreenProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (avatar: Avatar) => {
        setSelectedId(avatar.id);
        // Delay navigation to show selection animation
        setTimeout(() => onSelect(avatar), 400);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" />

            {/* Animated orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0],
                    y: [0, -20, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 -left-20 w-60 h-60 bg-purple-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-40 -right-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col px-6 py-10">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="self-start flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
                        <span className="text-xs text-white/50">Step 1 of 3</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Choose Your Avatar
                    </h1>
                    <p className="text-white/50 text-sm">
                        Select your visual identity
                    </p>
                </motion.div>

                {/* Avatar Grid - Compact 3-column layout with Sci-Fi styling */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 flex flex-col items-center justify-center"
                >
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto w-full">
                        {AVATARS.map((avatar, index) => (
                            <motion.button
                                key={avatar.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelect(avatar)}
                                className="relative aspect-square group"
                            >
                                {/* Holographic glow effect */}
                                <motion.div
                                    className={`absolute inset-0 rounded-2xl transition-all duration-300 ${selectedId === avatar.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                                        }`}
                                    style={{
                                        boxShadow: `0 0 20px rgba(120, 80, 255, 0.4), 0 0 50px ${avatar.glowColor}`,
                                        background: `radial-gradient(circle, ${avatar.glowColor} 0%, transparent 70%)`
                                    }}
                                />

                                {/* Avatar container with neon border */}
                                <div
                                    className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${selectedId === avatar.id
                                        ? 'ring-4'
                                        : 'ring-2 ring-white/10 group-hover:ring-white/30'
                                        }`}
                                    style={{
                                        '--tw-ring-color': selectedId === avatar.id ? avatar.borderColor : undefined,
                                        boxShadow: selectedId === avatar.id
                                            ? `0 0 15px ${avatar.glowColor}, inset 0 0 30px rgba(0,0,0,0.4)`
                                            : 'inset 0 0 30px rgba(0,0,0,0.4)'
                                    } as React.CSSProperties}
                                >
                                    {/* Gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${avatar.gradientFrom} ${avatar.gradientTo}`} />

                                    {/* Sci-Fi Avatar (bottts-neutral) */}
                                    <img
                                        src={avatar.avatarUrl}
                                        alt={avatar.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {/* Name label */}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                        <p className={`text-sm font-semibold text-center ${selectedId === avatar.id ? 'text-cyan-300' : 'text-white'
                                            }`}>
                                            {avatar.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Selection indicator */}
                                <AnimatePresence>
                                    {selectedId === avatar.id && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg"
                                            style={{
                                                boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)'
                                            }}
                                        >
                                            <Check className="w-4 h-4 text-slate-900" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>

                    {/* Hint text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-white/30 text-xs text-center mt-6"
                    >
                        Tap an avatar to continue
                    </motion.p>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-6"
                >
                    {/* Home indicator line */}
                    <div className="mx-auto w-32 h-1 bg-white/20 rounded-full" />
                </motion.div>
            </div>
        </motion.div>
    );
}

// Keep backwards compatibility - export old interface for type compatibility
export interface Coach extends Avatar {
    title: string;
    description: string;
    bgColor: string;
    gradientFrom: string;
    gradientTo: string;
    icon: React.ReactNode;
    traits: string[];
}

// Re-export for backwards compatibility with App.tsx
export { AvatarSelectionScreen as CoachSelectionScreen };
