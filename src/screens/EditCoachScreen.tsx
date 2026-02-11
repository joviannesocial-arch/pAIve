import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import type { CoachPersonality } from '../types';
import { AVATARS, PERSONALITIES, type Avatar } from '../constants';

interface EditCoachScreenProps {
    currentAvatarId?: string;
    currentPersonality?: CoachPersonality;
    onSave: (avatar: Avatar, personality: CoachPersonality) => void;
    onBack: () => void;
}

export function EditCoachScreen({
    currentAvatarId = 'aura',
    currentPersonality = 'mix',
    onSave,
    onBack
}: EditCoachScreenProps) {
    const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
    const [selectedPersonality, setSelectedPersonality] = useState<CoachPersonality>(currentPersonality);

    const selectedAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];

    const handleSave = () => {
        onSave(selectedAvatar, selectedPersonality);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-immersive flex flex-col relative overflow-hidden"
        >
            {/* Animated background orbs */}
            <div className="absolute top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute top-60 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 pb-6 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">Edit AI Coach</h1>
            </div>

            <div className="relative z-10 flex-1 px-6 pb-24 overflow-y-auto">
                {/* Avatar Selection Section */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
                        Select Avatar
                    </h2>

                    {/* 3 Avatars in a row - Sci-Fi Style */}
                    <div className="flex justify-center gap-4">
                        {AVATARS.map((avatar) => (
                            <motion.button
                                key={avatar.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedAvatarId(avatar.id)}
                                className="relative group"
                            >
                                {/* Holographic glow ring */}
                                <div
                                    className={`absolute inset-0 rounded-full transition-all duration-300 ${selectedAvatarId === avatar.id
                                        ? 'opacity-100 scale-110'
                                        : 'opacity-0 scale-100'
                                        }`}
                                    style={{
                                        boxShadow: `0 0 20px ${avatar.glowColor}, 0 0 40px ${avatar.glowColor}`,
                                        background: `radial-gradient(circle, ${avatar.glowColor} 0%, transparent 70%)`
                                    }}
                                />

                                {/* Avatar container */}
                                <div
                                    className={`relative w-24 h-24 rounded-full overflow-hidden transition-all duration-300 ${selectedAvatarId === avatar.id
                                        ? 'ring-4 ring-cyan-400/80'
                                        : 'ring-2 ring-white/20 group-hover:ring-white/40'
                                        }`}
                                    style={{
                                        boxShadow: selectedAvatarId === avatar.id
                                            ? `0 0 15px ${avatar.glowColor}, inset 0 0 20px rgba(0,0,0,0.3)`
                                            : 'inset 0 0 20px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${avatar.gradientFrom} ${avatar.gradientTo}`} />
                                    <img
                                        src={avatar.avatarUrl}
                                        alt={avatar.name}
                                        className="relative w-full h-full object-cover"
                                    />
                                </div>

                                {/* Name label */}
                                <p className={`text-center mt-2 text-sm font-medium transition-colors ${selectedAvatarId === avatar.id ? 'text-cyan-300' : 'text-white/60'
                                    }`}>
                                    {avatar.name}
                                </p>

                                {/* Selected indicator */}
                                {selectedAvatarId === avatar.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <Check className="w-4 h-4 text-slate-900" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Communication Style - 5 Personalities */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
                        Intelligence Module
                    </h2>
                    <div className="space-y-2">
                        {PERSONALITIES.map((personality) => (
                            <motion.button
                                key={personality.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setSelectedPersonality(personality.id)}
                                className={`w-full p-4 rounded-xl transition-all text-left glass-card ${selectedPersonality === personality.id
                                    ? 'ring-2 ring-cyan-400/80 bg-white/10'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{personality.name}</span>
                                            {personality.recommended && (
                                                <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    RECOMMENDED
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/50 mt-1">{personality.description}</p>
                                    </div>
                                    {selectedPersonality === personality.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center ml-3"
                                        >
                                            <Check className="w-4 h-4 text-slate-900" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>


            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent px-6 py-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold
                        shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
                >
                    Save Changes
                </motion.button>
            </div>
        </motion.div>
    );
}
