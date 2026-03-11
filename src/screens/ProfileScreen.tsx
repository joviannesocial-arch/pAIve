import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Globe, Loader2, ChevronDown, ChevronUp, Briefcase, Users, Code, Heart, Languages, Target, FolderOpen } from 'lucide-react';
import { ResumeDropzone, BottomNav } from '../components/ui';
import type {
    UserStatus,
    EducationEntry,
    WorkEntry,
    CommunityEntry,
    SkillEntry,
    SkillLevel,
    LanguageEntry,
    LanguageProficiency,
    ProjectEntry,
    CareerInterests
} from '../types';
import { parseResumeWithAI, isGeminiConfigured } from '../utils/geminiService';

interface ProfileScreenProps {
    userName: string;
    initialData: {
        name: string;
        age: string;
        countries: string[];
        status?: string;
    };
    savedProfile?: ProfileData;  // Full saved profile for re-hydration
    coachAvatarUrl: string;
    onSave: (data: ProfileData) => void;
    onNavigate: (screen: 'home' | 'chat' | 'profile') => void;
}

export interface ProfileData {
    name: string;
    preferredName: string;  // How user wants to be addressed by AI
    age: string;
    countries: string[];
    status: UserStatus | undefined;
    websites: string[];  // Multiple portfolio/website URLs
    education: EducationEntry[];
    work: WorkEntry[];
    community: CommunityEntry[];
    technicalSkills: SkillEntry[];
    personalSkills: SkillEntry[];
    languages: LanguageEntry[];
    interests: CareerInterests;
    projects: ProjectEntry[];
    resumeFile?: File;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Collapsible Section Component
function CollapsibleSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    onAdd,
    addLabel = 'Add'
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    onAdd?: () => void;
    addLabel?: string;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="glass-card rounded-2xl border-none overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {onAdd && isOpen && (
                        <span
                            onClick={(e) => { e.stopPropagation(); onAdd(); }}
                            className="text-xs text-cyan-400 font-medium hover:text-cyan-300 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> {addLabel}
                        </span>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
}

