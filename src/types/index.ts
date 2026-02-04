// Coach personality types (the 5 Core Intelligence Modules)
export type CoachPersonality = 'creative' | 'analyst' | 'commander' | 'sage' | 'mix';

// Response speed settings
export type ResponseSpeed = 'slow' | 'normal' | 'fast';

// Coach avatar data
export interface Coach {
    id: string;
    name: string;
    avatarUrl: string;
    personality: CoachPersonality;
    description: string;
}

// User profile data
export type UserStatus = 'student' | 'pre-uni' | 'graduate' | 'career-switcher';

export interface EducationEntry {
    id: string;
    university: string;
    degree: string;
    major: string;
    startDate?: string;  // "MM/YYYY" format
    endDate?: string;    // "MM/YYYY" or "Present"
}

export interface WorkEntry {
    id: string;
    company: string;
    role: string;
    description: string;
    startDate?: string;  // "MM/YYYY" format
    endDate?: string;    // "MM/YYYY" or "Present"
}

export interface CommunityEntry {
    id: string;
    organization: string;
    role: string;
    description: string;
    startDate?: string;
    endDate?: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillEntry {
    id: string;
    name: string;
    level: SkillLevel;
}

export type LanguageProficiency = 'basic' | 'conversational' | 'professional' | 'native';

export interface LanguageEntry {
    id: string;
    language: string;
    proficiency: LanguageProficiency;
}

export interface ProjectEntry {
    id: string;
    title: string;
    description: string;
    url?: string;
    technologies?: string[];
}

export interface CareerInterests {
    industries: string[];
    jobTitles: string[];
}

export interface UserProfile {
    // Basic info
    name: string;
    preferredName: string;  // What user wants to be called by AI coach
    age: string;
    countries: string[];
    status?: UserStatus;
    websites: string[];  // Multiple portfolio/website URLs

    // Experience sections
    education: EducationEntry[];
    work: WorkEntry[];
    community: CommunityEntry[];  // Volunteer, leadership roles

    // Skills & Languages
    technicalSkills: SkillEntry[];   // Hard skills
    personalSkills: SkillEntry[];    // Soft skills
    languages: LanguageEntry[];

    // Career direction
    interests: CareerInterests;

    // Portfolio & Documents
    projects: ProjectEntry[];
    additionalDocuments?: File[];
    resumeFile?: File;
}

// Chat message types
export type MessageSender = 'ai' | 'user';

export interface ChatMessage {
    id: string;
    content: string;
    sender: MessageSender;
    timestamp: Date;
    isTyping?: boolean;
    isAnimated?: boolean;  // True if typewriter animation has already played
}

// Session Notes for counselor feedback
export interface SessionNote {
    id: string;
    date: Date;
    title: string;
    summary: string;
    keyInsights: string[];
    discussedTopics: string[];
    actionItems: string[];
    strategicReport?: StrategicReport;
}

// App screen states
export type AppScreen =
    | 'welcome'
    | 'home'
    | 'coach-selection'
    | 'personality-selection'
    | 'response-speed'
    | 'data-name'
    | 'data-age'
    | 'data-location'
    | 'profile'
    | 'chat'
    | 'report'
    | 'session-notes'
    | 'edit-coach';

// Session progress (0-100)
export interface SessionProgress {
    current: number;
    total: number;
}

// Quick reply option
export interface QuickReply {
    id: string;
    label: string;
    value: string;
}

// Strategic Report types
export interface RecommendedRole {
    title: string;
    matchPercentage: string;
    salaryRange: string;
    justification: string;
    industry: string;
    growthRate: string;
}

export interface Certification {
    name: string;
    provider: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface NextStep {
    step: number;
    title: string;
    description: string;
}

export interface LinkedInContact {
    name: string;
    email: string;
    avatarUrl: string;
}

export interface StrategicReport {
    userName: string;
    recommendedRoles: RecommendedRole[];
    criticalCertifications: Certification[];
    immediateNextSteps: NextStep[];
    linkedInContacts: LinkedInContact[];
    careerGrowthData: { date: string; salary: number }[];
}

// App state context
export interface AppState {
    currentScreen: AppScreen;
    selectedCoach: Coach | null;
    personality: CoachPersonality | null;
    responseSpeed: ResponseSpeed;
    userProfile: UserProfile;
    messages: ChatMessage[];
    sessionProgress: SessionProgress;
}
