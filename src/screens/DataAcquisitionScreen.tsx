import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { TypewriterText } from '../components/ui';

interface DataAcquisitionScreenProps {
    onComplete: (data: { name: string; age: string; countries: string[]; goal: string; status: string }) => void;
    onBack: () => void;
    coachAvatarUrl: string;
}

type Step = 'name' | 'age' | 'goal' | 'status' | 'location';

// Updated flow: Name -> Age -> Goal -> Status -> Location
const steps: Step[] = ['name', 'age', 'goal', 'status', 'location'];

// Question 1 Options (Goals)
const GOAL_OPTIONS = [
    {
        id: 'purpose',
        title: 'Find My Purpose',
        subtitle: 'I want a career that aligns with my values.'
    },
    {
        id: 'growth',
        title: 'Maximize Growth',
        subtitle: 'I prioritize high income and stability.'
    },
    {
        id: 'confidence',
        title: 'Build Confidence',
        subtitle: 'I feel lost and need validation.'
    },
    {
        id: 'switch',
        title: 'Switch Careers',
        subtitle: 'I want to translate my skills to a new industry.'
    },
    {
        id: 'explore',
        title: 'Explore Options',
        subtitle: 'I have several goals or I\'m still figuring it out.'
    }
];

// Question 2 Options (Status)
const STATUS_OPTIONS = [
    { id: 'student', label: 'Student', value: 'Student' },
    { id: 'grad', label: 'Fresh Graduate', value: 'Fresh Graduate' },
    { id: 'switcher', label: 'Career Switcher', value: 'Career Switcher' },
    { id: 'browsing', label: 'Just Browsing', value: 'Just Browsing' }
];

