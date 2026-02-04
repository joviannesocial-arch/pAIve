import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, X, Settings, User, HelpCircle, FileText } from 'lucide-react';
import { BottomNav } from '../components/ui';
import type { Coach, SessionNote } from '../types';

interface HomeScreenProps {
    userName: string;
    coach?: Coach | null;
    coachAvatarUrl: string;
    sessionNotes: SessionNote[];
    onNavigate: (screen: 'home' | 'chat' | 'profile') => void;
    onEditCoach: () => void;
    onViewSessionNote: (noteId: string) => void;
}

export function HomeScreen({
    userName,
    coachAvatarUrl,
    sessionNotes,
    onNavigate,
    onEditCoach,
    onViewSessionNote
}: HomeScreenProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    pAlve
                </span>
                <button className="flex items-center gap-1 text-white/70 text-sm font-medium hover:text-white transition-colors">
                    Logout
                    <LogOut className="w-4 h-4 ml-1" />
                </button>
            </header>

            {/* Hamburger Menu Dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 z-40"
                        />
                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            className="absolute left-6 top-24 w-64 glass-card border-none shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-2">
                                <button
                                    onClick={() => { onNavigate('profile'); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                                >
                                    <User className="w-5 h-5 text-cyan-300" />
                                    <span className="font-medium text-white">Profile</span>
                                </button>
                                <button
                                    onClick={() => { onEditCoach(); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                                >
                                    <Settings className="w-5 h-5 text-cyan-300" />
                                    <span className="font-medium text-white">Edit AI Coach</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left">
                                    <FileText className="w-5 h-5 text-cyan-300" />
                                    <span className="font-medium text-white">Session History</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left">
                                    <HelpCircle className="w-5 h-5 text-cyan-300" />
                                    <span className="font-medium text-white">Help & Support</span>
                                </button>
                                <div className="border-t border-white/10 my-2" />
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                                >
                                    <X className="w-5 h-5 text-white/50" />
                                    <span className="font-medium text-white/50">Close Menu</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 px-6 space-y-8 overflow-y-auto hide-scrollbar">
                {/* Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-3xl font-bold text-white leading-tight">
                        Hey {userName || 'Friend'}, welcome back!
                    </h1>
                </motion.div>

                {/* Edit AI Coach */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-white">Edit AI Coach</h2>
                    </div>
                    <p className="text-sm text-white/50 mb-4">
                        Select this if you would like to speak to a new AI Coach
                    </p>
                    <button onClick={onEditCoach} className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 glass-card p-1 group-hover:scale-105 transition-transform">
                            <img src={coachAvatarUrl} alt="AI Coach" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </button>
                </motion.section>

                {/* Session Feedback */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-bold text-white">Session Feedback</h2>
                    </div>
                    <p className="text-sm text-white/50 mb-4">
                        Review your coach's notes from past conversations
                    </p>

                    {sessionNotes.length === 0 ? (
                        <div className="glass-card rounded-2xl p-8 text-center text-white/50">
                            <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-sm">
                                No session notes yet. Start a conversation with your AI coach to get personalized feedback!
                            </p>
                            <button
                                onClick={() => onNavigate('chat')}
                                className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                            >
                                Start Chatting
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6">
                            {sessionNotes.map((note) => (
                                <button
                                    key={note.id}
                                    onClick={() => onViewSessionNote(note.id)}
                                    className="min-w-[200px] space-y-2 text-left hover:opacity-80 transition-opacity"
                                >
                                    <div className="h-32 rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 p-4 flex flex-col justify-end">
                                        <h3 className="text-white font-semibold text-sm line-clamp-2">
                                            {note.title}
                                        </h3>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">{formatDate(note.date)}</p>
                                        <p className="text-sm text-slate-600 truncate">
                                            {note.summary.substring(0, 50)}...
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.section>
            </main>

            <BottomNav
                activeItem="home"
                onNavigate={onNavigate}
                className="z-50"
            />
        </div>
    );
}