export function ProfileScreen({
    userName,
    initialData,
    savedProfile,
    coachAvatarUrl,
    onSave,
    onNavigate
}: ProfileScreenProps) {
    // Use saved profile if available, otherwise use basic initial data
    const [formData, setFormData] = useState<ProfileData>(() => {
        if (savedProfile) {
            return savedProfile;
        }
        // Map status string to UserStatus literal
        let mappedStatus: UserStatus | undefined = undefined;
        if (initialData.status) {
            const s = initialData.status.toLowerCase();
            if (s.includes('student')) mappedStatus = 'student';
            else if (s.includes('graduate') || s.includes('fresh')) mappedStatus = 'graduate';
            else if (s.includes('switch')) mappedStatus = 'career-switcher';
        }

        return {
            name: initialData.name,
            preferredName: initialData.name, // Pre-fill with name given to AI
            age: initialData.age,
            countries: initialData.countries || [],
            status: mappedStatus,
            websites: [],
            education: [{ id: generateId(), university: '', degree: '', major: '' }],
            work: [{ id: generateId(), company: '', role: '', description: '' }],
            community: [],
            technicalSkills: [],
            personalSkills: [],
            languages: [],
            interests: { industries: [], jobTitles: [] },
            projects: [],
        };
    });
    const [resumeFile, setResumeFile] = useState<File>();
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [parseSuccess, setParseSuccess] = useState(false);

    // Generic field change handler
    const handleChange = (field: keyof ProfileData, value: ProfileData[keyof ProfileData]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Education handlers
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { id: generateId(), university: '', degree: '', major: '' }]
        }));
    };

    const removeEducation = (id: string) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter(e => e.id !== id)
        }));
    };

    const updateEducation = (id: string, field: keyof Omit<EducationEntry, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
        }));
    };

    // Work handlers
    const addWork = () => {
        setFormData(prev => ({
            ...prev,
            work: [...prev.work, { id: generateId(), company: '', role: '', description: '' }]
        }));
    };

    const removeWork = (id: string) => {
        setFormData(prev => ({
            ...prev,
            work: prev.work.filter(w => w.id !== id)
        }));
    };

    const updateWork = (id: string, field: keyof Omit<WorkEntry, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            work: prev.work.map(w => w.id === id ? { ...w, [field]: value } : w)
        }));
    };

    // Community/Volunteer handlers
    const addCommunity = () => {
        setFormData(prev => ({
            ...prev,
            community: [...prev.community, { id: generateId(), organization: '', role: '', description: '' }]
        }));
    };

    const removeCommunity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            community: prev.community.filter(c => c.id !== id)
        }));
    };

    const updateCommunity = (id: string, field: keyof Omit<CommunityEntry, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            community: prev.community.map(c => c.id === id ? { ...c, [field]: value } : c)
        }));
    };

    // Skills handlers
    const addSkill = (type: 'technicalSkills' | 'personalSkills') => {
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], { id: generateId(), name: '', level: 'intermediate' as SkillLevel }]
        }));
    };

    const removeSkill = (type: 'technicalSkills' | 'personalSkills', id: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(s => s.id !== id)
        }));
    };

    const updateSkill = (type: 'technicalSkills' | 'personalSkills', id: string, field: keyof Omit<SkillEntry, 'id'>, value: string | SkillLevel) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    // Language handlers
    const addLanguage = () => {
        setFormData(prev => ({
            ...prev,
            languages: [...prev.languages, { id: generateId(), language: '', proficiency: 'conversational' as LanguageProficiency }]
        }));
    };

    const removeLanguage = (id: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.filter(l => l.id !== id)
        }));
    };

    const updateLanguage = (id: string, field: keyof Omit<LanguageEntry, 'id'>, value: string | LanguageProficiency) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.map(l => l.id === id ? { ...l, [field]: value } : l)
        }));
    };

    // Project handlers
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { id: generateId(), title: '', description: '', url: '' }]
        }));
    };

    const removeProject = (id: string) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter(p => p.id !== id)
        }));
    };

    const updateProject = (id: string, field: keyof Omit<ProjectEntry, 'id'>, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
        }));
    };

    // Interests handlers
    const updateInterests = (field: keyof CareerInterests, value: string) => {
        setFormData(prev => ({
            ...prev,
            interests: {
                ...prev.interests,
                [field]: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
            }
        }));
    };

    // Resume parsing with Gemini AI
    const handleFileSelect = async (file: File) => {
        setResumeFile(file);
        setParseError(null);
        setParseSuccess(false);

        if (!isGeminiConfigured()) {
            setParseError('AI not configured. Please add API key.');
            return;
        }

        setIsParsing(true);
        console.log('[Resume Parsing] Starting to parse file:', file.name);

        try {
            // Extract text from file (works for PDF, DOC, TXT)
            let text = '';

            if (file.type === 'application/pdf') {
                console.log('[Resume Parsing] Loading PDF parser...');

                try {
                    // Use pdfjs-dist for proper PDF parsing
                    const pdfjsLib = await import('pdfjs-dist');

                    // Use unpkg CDN which serves any npm package version
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                    console.log('[Resume Parsing] PDF loaded, pages:', pdf.numPages);

                    // Extract text from all pages
                    const textParts: string[] = [];
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pageText = (textContent.items as any[])
                            .filter(item => typeof item.str === 'string')
                            .map(item => item.str)
                            .join(' ');
                        textParts.push(pageText);
                    }
                    text = textParts.join('\n\n');
                    console.log('[Resume Parsing] Extracted text length:', text.length);
                    console.log('[Resume Parsing] Sample text:', text.substring(0, 200));
                } catch (pdfError) {
                    console.error('[Resume Parsing] PDF.js error:', pdfError);
                    // Fallback: try basic text extraction
                    console.log('[Resume Parsing] Trying fallback text extraction...');
                    const arrayBuffer = await file.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    const decoder = new TextDecoder('utf-8', { fatal: false });
                    text = decoder.decode(bytes);
                    // Clean up non-printable characters
                    text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
                    console.log('[Resume Parsing] Fallback extracted text length:', text.length);
                }
            } else {
                // For text-based files
                text = await file.text();
            }

            if (text.trim().length < 50) {
                setParseError('Could not extract enough text from file. Please try a different format.');
                setIsParsing(false);
                return;
            }

            // Send to Gemini for intelligent parsing
            console.log('[Resume Parsing] Sending to Gemini AI...');
            const parsed = await parseResumeWithAI(text);
            console.log('[Resume Parsing] Parsed result:', parsed);

            // Update form with parsed data
            setFormData(prev => {
                // Map status to UserStatus ID
                let mappedStatus: UserStatus | undefined = undefined;
                if (parsed.status) {
                    const s = parsed.status.toLowerCase();
                    if (s.includes('student')) mappedStatus = 'student';
                    else if (s.includes('graduate') || s.includes('fresh')) mappedStatus = 'graduate';
                    else if (s.includes('switch')) mappedStatus = 'career-switcher';
                }

                const updated = {
                    ...prev,
                    name: parsed.name || prev.name,
                    preferredName: parsed.preferredName || prev.preferredName,
                    status: mappedStatus || prev.status,
                    education: parsed.education && parsed.education.length > 0
                        ? parsed.education.map(edu => ({ id: generateId(), ...edu }))
                        : prev.education,
                    work: parsed.work && parsed.work.length > 0
                        ? parsed.work.map(w => ({ id: generateId(), ...w }))
                        : prev.work,
                    community: parsed.community && parsed.community.length > 0
                        ? parsed.community.map(c => ({ id: generateId(), ...c }))
                        : prev.community,
                    technicalSkills: parsed.technicalSkills && parsed.technicalSkills.length > 0
                        ? parsed.technicalSkills.map(s => ({ id: generateId(), ...s }))
                        : prev.technicalSkills,
                    personalSkills: parsed.personalSkills && parsed.personalSkills.length > 0
                        ? parsed.personalSkills.map(s => ({ id: generateId(), ...s }))
                        : prev.personalSkills,
                    languages: parsed.languages && parsed.languages.length > 0
                        ? parsed.languages.map(l => ({ id: generateId(), ...l }))
                        : prev.languages,
                    websites: parsed.website
                        ? [...prev.websites, parsed.website].filter((v, i, a) => a.indexOf(v) === i) // Add parsed website, dedupe
                        : prev.websites,
                };
                console.log('[Resume Parsing] Updated form data:', updated);
                return updated;
            });
            setParseSuccess(true);
        } catch (err) {
            console.error('[Resume Parsing] Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setParseError(`Failed to parse resume: ${errorMessage}. Please try again or fill manually.`);
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = () => {
        onSave({ ...formData, resumeFile });
    };

    const statusOptions: { id: UserStatus; label: string }[] = [
        { id: 'student', label: 'University Student' },
        { id: 'pre-uni', label: 'Pre-University' },
        { id: 'graduate', label: 'Fresh Graduate' },
        { id: 'career-switcher', label: 'Career Switcher' },
    ];

    const skillLevels: { id: SkillLevel; label: string }[] = [
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' },
        { id: 'expert', label: 'Expert' },
    ];

    const languageProficiencies: { id: LanguageProficiency; label: string }[] = [
        { id: 'basic', label: 'Basic' },
        { id: 'conversational', label: 'Conversational' },
        { id: 'professional', label: 'Professional' },
        { id: 'native', label: 'Native' },
    ];

    const inputClass = "w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 backdrop-blur-sm";
    const selectClass = "px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-sm *:text-slate-900";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-transparent pb-24"
        >
            {/* Header */}
            <div className="glass-card border-none px-6 py-4 flex items-center gap-3 shadow-none sticky top-0 z-10 backdrop-blur-md">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-cyan-500/50">
                    <img src={coachAvatarUrl} alt="Coach" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-lg font-semibold text-white flex-1 text-center pr-8">
                    {userName}'s Profile
                </h1>
            </div>

            {/* CV Upload with Autofill */}
            <div className="px-6 py-4 mb-4">
                <ResumeDropzone
                    onFileSelect={handleFileSelect}
                    selectedFile={resumeFile}
                    onClear={() => {
                        setResumeFile(undefined);
                        setParseError(null);
                    }}
                />
                {isParsing && (
                    <div className="flex items-center justify-center gap-2 text-indigo-600 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Analyzing resume with AI...</span>
                    </div>
                )}
                {parseSuccess && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-700 font-medium text-center">
                            ✓ Resume parsed! Fields auto-filled below.
                        </p>
                    </div>
                )}
                {parseError && (
                    <p className="text-xs text-red-500 mt-2 text-center">{parseError}</p>
                )}
            </div>

            {/* Form Sections */}
            <div className="px-4 space-y-3">
                {/* Basic Info */}
                <div className="glass-card rounded-2xl border-none p-4 space-y-4">
                    <div>
                        <label className="block text-sm text-white/70 mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Your full name"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">
                            Preferred Name
                            <span className="text-xs text-white/40 ml-2">(How the AI coach will address you)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.preferredName}
                            onChange={(e) => handleChange('preferredName', e.target.value)}
                            placeholder="e.g. Alex, Dr. Smith, Coach"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Current Status</label>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleChange('status', option.id)}
                                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all text-center
                                        ${formData.status === option.id
                                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Age</label>
                        <input
                            type="text"
                            value={formData.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            placeholder="e.g. 23"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Countries to work in</label>

                        {/* Selected countries with remove buttons */}
                        {formData.countries.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.countries.map((country, index) => (
                                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium flex items-center gap-1 border border-cyan-500/30">
                                        {country}
                                        <button
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                countries: prev.countries.filter((_, i) => i !== index)
                                            }))}
                                            className="w-4 h-4 flex items-center justify-center hover:bg-indigo-100 rounded-full ml-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add new country */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="new-country-input"
                                placeholder="Type a country and press Enter or Add"
                                className={`${inputClass} flex-1`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        if (input.value.trim() && !formData.countries.includes(input.value.trim())) {
                                            setFormData(prev => ({
                                                ...prev,
                                                countries: [...prev.countries, input.value.trim()]
                                            }));
                                            input.value = '';
                                        }
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    const input = document.getElementById('new-country-input') as HTMLInputElement;
                                    if (input?.value.trim() && !formData.countries.includes(input.value.trim())) {
                                        setFormData(prev => ({
                                            ...prev,
                                            countries: [...prev.countries, input.value.trim()]
                                        }));
                                        input.value = '';
                                    }
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Education */}
                <CollapsibleSection title="Education Background" icon={Target} onAdd={addEducation}>
                    <div className="space-y-4">
                        {formData.education.map((edu, index) => (
                            <div key={edu.id} className="space-y-2 relative">
                                {formData.education.length > 1 && (
                                    <button
                                        onClick={() => removeEducation(edu.id)}
                                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/30 z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {index > 0 && <div className="border-t border-white/10 pt-3" />}
                                <input
                                    type="text"
                                    value={edu.university}
                                    onChange={(e) => updateEducation(edu.id, 'university', e.target.value)}
                                    placeholder="University"
                                    className={inputClass}
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                        placeholder="Degree"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <input
                                        type="text"
                                        value={edu.major}
                                        onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                                        placeholder="Major(s)"
                                        className={`${inputClass} flex-1`}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={edu.startDate || ''}
                                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                        placeholder="Start (MM/YYYY)"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <input
                                        type="text"
                                        value={edu.endDate || ''}
                                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                        placeholder="End (MM/YYYY)"
                                        className={`${inputClass} flex-1`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Work Experience */}
                <CollapsibleSection title="Work Experience" icon={Briefcase} onAdd={addWork}>
                    <div className="space-y-4">
                        {formData.work.map((work, index) => (
                            <div key={work.id} className="space-y-2 relative">
                                {formData.work.length > 1 && (
                                    <button
                                        onClick={() => removeWork(work.id)}
                                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/30 z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {index > 0 && <div className="border-t border-white/10 pt-3" />}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={work.company}
                                        onChange={(e) => updateWork(work.id, 'company', e.target.value)}
                                        placeholder="Company"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <input
                                        type="text"
                                        value={work.role}
                                        onChange={(e) => updateWork(work.id, 'role', e.target.value)}
                                        placeholder="Role"
                                        className={`${inputClass} flex-1`}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={work.startDate || ''}
                                        onChange={(e) => updateWork(work.id, 'startDate', e.target.value)}
                                        placeholder="Start (MM/YYYY)"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <input
                                        type="text"
                                        value={work.endDate || ''}
                                        onChange={(e) => updateWork(work.id, 'endDate', e.target.value)}
                                        placeholder="End or Present"
                                        className={`${inputClass} flex-1`}
                                    />
                                </div>
                                <textarea
                                    value={work.description}
                                    onChange={(e) => updateWork(work.id, 'description', e.target.value)}
                                    placeholder="Brief description..."
                                    rows={2}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Community & Leadership */}
                <CollapsibleSection title="Community & Leadership" icon={Users} onAdd={addCommunity} defaultOpen={formData.community.length > 0}>
                    {formData.community.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-2">
                            Add volunteer work, leadership roles, or community involvement
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {formData.community.map((item, index) => (
                                <div key={item.id} className="space-y-2 relative">
                                    <button
                                        onClick={() => removeCommunity(item.id)}
                                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/30 z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    {index > 0 && <div className="border-t border-white/10 pt-3" />}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={item.organization}
                                            onChange={(e) => updateCommunity(item.id, 'organization', e.target.value)}
                                            placeholder="Organization"
                                            className={`${inputClass} flex-1`}
                                        />
                                        <input
                                            type="text"
                                            value={item.role}
                                            onChange={(e) => updateCommunity(item.id, 'role', e.target.value)}
                                            placeholder="Role"
                                            className={`${inputClass} flex-1`}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={item.startDate || ''}
                                            onChange={(e) => updateCommunity(item.id, 'startDate', e.target.value)}
                                            placeholder="Start (MM/YYYY)"
                                            className={`${inputClass} flex-1`}
                                        />
                                        <input
                                            type="text"
                                            value={item.endDate || ''}
                                            onChange={(e) => updateCommunity(item.id, 'endDate', e.target.value)}
                                            placeholder="End or Present"
                                            className={`${inputClass} flex-1`}
                                        />
                                    </div>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateCommunity(item.id, 'description', e.target.value)}
                                        placeholder="Description..."
                                        rows={2}
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>

                {/* Technical Skills */}
                <CollapsibleSection title="Technical Skills" icon={Code} onAdd={() => addSkill('technicalSkills')} defaultOpen={formData.technicalSkills.length > 0}>
                    {formData.technicalSkills.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-2">
                            Add programming languages, tools, frameworks, etc.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {formData.technicalSkills.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={skill.name}
                                        onChange={(e) => updateSkill('technicalSkills', skill.id, 'name', e.target.value)}
                                        placeholder="Skill name"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <select
                                        value={skill.level}
                                        onChange={(e) => updateSkill('technicalSkills', skill.id, 'level', e.target.value as SkillLevel)}
                                        className={selectClass}
                                    >
                                        {skillLevels.map(l => (
                                            <option key={l.id} value={l.id}>{l.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeSkill('technicalSkills', skill.id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>

                {/* Personal Skills */}
                <CollapsibleSection title="Personal Skills" icon={Heart} onAdd={() => addSkill('personalSkills')} defaultOpen={formData.personalSkills.length > 0}>
                    {formData.personalSkills.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-2">
                            Add soft skills like communication, teamwork, etc.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {formData.personalSkills.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={skill.name}
                                        onChange={(e) => updateSkill('personalSkills', skill.id, 'name', e.target.value)}
                                        placeholder="Skill name"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <select
                                        value={skill.level}
                                        onChange={(e) => updateSkill('personalSkills', skill.id, 'level', e.target.value as SkillLevel)}
                                        className={selectClass}
                                    >
                                        {skillLevels.map(l => (
                                            <option key={l.id} value={l.id}>{l.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeSkill('personalSkills', skill.id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>

                {/* Languages */}
                <CollapsibleSection title="Languages" icon={Languages} onAdd={addLanguage} defaultOpen={formData.languages.length > 0}>
                    {formData.languages.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-2">
                            Add languages you speak
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {formData.languages.map((lang) => (
                                <div key={lang.id} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={lang.language}
                                        onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                                        placeholder="Language"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <select
                                        value={lang.proficiency}
                                        onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value as LanguageProficiency)}
                                        className={selectClass}
                                    >
                                        {languageProficiencies.map(p => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeLanguage(lang.id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>

                {/* Career Interests */}
                <CollapsibleSection title="Career Interests" icon={Target} defaultOpen={true}>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Target Industries (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.interests.industries.join(', ')}
                                onChange={(e) => updateInterests('industries', e.target.value)}
                                placeholder="e.g. Technology, Finance, Healthcare"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1">Target Job Titles (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.interests.jobTitles.join(', ')}
                                onChange={(e) => updateInterests('jobTitles', e.target.value)}
                                placeholder="e.g. Software Engineer, Product Manager"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Projects */}
                <CollapsibleSection title="Projects & Portfolio" icon={FolderOpen} onAdd={addProject} defaultOpen={formData.projects.length > 0}>
                    {formData.projects.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-2">
                            Add projects you've worked on
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {formData.projects.map((project, index) => (
                                <div key={project.id} className="space-y-2 relative">
                                    <button
                                        onClick={() => removeProject(project.id)}
                                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/30 z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    {index > 0 && <div className="border-t border-white/10 pt-3" />}
                                    <input
                                        type="text"
                                        value={project.title}
                                        onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                                        placeholder="Project Title"
                                        className={inputClass}
                                    />
                                    <textarea
                                        value={project.description}
                                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                        placeholder="Description..."
                                        rows={2}
                                        className={`${inputClass} resize-none`}
                                    />
                                    <input
                                        type="url"
                                        value={project.url || ''}
                                        onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                                        placeholder="Project URL (optional)"
                                        className={inputClass}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>

                {/* Websites / Portfolio */}
                <div className="glass-card rounded-2xl border-none p-4">
                    <label className="block text-sm text-white/70 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Websites / Portfolio
                    </label>

                    {/* Existing websites */}
                    {formData.websites.length > 0 && (
                        <div className="space-y-2 mb-3">
                            {formData.websites.map((url, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="flex-1 px-3 py-2 bg-white/5 rounded-lg text-sm text-white truncate">
                                        {url}
                                    </span>
                                    <button
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            websites: prev.websites.filter((_, i) => i !== index)
                                        }))}
                                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new website */}
                    <div className="flex gap-2">
                        <input
                            type="url"
                            id="new-website-input"
                            placeholder="https://linkedin.com/in/yourprofile"
                            className={`${inputClass} flex-1`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement;
                                    if (input.value.trim()) {
                                        setFormData(prev => ({
                                            ...prev,
                                            websites: [...prev.websites, input.value.trim()]
                                        }));
                                        input.value = '';
                                    }
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const input = document.getElementById('new-website-input') as HTMLInputElement;
                                if (input?.value.trim()) {
                                    setFormData(prev => ({
                                        ...prev,
                                        websites: [...prev.websites, input.value.trim()]
                                    }));
                                    input.value = '';
                                }
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30"
                >
                    Save Profile
                </motion.button>
            </div>

            {/* Bottom Navigation */}
            <BottomNav
                activeItem="profile"
                onNavigate={(item) => onNavigate(item)}
            />
        </motion.div>
    );
}
