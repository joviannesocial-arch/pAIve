import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Brain, BarChart3, Rocket, Sparkles, Wand2 } from 'lucide-react';
import type { CoachPersonality } from '../types';

interface PersonalityOption {
    id: CoachPersonality;
    name: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    traits: string[];
    gradientFrom: string;
    gradientTo: string;
    recommended?: boolean;
}

// The 5 Core Intelligence Modules
const personalityOptions: PersonalityOption[] = [
    {
        id: 'creative',
        name: 'The Creative',
        title: 'Innovation Guide',
        description: "Unconventional, enthusiastic 'What if?' thinking. Uses metaphors and design thinking.",
        icon: <Sparkles className="w-5 h-5" />,
        traits: ['Imaginative', 'Out-of-box', 'Inspiring'],
        gradientFrom: 'from-pink-500',
        gradientTo: 'to-rose-600'
    },
    {
        id: 'analyst',
        name: 'The Analyst',
        title: 'Data Master',
        description: 'Precise, objective, data-driven. Uses percentages, probabilities, and market trends.',
        icon: <BarChart3 className="w-5 h-5" />,
        traits: ['Logical', 'Precise', 'Evidence-based'],
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-cyan-600'
    },
    {
        id: 'commander',
        name: 'The Commander',
        title: 'Action Leader',
        description: "Direct, bold, results-oriented. Short sentences. Focuses on 'High Growth' and winning.",
        icon: <Rocket className="w-5 h-5" />,
        traits: ['Bold', 'Direct', 'Motivating'],
        gradientFrom: 'from-orange-500',
        gradientTo: 'to-amber-600'
    },
    {
        id: 'sage',
        name: 'The Sage',
        title: 'Wisdom Keeper',
        description: "Calm, philosophical, patient. Focuses on long-term fulfillment and purpose (Ikigai).",
        icon: <Brain className="w-5 h-5" />,
        traits: ['Thoughtful', 'Patient', 'Deep'],
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-600'
    },
    {
        id: 'mix',
        name: 'The Mix',
        title: 'Adaptive Pathfinder',
        description: "High EQ. Adapts to your mood and context. Friendly, engaging, game-like coaching.",
        icon: <Wand2 className="w-5 h-5" />,
        traits: ['Versatile', 'Empathetic', 'Adaptive'],
        gradientFrom: 'from-violet-500',
        gradientTo: 'to-purple-600',
        recommended: true
    },
];

interface PersonalityScreenProps {
    coachName: string;
    coachAvatarUrl: string;
    onSelect: (personality: CoachPersonality) => void;
    onBack: () => void;
}

export function PersonalityScreen({
    coachName,
    coachAvatarUrl,
    onSelect,
    onBack
}: PersonalityScreenProps) {
    const [selectedId, setSelectedId] = useState<CoachPersonality | null>(null);
    const [hoveredId, setHoveredId] = useState<CoachPersonality | null>(null);

    const handleSelect = (option: PersonalityOption) => {
        setSelectedId(option.id);
        // Delay navigation to show selection animation
        setTimeout(() => onSelect(option.id), 400);
    };

    const activeOption = personalityOptions.find(o => o.id === (hoveredId || selectedId));

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
                className="absolute bottom-20 -right-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col px-6 py-8">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="self-start flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </motion.button>

                {/* Header with avatar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
                        <span className="text-xs text-white/50">Step 2 of 3</span>
                    </div>

                    {/* Coach avatar - smaller */}
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden ring-2 ring-white/20 mb-3">
                        <img
                            src={coachAvatarUrl}
                            alt={coachName}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-1">
                        Hi, I'm {coachName}!
                    </h1>
                    <p className="text-white/50 text-sm">
                        Choose my communication style
                    </p>
                </motion.div>

                {/* Personality Options Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 space-y-2 overflow-y-auto"
                >
                    {personalityOptions.map((option, index) => (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.08 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={() => setHoveredId(option.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`w-full relative p-4 rounded-xl text-left transition-all duration-300
                                bg-white/5 backdrop-blur-sm border hover:bg-white/10
                                ${selectedId === option.id
                                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                                    : option.recommended
                                        ? 'border-purple-400/50'
                                        : 'border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradientFrom} ${option.gradientTo} flex items-center justify-center text-white flex-shrink-0`}>
                                    {option.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white truncate">{option.name}</h3>
                                        {option.recommended && (
                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-semibold uppercase">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/40 text-xs">{option.title}</p>
                                </div>

                                {/* Selection indicator */}
                                <AnimatePresence>
                                    {selectedId === option.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center"
                                        >
                                            <Check className="w-4 h-4 text-slate-900" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Expanded description on hover/select */}
                            <AnimatePresence>
                                {(hoveredId === option.id || selectedId === option.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-white/60 text-xs mt-3 leading-relaxed">
                                            {option.description}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {option.traits.map((trait, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px]"
                                                >
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Preview Card */}
                <AnimatePresence>
                    {activeOption && !selectedId && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-4 p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                        >
                            <p className="text-white/40 text-xs text-center">
                                Tap to select <span className="text-white/70 font-medium">{activeOption.name}</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center mt-4"
                >
                    <p className="text-sm text-white/30 mb-3">
                        You can change this anytime in settings
                    </p>
                    <div className="mx-auto w-32 h-1 bg-white/20 rounded-full" />
                </motion.div>
            </div>
        </motion.div>
    );
}
