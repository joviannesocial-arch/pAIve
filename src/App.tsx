import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DevResetButton } from './components/ui';
import {
    WelcomeScreen,
    CoachSelectionScreen,
    PersonalityScreen,

    DataAcquisitionScreen,
    ProfileScreen,
    ChatScreen,
    HomeScreen,
    ReportScreen,
    SessionNotesScreen,
    EditCoachScreen,
} from './screens';
import type { Avatar } from './screens/CoachSelectionScreen';
import type { ProfileData } from './screens/ProfileScreen';
import type { AppScreen, StrategicReport, CoachPersonality, SessionNote, ChatMessage } from './types';

// LocalStorage keys
const STORAGE_KEY_PROFILE = 'palve_user_profile';

// Default coach avatar
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/personas/svg?seed=aura&backgroundColor=8b5cf6';

// Type for user data
interface UserData {
    name: string;
    age: string;
    countries: string[];
}

// Generate session notes from conversation
function generateSessionNotes(
    userName: string,
    report?: StrategicReport
): SessionNote {
    const topics = ['Career goals', 'Skills assessment', 'Industry preferences'];
    const insights = [
        `${userName} shows strong potential for growth in their chosen field`,
        'Clear understanding of career objectives and willing to develop new skills',
        'Open to exploring multiple industries and locations'
    ];
    const actions = [
        'Review the strategic report and identify top 3 priorities',
        'Research recommended certifications and enroll in at least one',
        'Update LinkedIn profile based on recommendations',
        'Connect with suggested professionals in the industry'
    ];

    return {
        id: Date.now().toString(),
        date: new Date(),
        title: 'Career Path Discovery Session',
        summary: `Today we had a productive discussion about ${userName}'s career aspirations. We explored various industries and roles that align with their skills and interests. The session covered goal setting, skill gap analysis, and actionable next steps for career advancement.`,
        keyInsights: insights,
        discussedTopics: topics,
        actionItems: actions,
        strategicReport: report
    };
}

