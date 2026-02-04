import { motion } from 'framer-motion';
import { ArrowLeft, Target, Lightbulb, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { BottomNav } from '../components/ui';
import type { SessionNote } from '../types';

interface SessionNotesScreenProps {
    note: SessionNote;
    coachAvatarUrl: string;
    onBack: () => void;
    onNavigate: (screen: 'home' | 'chat' | 'profile') => void;
    onViewReport?: () => void;
}

export function SessionNotesScreen({
    note,
    coachAvatarUrl,
    onBack,
    onNavigate,
    onViewReport
}: SessionNotesScreenProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img src={coachAvatarUrl} alt="AI Coach" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{note.title}</h1>
                        <p className="text-sm text-slate-500">{formatDate(note.date)}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-6 space-y-6 overflow-y-auto hide-scrollbar">
                {/* Summary */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h2 className="font-bold text-slate-900">Session Summary</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{note.summary}</p>
                </motion.section>

                {/* Key Insights */}
                {note.keyInsights.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            <h2 className="font-bold text-slate-900">Key Insights</h2>
                        </div>
                        <ul className="space-y-2">
                            {note.keyInsights.map((insight, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                                    <span className="text-slate-600">{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.section>
                )}

                {/* Topics Discussed */}
                {note.discussedTopics.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h2 className="font-bold text-slate-900">Topics Discussed</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {note.discussedTopics.map((topic, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Action Items */}
                {note.actionItems.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <h2 className="font-bold text-slate-900">Action Items</h2>
                        </div>
                        <ul className="space-y-3">
                            {note.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-slate-600">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.section>
                )}

                {/* Strategic Report Link */}
                {note.strategicReport && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <button
                            onClick={onViewReport}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-left hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">View Strategic Report</h3>
                                    <p className="text-white/80 text-sm">Career analysis and recommendations</p>
                                </div>
                            </div>
                        </button>
                    </motion.section>
                )}
            </main>

            <BottomNav
                activeItem="home"
                onNavigate={onNavigate}
                className="z-50"
            />
        </div>
    );
}
