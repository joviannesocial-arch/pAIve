import type { StrategicReport, RecommendedRole, Certification, NextStep, LinkedInContact } from '../types';

// Conversation stages for career counseling
type ConversationStage = 'intro' | 'goals' | 'experience' | 'skills' | 'challenges' | 'summary';

interface ConversationState {
    stage: ConversationStage;
    userName: string;
    collectedData: {
        goals: string[];
        experience: string[];
        skills: string[];
        challenges: string[];
        location: string;
    };
    messageCount: number;
}

// Career strategist prompts for each stage
const stageQuestions: Record<ConversationStage, string[]> = {
    intro: [
        "I'm your Career Strategy Coach. Before we dive in, what's the primary career challenge you're facing right now?",
        "Let's build your career roadmap together. What made you seek career guidance today?"
    ],
    goals: [
        "That's valuable context. Now, where do you see yourself in 2-3 years? Be specific about role, industry, or company type.",
        "What does career success look like to you? Is it salary, impact, work-life balance, or something else?",
        "If you could have any role tomorrow, what would it be and why?"
    ],
    experience: [
        "Let's map your experience. What's your most significant professional achievement so far?",
        "What industries or domains have you worked in? Any that you'd never want to return to?",
        "Tell me about a project where you felt most engaged and productive."
    ],
    skills: [
        "What are the top 3 skills you're confident selling to an employer?",
        "What skill gap keeps you from your dream role right now?",
        "Are there any certifications or technical skills you've been meaning to acquire?"
    ],
    challenges: [
        "What's the biggest obstacle between you and your career goal?",
        "Have you faced rejection in job applications? What feedback, if any, did you receive?",
        "What about your current situation feels most frustrating?"
    ],
    summary: [
        "I have enough to build your strategy. Based on our conversation, I'm generating your personalized Career Path Research Report. This will include specific role recommendations, salary expectations, and tactical next steps."
    ]
};

// Determine next stage based on message count and content
function getNextStage(state: ConversationState): ConversationStage {
    const { stage, messageCount } = state;

    // Progress through stages based on interaction count
    if (stage === 'intro' && messageCount >= 2) return 'goals';
    if (stage === 'goals' && messageCount >= 4) return 'experience';
    if (stage === 'experience' && messageCount >= 6) return 'skills';
    if (stage === 'skills' && messageCount >= 8) return 'challenges';
    if (stage === 'challenges' && messageCount >= 10) return 'summary';

    return stage;
}

// Extract data from user message based on current stage
function extractData(message: string, _stage: ConversationStage): string[] {
    // Simple extraction - in production, this would use NLP
    return [message.trim()];
}

// Generate AI response based on conversation state
export function generateCareerAIResponse(
    userMessage: string,
    currentState: ConversationState
): { response: string; newState: ConversationState; isComplete: boolean } {
    // Update collected data based on stage
    const newData = { ...currentState.collectedData };
    const extracted = extractData(userMessage, currentState.stage);

    switch (currentState.stage) {
        case 'intro':
        case 'goals':
            newData.goals = [...newData.goals, ...extracted];
            break;
        case 'experience':
            newData.experience = [...newData.experience, ...extracted];
            break;
        case 'skills':
            newData.skills = [...newData.skills, ...extracted];
            break;
        case 'challenges':
            newData.challenges = [...newData.challenges, ...extracted];
            break;
    }

    // Check for stage transition
    const newMessageCount = currentState.messageCount + 1;
    const newStage = getNextStage({ ...currentState, messageCount: newMessageCount });
    const stageChanged = newStage !== currentState.stage;

    // Get question for current or new stage
    const questionsForStage = stageQuestions[newStage];
    const questionIndex = stageChanged ? 0 : Math.min(
        Math.floor(Math.random() * questionsForStage.length),
        questionsForStage.length - 1
    );

    let response = questionsForStage[questionIndex];

    // Add acknowledgment before transitioning
    if (stageChanged && newStage !== 'summary') {
        const acknowledgments = [
            "Great insight. ",
            "That's really helpful context. ",
            "I understand. ",
            "Thank you for sharing that. "
        ];
        response = acknowledgments[Math.floor(Math.random() * acknowledgments.length)] + response;
    }

    const isComplete = newStage === 'summary';

    return {
        response,
        newState: {
            ...currentState,
            stage: newStage,
            collectedData: newData,
            messageCount: newMessageCount
        },
        isComplete
    };
}

