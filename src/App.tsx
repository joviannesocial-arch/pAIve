import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DevResetButton } from './components/ui';
import {
    WelcomeScreen,
    PersonalityScreen,

    DataAcquisitionScreen,
    ProfileScreen,
    ChatScreen,
    HomeScreen,
    ReportScreen,
    SessionNotesScreen,
    EditCoachScreen,
} from './screens';
import { AVATARS } from './constants';
import type { Avatar } from './constants';
import type { ProfileData } from './screens/ProfileScreen';
import type { AppScreen, StrategicReport, CoachPersonality, SessionNote, ChatMessage } from './types';

// LocalStorage keys
const STORAGE_KEY_PROFILE = 'palve_user_profile';
const STORAGE_KEY_CHAT = 'palve_chat_messages';

// Default coach avatar
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/personas/svg?seed=aura&backgroundColor=8b5cf6';

// Type for user data
interface UserData {
    name: string;
    age: string;
    countries: string[];
    goal?: string;
    status?: string;
}



function App() {
    // Navigation state
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');

    // Separate avatar (visual) from personality (logic)
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(AVATARS[0]);
    const [selectedPersonality, setSelectedPersonality] = useState<CoachPersonality>('mix');
    const [responseSpeed] = useState(50);
    const [userData, setUserData] = useState<UserData>({
        name: '',
        age: '',
        countries: [],
        goal: '',
        status: '',
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
                    countries: parsed.countries || [],
                    status: parsed.status,
                });
                console.log('[App] Loaded profile from localStorage:', parsed.name);
            } catch (err) {
                console.error('[App] Failed to parse saved profile:', err);
            }
        }

        const savedChat = localStorage.getItem(STORAGE_KEY_CHAT);
        if (savedChat) {
            try {
                const parsed = JSON.parse(savedChat) as ChatMessage[];
                // Convert string dates back to Date objects
                const messagesWithDates = parsed.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setChatMessages(messagesWithDates);
                console.log('[App] Loaded chat history from localStorage:', messagesWithDates.length, 'messages');
            } catch (err) {
                console.error('[App] Failed to parse saved chat:', err);
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

    useEffect(() => {
        if (chatMessages.length > 0) {
            localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
        }
    }, [chatMessages]);

    // Get the coach avatar URL
    const coachAvatarUrl = selectedAvatar?.avatarUrl || DEFAULT_AVATAR;
    const coachName = selectedAvatar?.name || 'Aura';

    // Navigation handlers
    const handleCustomize = () => setCurrentScreen('personality-selection');
    const handleSkip = () => setCurrentScreen('data-name');
    const handleEditCoach = () => setCurrentScreen('edit-coach');

    const handlePersonalitySelect = (personality: CoachPersonality) => {
        setSelectedPersonality(personality);
        setCurrentScreen('data-name');
    };

    const handleBackFromPersonality = () => setCurrentScreen('welcome');

    const handleDataComplete = (data: UserData) => {
        setUserData(data);
        setCurrentScreen('profile');
    };

    const handleBackFromData = () => {
        setCurrentScreen('personality-selection');
    };

    const handleProfileSave = (profileData: ProfileData) => {
        setUserProfile(profileData);
        // Also update userData for backwards compatibility
        setUserData({
            name: profileData.name,
            age: profileData.age,
            countries: profileData.countries,
            status: profileData.status
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
        setCurrentScreen('report');
        
        // Asynchronously generate detailed session notes in the background
        (async () => {
            try {
                const { generateLiveSessionNotes } = await import('./utils/geminiService');
                const note = await generateLiveSessionNotes(chatMessages, userData.name || 'User');
                setSessionNotes(prev => [note, ...prev]);
            } catch (err) {
                console.error("Failed to generate background session notes", err);
            }
        })();
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

                {currentScreen === 'personality-selection' && (
                    <PersonalityScreen
                        key="personality-selection"
                        coachName={coachName}
                        coachAvatarUrl={coachAvatarUrl}
                        onSelect={handlePersonalitySelect}
                        onBack={handleBackFromPersonality}
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
