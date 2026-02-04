import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

interface WelcomeScreenProps {
    onCustomize: () => void;
    onSkip: () => void;
    onStartNow: () => void;
}

export function WelcomeScreen({ onCustomize, onStartNow }: WelcomeScreenProps) {
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
                className="absolute top-60 -right-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 20, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-40 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"
            />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col px-6 py-12">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-white/70">AI-Powered Career Coaching</span>
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Your Career<br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                            Transformation
                        </span><br />
                        Starts Here
                    </h1>
                    <p className="text-white/60 leading-relaxed">
                        Personalized guidance powered by AI<br />
                        to unlock your full potential
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Customize Coach Card - Glassmorphism */}
                    <motion.button
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCustomize}
                        className="group relative overflow-hidden rounded-3xl p-6 text-left
                         bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl
                         border border-white/20 shadow-2xl shadow-purple-500/10"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold uppercase tracking-wider">
                                        Recommended
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Customize Your AI Coach
                                </h2>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Choose the <span className="text-purple-300">look</span>, <span className="text-pink-300">personality</span>, and <span className="text-indigo-300">coaching style</span> that resonates with you.
                                </p>
                            </div>

                            {/* Animated Avatar Stack */}
                            <div className="flex-shrink-0 relative">
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/30"
                                >
                                    <div className="w-full h-full rounded-2xl overflow-hidden">
                                        <img
                                            src="https://api.dicebear.com/7.x/personas/svg?seed=coach1&backgroundColor=9333ea"
                                            alt="Coach Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </motion.div>
                                {/* Sparkle decoration */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-yellow-800" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Arrow indicator removed per request */}
                    </motion.button>

                    {/* Quick Start Card */}
                    <motion.button
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartNow}
                        className="group relative overflow-hidden rounded-3xl p-6 text-left
                         bg-gradient-to-br from-white/5 to-transparent backdrop-blur-lg
                         border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1 pr-4">
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Quick Start
                                </h2>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Jump straight in with our default coach. You can always customize later.
                                </p>
                            </div>

                            {/* Quick icon */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <Zap className="w-5 h-5 text-white/50 group-hover:text-purple-400 transition-colors" />
                            </div>
                        </div>
                    </motion.button>
                </div>

                {/* Footer branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8"
                >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                        pAlve
                    </h3>
                    <p className="text-white/30 text-xs mt-1">Your AI Career Partner</p>

                    {/* Home indicator line */}
                    <div className="mt-6 mx-auto w-32 h-1 bg-white/20 rounded-full" />
                </motion.div>
            </div>
        </motion.div>
    );
}