// Generate strategic report from collected conversation data
export function generateStrategicReport(
    state: ConversationState,
    location: string = 'Singapore'
): StrategicReport {
    // Analyze collected data to generate recommendations
    // In production, this would use an LLM API

    const isSingapore = location.toLowerCase().includes('singapore');
    const currency = isSingapore ? 'SGD' : 'USD';
    const salaryMultiplier = isSingapore ? 1 : 1.3;

    const recommendedRoles: RecommendedRole[] = [
        {
            title: 'Business Analyst',
            matchPercentage: '78%',
            salaryRange: `${currency} ${Math.round(55000 * salaryMultiplier).toLocaleString()} - ${Math.round(85000 * salaryMultiplier).toLocaleString()}/year`,
            justification: 'Strong analytical communication skills align with BA requirements. Gap: SQL proficiency.',
            industry: 'Technology',
            growthRate: '+33%'
        },
        {
            title: 'Product Manager',
            matchPercentage: '65%',
            salaryRange: `${currency} ${Math.round(70000 * salaryMultiplier).toLocaleString()} - ${Math.round(110000 * salaryMultiplier).toLocaleString()}/year`,
            justification: 'Strategic thinking evident, but needs hands-on product experience.',
            industry: 'SaaS',
            growthRate: '+28%'
        },
        {
            title: 'Strategy Consultant',
            matchPercentage: '72%',
            salaryRange: `${currency} ${Math.round(65000 * salaryMultiplier).toLocaleString()} - ${Math.round(95000 * salaryMultiplier).toLocaleString()}/year`,
            justification: 'Problem-solving aptitude is clear. Consider case interview prep.',
            industry: 'Consulting',
            growthRate: '+18%'
        }
    ];

    const criticalCertifications: Certification[] = [
        { name: 'Google Data Analytics Certificate', provider: 'Coursera/Google', level: 'Beginner' },
        { name: 'AWS Cloud Practitioner', provider: 'Amazon Web Services', level: 'Beginner' },
        { name: 'PMP Certification', provider: 'PMI', level: 'Intermediate' }
    ];

    const immediateNextSteps: NextStep[] = [
        {
            step: 1,
            title: 'Update LinkedIn Headline',
            description: `Change to: "Aspiring ${recommendedRoles[0].title} | ${state.collectedData.skills[0] || 'Strategy'} & Analytics"`
        },
        {
            step: 2,
            title: 'Targeted Networking',
            description: 'Message 5 alumni from your university working at top consulting firms this week.'
        },
        {
            step: 3,
            title: 'Skill Building',
            description: `Complete the ${criticalCertifications[0].name} within 4 weeks.`
        }
    ];

    const linkedInContacts: LinkedInContact[] = [
        { name: 'Elynn Lee', email: 'elynn@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elynn' },
        { name: 'Oscar Dunn', email: 'oscar@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oscar' },
        { name: 'Sarah Chen', email: 'sarah@example.com', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' }
    ];

    // Generate mock career growth data
    const today = new Date();
    const careerGrowthData = Array.from({ length: 8 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (7 - i));
        const baseValue = 30000 + (i * 2500);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            salary: baseValue + Math.random() * 1000
        };
    });

    return {
        userName: state.userName,
        recommendedRoles,
        criticalCertifications,
        immediateNextSteps,
        linkedInContacts,
        careerGrowthData
    };
}

// Initialize conversation state
export function createInitialConversationState(userName: string): ConversationState {
    return {
        stage: 'intro',
        userName,
        collectedData: {
            goals: [],
            experience: [],
            skills: [],
            challenges: [],
            location: ''
        },
        messageCount: 0
    };
}

// Get initial greeting
export function getInitialGreeting(userName: string): string {
    return `Hi ${userName}, I'm your AI Career Strategist. I don't do fluff — I give tactical, high-leverage career advice. Let's build your personalized career roadmap. What's the biggest career decision you're wrestling with right now?`;
}

export type { ConversationState };