export function DataAcquisitionScreen({
    onComplete,
    onBack,
    coachAvatarUrl
}: DataAcquisitionScreenProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        status: '',
        age: '',
        countries: [] as string[]
    });
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    // ... (useEffect for auto-select remains)

    // Reset typing state when step changes
    useEffect(() => {
        setShowInput(false);
        setError(null);
        if (currentStep === 'name') setInputValue(formData.name);
        if (currentStep === 'age') setInputValue(formData.age);
    }, [currentStepIndex, currentStep, formData.name, formData.age]);

    const getQuestion = () => {
        switch (currentStep) {
            case 'name':
                return "Hello! I'm your AI Career Partner. First, what should I call you?";
            case 'age':
                return `Hi ${formData.name}. How old are you?`;
            case 'goal':
                return "What is your primary goal right now?";
            case 'status':
                return "And what is your current professional status?";
            case 'location':
                return "Which countries are you looking to work in?";
            default:
                return '';
        }
    };

    const handleNext = () => {
        if (currentStep === 'location') {
            if (formData.countries.length === 0) return;
            onComplete({
                name: formData.name,
                age: formData.age,
                countries: formData.countries,
                goal: formData.goal,
                status: formData.status
            });
            return;
        }

        if (currentStep === 'name' && !inputValue.trim()) return;

        if (currentStep === 'age') {
            const ageNum = parseInt(inputValue);
            if (isNaN(ageNum) || ageNum < 15 || ageNum > 100) {
                if (ageNum < 15) {
                    setError("We recommend pAIve to ages 15 and above, so come back again when you're 15! 🌱");
                } else {
                    setError("Ooh, how are you not retired yet? 😲 Unfortunately, valid ages are between 15 and 100.");
                }
                return;
            }
        }

        const newFormData = { ...formData, [currentStep]: inputValue.trim() };
        setFormData(newFormData);

        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setInputValue('');
        }
    };

    const handleOptionSelect = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // Auto-advance for single-selects
        setTimeout(() => {
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else if (currentStep === 'location') {
                // Location is multi-select usually, but here handled differently?
                // The code below handles location specifically.
            }
        }, 300);
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Deep Immersion Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" />

            {/* Ambient Orbs */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
            />

            {/* Progress bar */}
            <div className="relative z-20 h-1 bg-white/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Back button */}
            <div className="relative z-20 px-4 py-3">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-24 w-full max-w-2xl mx-auto">
                {/* Coach avatar */}
                <motion.div
                    layout
                    className="w-24 h-24 rounded-full p-1 mb-8 relative group"
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-spin-slow opacity-70 blur-md group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 z-10 bg-slate-900">
                        <img src={coachAvatarUrl} alt="AI Coach" className="w-full h-full object-cover" />
                    </div>
                </motion.div>

                {/* Question */}
                <div className="text-center mb-10 min-h-[80px] flex items-center justify-center">
                    <div className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                        <TypewriterText
                            key={currentStep}
                            text={getQuestion()}
                            speed={20}
                            onComplete={() => setShowInput(true)}
                        />
                    </div>
                </div>

                {/* Input Area */}
                <AnimatePresence mode="wait">
                    {showInput && (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            {currentStep === 'name' && (
                                <div className="max-w-md mx-auto relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        placeholder="Type your name..."
                                        autoFocus
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl 
                                                 text-white placeholder-white/30 text-center text-lg
                                                 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50
                                                 backdrop-blur-md transition-all"
                                    />
                                    {inputValue.trim() && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={handleNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white shadow-lg hover:shadow-cyan-500/25 transition-all"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </div>
                            )}

                            {currentStep === 'age' && (
                                <div className="max-w-xs mx-auto relative">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => {
                                            setInputValue(e.target.value);
                                            setError(null);
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        placeholder="Age"
                                        autoFocus
                                        className={`w-full px-6 py-4 bg-white/5 border rounded-2xl 
                                                 text-white placeholder-white/30 text-center text-lg
                                                 focus:outline-none focus:ring-1 
                                                 backdrop-blur-md transition-all
                                                 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50'}`}
                                    />
                                    {inputValue.trim() && !error && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={handleNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white shadow-lg hover:shadow-cyan-500/25 transition-all"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {currentStep === 'goal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {GOAL_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect('goal', option.id)}
                                            className={`group relative p-6 text-left rounded-2xl border transition-all duration-300
                                                ${formData.goal === option.id
                                                    ? 'bg-white/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                } backdrop-blur-md`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                                                    {option.title}
                                                </h3>
                                                {formData.goal === option.id && (
                                                    <Check className="w-5 h-5 text-purple-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                                                {option.subtitle}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentStep === 'status' && (
                                <div className="max-w-md mx-auto space-y-3">
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect('status', option.value)}
                                            className={`w-full p-4 flex items-center justify-between rounded-xl border transition-all
                                                ${formData.status === option.value
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-500/50 text-white'
                                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                                } backdrop-blur-md`}
                                        >
                                            <span className="font-medium">{option.label}</span>
                                            {formData.status === option.value && <Check className="w-4 h-4 text-purple-400" />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentStep === 'location' && (
                                <div className="max-w-md mx-auto">
                                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                                        {['Singapore', 'USA', 'UK', 'Remote', 'Australia', 'Canada'].map((country) => {
                                            const isSelected = formData.countries.includes(country);
                                            return (
                                                <button
                                                    key={country}
                                                    onClick={() => {
                                                        const newCountries = isSelected
                                                            ? formData.countries.filter(c => c !== country)
                                                            : [...formData.countries, country];
                                                        setFormData(prev => ({ ...prev, countries: newCountries }));
                                                    }}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                        ${isSelected
                                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    {country}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="relative mb-8 max-w-sm mx-auto">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && inputValue.trim()) {
                                                    const country = inputValue.trim();
                                                    if (!formData.countries.includes(country)) {
                                                        setFormData(prev => ({ ...prev, countries: [...prev.countries, country] }));
                                                    }
                                                    setInputValue('');
                                                }
                                            }}
                                            placeholder="Type another country and press Enter..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                                                     text-white placeholder-white/30 text-center text-sm
                                                     focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50
                                                     backdrop-blur-md transition-all"
                                        />
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleNext}
                                            disabled={formData.countries.length === 0}
                                            className={`px-8 py-3 rounded-full font-semibold transition-all
                                                ${formData.countries.length > 0
                                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-500/25'
                                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                                }`}
                                        >
                                            Complete Profile
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