function App() {
    // Navigation state
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');

    // Separate avatar (visual) from personality (logic)
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
    const [selectedPersonality, setSelectedPersonality] = useState<CoachPersonality>('mix');
    const [responseSpeed] = useState(50);
    const [userData, setUserData] = useState<UserData>({
        name: '',
        age: '',
        countries: [],
    });

    // Strategic report & session notes
    const [strategicReport, setStrategicReport] = useState<StrategicReport | null>(null);
    const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    // Chat messages (persisted across navigation)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    // Full user profile (from ProfileScreen)
    const [userProfile, setUserProfile] = useState<ProfileData | null>(null);

    // Load profile from localStorage on app start
    useEffect(() => {
        const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile) as ProfileData;
                setUserProfile(parsed);
                // Also update userData for backwards compatibility
                setUserData({
                    name: parsed.name,
                    age: parsed.age,
                    countries: parsed.countries || []
                });
                console.log('[App] Loaded profile from localStorage:', parsed.name);
            } catch (err) {
                console.error('[App] Failed to parse saved profile:', err);
            }
        }
    }, []);

    // Save profile to localStorage whenever it changes
    useEffect(() => {
        if (userProfile) {
            try {
                // Note: File objects cannot be serialized, so we exclude resumeFile
                const { resumeFile, ...profileToSave } = userProfile;
                localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profileToSave));
                console.log('[App] Saved profile to localStorage:', userProfile.name);
            } catch (err) {
                console.error('[App] Failed to save profile:', err);
            }
        }
    }, [userProfile]);

    // Get the coach avatar URL
    const coachAvatarUrl = selectedAvatar?.avatarUrl || DEFAULT_AVATAR;
    const coachName = selectedAvatar?.name || 'Aura';

    // Navigation handlers
    const handleCustomize = () => setCurrentScreen('coach-selection');
    const handleSkip = () => setCurrentScreen('data-name');
    const handleEditCoach = () => setCurrentScreen('edit-coach');

    const handleAvatarSelect = (avatar: Avatar) => {
        setSelectedAvatar(avatar);
        setCurrentScreen('personality-selection');
    };

    const handlePersonalitySelect = (personality: CoachPersonality) => {
        setSelectedPersonality(personality);
        setCurrentScreen('data-name');
    };

    const handleBackToWelcome = () => setCurrentScreen('welcome');
    const handleBackToCoachSelection = () => setCurrentScreen('coach-selection');

    const handleDataComplete = (data: UserData) => {
        setUserData(data);
        setCurrentScreen('profile');
    };

    const handleBackFromData = () => {
        if (selectedAvatar) {
            setCurrentScreen('personality-selection');
        } else {
            setCurrentScreen('welcome');
        }
    };

    const handleProfileSave = (profileData: ProfileData) => {
        setUserProfile(profileData);
        // Also update userData for backwards compatibility
        setUserData({
            name: profileData.name,
            age: profileData.age,
            countries: profileData.countries
        });
        setCurrentScreen('chat');
    };

    // Handle profile updates from AI tool calls
    const handleProfileUpdate = (updates: Partial<ProfileData>) => {
        console.log('[App] Profile update from AI:', updates);
        setUserProfile(prev => {
            if (!prev) return prev;

            // Merge career interests if provided
            if (updates.interests) {
                return {
                    ...prev,
                    interests: {
                        industries: [
                            ...new Set([
                                ...(prev.interests?.industries || []),
                                ...(updates.interests.industries || [])
                            ])
                        ],
                        jobTitles: [
                            ...new Set([
                                ...(prev.interests?.jobTitles || []),
                                ...(updates.interests.jobTitles || [])
                            ])
                        ]
                    }
                };
            }

            return { ...prev, ...updates };
        });
    };

    const handleNavigate = (screen: 'home' | 'chat' | 'profile') => {
        if (screen === 'home') {
            setCurrentScreen('home');
        } else if (screen === 'chat') {
            setCurrentScreen('chat');
        } else if (screen === 'profile') {
            setCurrentScreen('profile');
        }
    };

    const handleStartNow = () => {
        setCurrentScreen('home');
    };

    const handleGenerateReport = (report: StrategicReport) => {
        setStrategicReport(report);
        // Also generate and save session notes
        const note = generateSessionNotes(userData.name || 'User', report);
        setSessionNotes(prev => [note, ...prev]);
        setCurrentScreen('report');
    };

    const handleViewSessionNote = (noteId: string) => {
        setSelectedNoteId(noteId);
        setCurrentScreen('session-notes');
    };

    const handleBackFromSessionNotes = () => {
        setSelectedNoteId(null);
        setCurrentScreen('home');
    };

    const handleViewReportFromNotes = () => {
        setCurrentScreen('report');
    };

    // Get selected note
    const selectedNote = sessionNotes.find(n => n.id === selectedNoteId);

    return (
        <div className="min-h-screen bg-transparent">
            <AnimatePresence mode="wait">
                {currentScreen === 'welcome' && (
                    <WelcomeScreen
                        key="welcome"
                        onCustomize={handleCustomize}
                        onSkip={handleSkip}
                        onStartNow={handleStartNow}
                    />
                )}

                {currentScreen === 'home' && (
                    <HomeScreen
                        key="home"
                        userName={userData.name || 'Jane'}
                        coachAvatarUrl={coachAvatarUrl}
                        sessionNotes={sessionNotes}
                        onNavigate={handleNavigate}
                        onEditCoach={handleEditCoach}
                        onViewSessionNote={handleViewSessionNote}
                    />
                )}

                {currentScreen === 'coach-selection' && (
                    <CoachSelectionScreen
                        key="coach-selection"
                        onSelect={handleAvatarSelect}
                        onBack={handleBackToWelcome}
                    />
                )}

                {currentScreen === 'personality-selection' && (
                    <PersonalityScreen
                        key="personality-selection"
                        coachName={coachName}
                        coachAvatarUrl={coachAvatarUrl}
                        onSelect={handlePersonalitySelect}
                        onBack={handleBackToCoachSelection}
                    />
                )}



                {currentScreen === 'data-name' && (
                    <DataAcquisitionScreen
                        key="data-acquisition"
                        coachAvatarUrl={coachAvatarUrl}
                        onComplete={handleDataComplete}
                        onBack={handleBackFromData}
                    />
                )}

                {currentScreen === 'profile' && (
                    <ProfileScreen
                        key="profile"
                        userName={userData.name || userProfile?.name || 'User'}
                        initialData={userData}
                        savedProfile={userProfile || undefined}
                        coachAvatarUrl={coachAvatarUrl}
                        onSave={handleProfileSave}
                        onNavigate={handleNavigate}
                    />
                )}

                {currentScreen === 'chat' && (
                    <ChatScreen
                        key="chat"
                        userName={userData.name || 'Friend'}
                        coachAvatarUrl={coachAvatarUrl}
                        userLocation={userData.countries[0] || 'Singapore'}
                        userProfile={userProfile || undefined}
                        personality={selectedPersonality}
                        messages={chatMessages}
                        onMessagesChange={setChatMessages}
                        onNavigate={handleNavigate}
                        onGenerateReport={handleGenerateReport}
                        onProfileUpdate={handleProfileUpdate}
                        typewriterSpeed={responseSpeed}
                    />
                )}

                {currentScreen === 'report' && strategicReport && (
                    <ReportScreen
                        key="report"
                        report={strategicReport}
                        coachAvatarUrl={coachAvatarUrl}
                        onNavigate={handleNavigate}
                    />
                )}

                {currentScreen === 'session-notes' && selectedNote && (
                    <SessionNotesScreen
                        key="session-notes"
                        note={selectedNote}
                        coachAvatarUrl={coachAvatarUrl}
                        onBack={handleBackFromSessionNotes}
                        onNavigate={handleNavigate}
                        onViewReport={handleViewReportFromNotes}
                    />
                )}

                {currentScreen === 'edit-coach' && (
                    <EditCoachScreen
                        key="edit-coach"
                        currentAvatarId={selectedAvatar?.id || 'aura'}
                        currentPersonality={selectedPersonality}
                        onSave={(avatar, personality) => {
                            setSelectedAvatar(avatar);
                            setSelectedPersonality(personality);
                            setCurrentScreen('home');
                        }}
                        onBack={() => setCurrentScreen('home')}
                    />
                )}
            </AnimatePresence>

            {/* Dev mode reset button */}
            <DevResetButton />
        </div>
    );
}

export default App;
