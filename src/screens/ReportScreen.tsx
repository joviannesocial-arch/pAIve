import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2, Download, Target, TrendingUp, Briefcase,
    GraduationCap, Users, Sparkles, ChevronRight,
    Star, Award, Zap, ArrowUpRight
} from 'lucide-react';
import { BottomNav } from '../components/ui';
import type { StrategicReport } from '../types';

interface ReportScreenProps {
    report: StrategicReport;
    coachAvatarUrl: string;
    onNavigate: (screen: 'home' | 'chat' | 'profile') => void;
}

export function ReportScreen({ report, coachAvatarUrl, onNavigate }: ReportScreenProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('summary');

    const primaryRole = report.recommendedRoles[0];

    // Calculate overall match score
    const overallMatch = Math.round(
        report.recommendedRoles.reduce((acc, role) => {
            const match = parseInt(role.matchPercentage) || 85;
            return acc + match;
        }, 0) / report.recommendedRoles.length
    );

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col pb-24"
        >
            {/* Header with gradient */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNC00aC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                <div className="relative px-4 pt-12 pb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30">
                                <img src={coachAvatarUrl} alt="Coach" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs">Prepared by Aura</p>
                                <p className="text-white font-medium text-sm">Your AI Career Coach</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                                <Share2 className="w-4 h-4 text-white" />
                            </button>
                            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                                <Download className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        Strategic Career Report
                    </h1>
                    <p className="text-white/70 text-sm">
                        Personalized roadmap for {report.userName}
                    </p>

                    {/* Match Score Badge */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-12 right-4 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center"
                    >
                        <span className="text-2xl font-bold text-white">{overallMatch}%</span>
                        <span className="text-[10px] text-white/70">Match Score</span>
                    </motion.div>
                </div>
            </header>

            {/* Content - Card Grid */}
            <div className="flex-1 px-4 -mt-4 space-y-4 overflow-y-auto">

                {/* Executive Summary Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden"
                >
                    <button
                        onClick={() => toggleSection('summary')}
                        className="w-full px-5 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Executive Summary</h3>
                                <p className="text-xs text-slate-500">Your career at a glance</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'summary' ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'summary' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-5 pb-5 overflow-hidden"
                            >
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    Based on our conversation, you have strong potential in <span className="font-semibold text-indigo-600">{primaryRole?.industry || 'Technology'}</span>.
                                    Your experience positions you well for <span className="font-semibold text-indigo-600">{primaryRole?.title || 'senior roles'}</span> with
                                    expected growth of <span className="font-semibold text-green-600">{primaryRole?.growthRate || '+15%'}</span> in the coming years.
                                </p>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 text-center">
                                        <p className="text-lg font-bold text-indigo-600">{report.recommendedRoles.length}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Matched Roles</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center">
                                        <p className="text-lg font-bold text-emerald-600">{report.criticalCertifications.length}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Key Certs</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center">
                                        <p className="text-lg font-bold text-amber-600">{report.immediateNextSteps.length}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Action Items</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Recommended Roles Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden"
                >
                    <button
                        onClick={() => toggleSection('roles')}
                        className="w-full px-5 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Recommended Roles</h3>
                                <p className="text-xs text-slate-500">{report.recommendedRoles.length} positions matched</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'roles' ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'roles' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-5 pb-5 overflow-hidden space-y-3"
                            >
                                {report.recommendedRoles.map((role, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100"
                                    >
                                        {/* Match Percentage Badge */}
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                                            <span className="text-xs font-bold text-white">{role.matchPercentage}</span>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-amber-100' : i === 1 ? 'bg-slate-200' : 'bg-orange-100'
                                                }`}>
                                                {i === 0 ? <Star className="w-4 h-4 text-amber-600" /> :
                                                    i === 1 ? <Award className="w-4 h-4 text-slate-600" /> :
                                                        <Zap className="w-4 h-4 text-orange-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900">{role.title}</h4>
                                                <p className="text-xs text-slate-500 mb-2">{role.industry}</p>
                                                <p className="text-xs text-slate-600">{role.justification}</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs text-slate-500">
                                                        💰 {role.salaryRange}
                                                    </span>
                                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        {role.growthRate}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Skills & Certifications Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden"
                >
                    <button
                        onClick={() => toggleSection('skills')}
                        className="w-full px-5 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Skills & Certifications</h3>
                                <p className="text-xs text-slate-500">Recommended learning path</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'skills' ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'skills' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-5 pb-5 overflow-hidden space-y-3"
                            >
                                {report.criticalCertifications.map((cert, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                                <GraduationCap className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{cert.name}</p>
                                                <p className="text-xs text-slate-500">{cert.provider}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cert.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                                                cert.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                            }`}>
                                            {cert.level}
                                        </span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Industry Outlook Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden"
                >
                    <button
                        onClick={() => toggleSection('industry')}
                        className="w-full px-5 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Industry Outlook</h3>
                                <p className="text-xs text-slate-500">Market trends & growth</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'industry' ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'industry' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-5 pb-5 overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {/* Growth Indicators */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs text-slate-600">Target Industry</span>
                                            </div>
                                            <p className="font-semibold text-slate-900">{primaryRole?.industry || 'Technology'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                <span className="text-xs text-slate-600">Growth Rate</span>
                                            </div>
                                            <p className="font-semibold text-emerald-600">{primaryRole?.growthRate || '+12%'}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        The {primaryRole?.industry || 'technology'} sector is experiencing significant growth,
                                        with demand for {primaryRole?.title || 'professionals'} expected to increase by {primaryRole?.growthRate || '15%'} over the next 5 years.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Action Plan Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden"
                >
                    <button
                        onClick={() => toggleSection('actions')}
                        className="w-full px-5 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Action Plan</h3>
                                <p className="text-xs text-slate-500">{report.immediateNextSteps.length} immediate steps</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'actions' ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'actions' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-5 pb-5 overflow-hidden"
                            >
                                <div className="space-y-3">
                                    {report.immediateNextSteps.map((step, i) => (
                                        <motion.div
                                            key={step.step}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-3"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                                                    {step.step}
                                                </div>
                                                {i < report.immediateNextSteps.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gradient-to-b from-indigo-200 to-transparent my-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <h4 className="font-semibold text-slate-900">{step.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Networking Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden mb-8"
                >
                    <button
                        onClick={() => toggleSection('network')}
                        className="w-full px-5 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-slate-900">Networking</h3>
                                <p className="text-xs text-slate-500">{report.linkedInContacts.length} suggested connections</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'network' ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'network' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-5 pb-5 overflow-hidden space-y-3"
                            >
                                {report.linkedInContacts.map((contact, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <img
                                            src={contact.avatarUrl}
                                            alt={contact.name}
                                            className="w-10 h-10 rounded-full ring-2 ring-white"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800 text-sm">{contact.name}</p>
                                            <p className="text-xs text-slate-500">{contact.email}</p>
                                        </div>
                                        <button className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-full hover:bg-indigo-600 transition-colors">
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav
                activeItem="chat"
                onNavigate={onNavigate}
            />
        </motion.div>
    );
}
