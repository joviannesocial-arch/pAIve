import { GoogleGenerativeAI, ChatSession, SchemaType, type Tool } from '@google/generative-ai';
import type { CoachPersonality, ChatMessage } from '../types';
import { getPersonaDefinition, formatPersonaPrompt, type PersonaDefinition } from '../lib/personas';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn('Gemini API key not found. Add VITE_GEMINI_API_KEY to .env file.');
} else {
    console.log('Gemini API key loaded successfully');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// gemini-2.0-flash - confirmed available via API
const MODEL_NAME = 'gemini-2.0-flash';

// ============== USER DOSSIER SYSTEM ==============

/**
 * Complete user profile snapshot for AI context injection
 */
export interface UserDossier {
    name: string;
    age?: string;
    locationPreference?: string[];
    currentStatus?: string;
    goal?: string;
    resume: {
        education: Array<{ university: string; degree: string; major: string; startDate?: string; endDate?: string }>;
        experience: Array<{ company: string; role: string; description?: string; startDate?: string; endDate?: string }>;
        skills: string[];
    };
}

/**
 * Build a structured UserDossier from the profile context
 */
export function buildUserDossier(userName: string, profile?: UserProfileContext): UserDossier {
    // If no preferred name, try to use just the first name of the provided userName
    const firstPart = userName.split(' ')[0];
    const displayName = profile?.preferredName || firstPart || 'Friend';

    return {
        name: displayName,
        age: profile?.age,
        locationPreference: profile?.countries,
        currentStatus: profile?.status,
        goal: undefined, // Can be populated from onboarding goal if available
        resume: {
            education: profile?.education || [],
            experience: profile?.work?.map(w => ({
                company: w.company,
                role: w.role,
                description: undefined,
                startDate: w.startDate,
                endDate: w.endDate
            })) || [],
            skills: [
                ...(profile?.technicalSkills?.map(s => s.name) || []),
                ...(profile?.personalSkills?.map(s => s.name) || [])
            ]
        }
    };
}

const BASE_SYSTEM_PROMPT = `You are "The Pathfinder" - an AI Career Coach and partner in career discovery. You help users discover their "Career DNA" - the unique combination of skills, passions, values, and aspirations that define their ideal career path.

## AVAILABLE TOOLS
You have access to these tools - USE THEM when appropriate:

1. **updateCareerInterests**: Call this when the user confirms or mentions specific industries or job titles they're interested in.
   - ALWAYS ask for confirmation before updating: "I heard you're interested in [X]. Should I add that to your profile?"

2. **offerStrategicReport**: Offers to generate a strategic career report. You MUST NOT call this unless ALL of the following are confirmed:
   - At least 10 meaningful conversational exchanges have occurred.
   - You know the user's SPECIFIC target role or industry (not vague phrases like "something different").
   - You know at least one key blocker, challenge, or concern the user has.
   - You know their preferred location or work style (remote, on-site, etc.).
   - You have confirmed any career interests using updateCareerInterests.
   - Calling this prematurely is a CRITICAL ERROR. The user has not shared enough for you to generate a meaningful plan.

After the user confirms an interest, CALL THE TOOL - don't just say you did it. NEVER say "I've updated your profile" without actually calling the updateCareerInterests tool.

## 2. THE DIAGNOSTIC ENGINE (Silently process this before EVERY response)
<thinking>
Silently analyse the following parameters:
1. User Emotional State: [e.g., Stressed, Confused, Ambitious, Defeated, Panicking]
2. Optimal Coaching Framework: Select ONE based on the emotional state:
   - [GROW]: If the user is action-oriented, forward-looking, or needs a tangible target.
   - [OSKAR]: If the user is overwhelmed by a massive problem, stuck, or facing heavy market rejection.
   - [STEPPA]: If the user expresses deep anxiety, imposter syndrome, or an emotional blockage.
3. Discrepancy Check (The Intervention Flag): Does the User's CURRENT PERSONA heavily clash with their Emotional State? (e.g., They selected a harsh Commander persona, but are experiencing severe anxiety).
   - Flag = YES or NO.
   - If YES, which of our other personas (Creative, Analyst, Commander, Sage) would be better?
</thinking>

## 3. POLITE INTERVENTION PROTOCOL (Execute ONLY if Flag = YES)
If you detect a severe clash between the user's emotional state and their chosen persona:
- Start your response by gently breaking the fourth wall to suggest a temporary persona switch.
- Speak entirely in the voice of the CURRENTLY selected persona when making this suggestion.
- Briefly explain logically why a different persona (e.g., The Sage) and framework (e.g., STEPPA) would be more efficient for their current blockage.
- Ask for permission to switch. Do NOT force it.
- Attempt to provide a brief, helpful answer to their current prompt anyway, staying in the current persona.

## 4. ACTIVE COACHING FRAMEWORK (The Engine)
Based on the <thinking> block, execute ONLY the rules for the selected framework. Ignore the others. Maintain your Persona's tone while executing these steps.

IF [GROW] IS SELECTED (Best for forward momentum):
- Do not dwell on the problem.
- Ask probing questions to define a hyper-specific Goal or establish current Reality.
- Push the user to generate Options.

IF [OSKAR] IS SELECTED (Best for overwhelm and feeling stuck):
- Refuse to dissect the size of the problem or the bad economy.
- Pivot immediately to 'Know-how': Ask the user about past successes, existing skills, and what is *currently* working.
- Focus purely on solutions and resourcefulness.

IF [STEPPA] IS SELECTED (Best for anxiety, fear, or imposter syndrome):
- Suspend all action-planning and goal-setting.
- Address the 'Emotion' and 'Perception' directly.
- Challenge limiting beliefs before ever asking "what are your next steps?"

## 5. GENERAL COMMUNICATION GUIDELINES
- Question, Don't Lecture: Ask 1-2 thoughtful questions at a time.
- Be Human: Use contractions, casual language, occasional humour.
- Concise Responses: Keep responses to 2-4 sentences.
- Empathetic First: Acknowledge feelings before giving advice.

## 6. RULE HIERARCHY (CRITICAL)
If the "General Communication Guidelines" contradict your "CURRENT PERSONA", the Persona ALWAYS wins. (e.g., If the Persona says "Never use emotional language," you must ignore the "Empathetic First" general guideline).`;

// ============== DYNAMIC SYSTEM PROMPT GENERATION ==============

/**
 * Generate the complete system prompt with persona injection and user dossier
 */
function generateSystemPrompt(
    personality: CoachPersonality = 'mix',
    dossier?: UserDossier
): string {
    // Get the high-fidelity persona definition
    const personaDef: PersonaDefinition = getPersonaDefinition(personality);
    const personaPrompt = formatPersonaPrompt(personaDef);

    // Build the dossier section if we have user data
    let dossierSection = '';
    if (dossier) {
        dossierSection = `
## USER DOSSIER (The person you are coaching)
Name: ${dossier.name}
${dossier.age ? `Age: ${dossier.age}` : ''}
${dossier.currentStatus ? `Current Status: ${dossier.currentStatus}` : ''}
${dossier.locationPreference?.length ? `Target Locations: ${dossier.locationPreference.join(', ')}` : ''}
${dossier.goal ? `Primary Goal: ${dossier.goal}` : ''}

### Resume Summary
${JSON.stringify(dossier.resume, null, 2)}
`;
    }

    return `${personaPrompt}

${BASE_SYSTEM_PROMPT}
${dossierSection}

## CRITICAL INSTRUCTION
Address the user naturally. Use their name (${dossier?.name || 'Friend'}) occasionally to build rapport, but DO NOT start every message with it. Never use it more than once in a single turn. Stick strictly to your persona voice and never break character.`;
}


// ============== FUNCTION CALLING (TOOLS) ==============

// Tool declarations for Gemini Function Calling
const CAREER_COACH_TOOLS: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "updateCareerInterests",
                description: "Updates the user's career interests in their profile. Call this when the user confirms industries or job titles they're interested in.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        industries: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING },
                            description: "Target industries the user is interested in (e.g., 'Technology', 'Healthcare', 'Finance', 'Fintech')"
                        },
                        job_titles: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING },
                            description: "Job titles or roles the user is interested in (e.g., 'Product Manager', 'Software Engineer', 'Data Scientist')"
                        }
                    },
                    required: []
                }
            },
            {
                name: "offerStrategicReport",
                description: "Offers to generate a strategic career report. ONLY call this after: (1) minimum 10 meaningful back-and-forth exchanges, (2) knowing the user's specific target role/industry, (3) understanding at least one key blocker or challenge, (4) knowing their preferred location or work style. Calling this too early RUINS the experience.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        summary: {
                            type: SchemaType.STRING,
                            description: "A brief summary of what you've learned about the user to include in the report"
                        }
                    },
                    required: ["summary"]
                }
            }
        ]
    }
];

// Callback types for tool execution results
export interface ToolCallResult {
    toolName: string;
    success: boolean;
    data?: {
        industries?: string[];
        job_titles?: string[];
        summary?: string;
    };
    message?: string;
}

export type OnToolCallCallback = (result: ToolCallResult) => void;

// Store the callback for tool calls
let toolCallCallback: OnToolCallCallback | null = null;

export function setToolCallCallback(callback: OnToolCallCallback | null) {
    toolCallCallback = callback;
}

let chatSession: ChatSession | null = null;
let chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

// Helper function to generate profile context for AI
function generateProfileContext(profile?: UserProfileContext): string {
    if (!profile) return '';

    const sections: string[] = [];

    // Basic info
    if (profile.status) {
        sections.push(`Current Status: ${profile.status}`);
    }
    if (profile.age) {
        sections.push(`Age: ${profile.age}`);
    }
    if (profile.countries && profile.countries.length > 0) {
        sections.push(`Looking to work in: ${profile.countries.join(', ')}`);
    }

    // Education
    if (profile.education && profile.education.length > 0) {
        const eduStr = profile.education
            .filter(e => e.university || e.degree)
            .map(e => `${e.degree || 'Degree'} in ${e.major || 'unspecified'} from ${e.university}${e.endDate ? ` (${e.endDate})` : ''}`)
            .join('; ');
        if (eduStr) sections.push(`Education: ${eduStr}`);
    }

    // Work experience
    if (profile.work && profile.work.length > 0) {
        const workStr = profile.work
            .filter(w => w.company || w.role)
            .map(w => `${w.role || 'Role'} at ${w.company}${w.startDate ? ` (${w.startDate}-${w.endDate || 'Present'})` : ''}`)
            .join('; ');
        if (workStr) sections.push(`Work Experience: ${workStr}`);
    }

    // Community/Volunteer
    if (profile.community && profile.community.length > 0) {
        const commStr = profile.community
            .filter(c => c.organization || c.role)
            .map(c => `${c.role || 'Volunteer'} at ${c.organization}`)
            .join('; ');
        if (commStr) sections.push(`Community & Leadership: ${commStr}`);
    }

    // Technical skills
    if (profile.technicalSkills && profile.technicalSkills.length > 0) {
        const techStr = profile.technicalSkills
            .filter(s => s.name)
            .map(s => `${s.name} (${s.level})`)
            .join(', ');
        if (techStr) sections.push(`Technical Skills: ${techStr}`);
    }

    // Personal skills
    if (profile.personalSkills && profile.personalSkills.length > 0) {
        const persStr = profile.personalSkills
            .filter(s => s.name)
            .map(s => s.name)
            .join(', ');
        if (persStr) sections.push(`Personal Skills: ${persStr}`);
    }

    // Languages
    if (profile.languages && profile.languages.length > 0) {
        const langStr = profile.languages
            .filter(l => l.language)
            .map(l => `${l.language} (${l.proficiency})`)
            .join(', ');
        if (langStr) sections.push(`Languages: ${langStr}`);
    }

    // Career interests
    if (profile.interests) {
        if (profile.interests.industries && profile.interests.industries.length > 0) {
            sections.push(`Target Industries: ${profile.interests.industries.join(', ')}`);
        }
        if (profile.interests.jobTitles && profile.interests.jobTitles.length > 0) {
            sections.push(`Target Roles: ${profile.interests.jobTitles.join(', ')}`);
        }
    }

    // Projects
    if (profile.projects && profile.projects.length > 0) {
        const projStr = profile.projects
            .filter(p => p.title)
            .map(p => p.title)
            .join(', ');
        if (projStr) sections.push(`Projects: ${projStr}`);
    }

    return sections.length > 0 ? '\n\nUSER PROFILE:\n' + sections.join('\n') : '';
}

// Type for profile context (simplified to avoid circular imports)
interface UserProfileContext {
    preferredName?: string;  // How user wants to be addressed
    status?: string;
    age?: string;
    countries?: string[];
    education?: Array<{ university: string; degree: string; major: string; startDate?: string; endDate?: string }>;
    work?: Array<{ company: string; role: string; startDate?: string; endDate?: string }>;
    community?: Array<{ organization: string; role: string }>;
    technicalSkills?: Array<{ name: string; level: string }>;
    personalSkills?: Array<{ name: string }>;
    languages?: Array<{ language: string; proficiency: string }>;
    interests?: { industries?: string[]; jobTitles?: string[] };
    projects?: Array<{ title: string }>;
}

export async function initializeChat(
    userName: string,
    userProfile?: UserProfileContext,
    personality: CoachPersonality = 'mix'
): Promise<string> {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }

    try {
        // Configure model with function calling tools
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            tools: CAREER_COACH_TOOLS,
        });

        // Add system instruction as first message in history
        chatHistory = [];

        chatSession = model.startChat({
            history: chatHistory,
        });

        // Generate profile context
        const profileContext = generateProfileContext(userProfile);

        // Use preferred name if available, otherwise fall back to first name
        const firstPart = userName.split(' ')[0];
        const displayName = userProfile?.preferredName || firstPart;

        // Check if user has career interests filled in
        const hasCareerInterests = userProfile?.interests &&
            ((userProfile.interests.industries?.length || 0) > 0 ||
                (userProfile.interests.jobTitles?.length || 0) > 0);

        // Build user dossier for context injection
        const userDossier = buildUserDossier(userName, userProfile);

        // Generate dynamic system prompt with persona and dossier
        const systemPrompt = generateSystemPrompt(personality, userDossier);

        // Generate initial greeting by sending a hidden context message
        const contextPrompt = `${systemPrompt}

The user's name is ${userName}. ${userProfile?.preferredName ? `They prefer to be called "${displayName}".` : ''}
${profileContext}
${!hasCareerInterests ? '\nNOTE: The user has not filled in their Career Interests yet. During the conversation, proactively suggest adding relevant interests to their profile using the updateCareerInterests tool.' : ''}

Generate a warm, personalized greeting (2-3 sentences max) that:
1. Greets them naturally (you can use their name "${displayName}" if it feels right, but don't force it at the start)
2. Acknowledges something specific from their background if available
3. Leads naturally into your coaching role.

Don't list their profile. Be natural and conversational.`;

        const result = await chatSession.sendMessage(contextPrompt);
        const greeting = result.response.text();

        // Store the exchange in history for context
        chatHistory.push(
            { role: 'user', parts: [{ text: contextPrompt }] },
            { role: 'model', parts: [{ text: greeting }] }
        );

        return greeting;
    } catch (error) {
        console.error('Gemini chat initialization error:', error);
        throw error;
    }
}

export async function sendChatMessage(message: string): Promise<string> {
    if (!chatSession) {
        // Attempt one-time silent re-initialization if we have history
        if (chatHistory.length > 0) {
            console.warn('[Gemini] Chat session lost but history exists. Re-initializing...');
        }
        throw new Error('AI session was interrupted. Please try re-sending or refresh if it persists.');
    }

    try {
        const result = await chatSession.sendMessage(message);
        console.log('[Gemini] Received response:', result);
        const response = result.response;

        // Check if the model wants to call a function
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            console.log('[Gemini] Function calls detected:', functionCalls);

            // Process each function call
            for (const call of functionCalls) {
                const { name, args } = call;
                console.log(`[Gemini] Executing tool: ${name}`, args);

                // Cast args to access properties
                const argsObj = args as Record<string, unknown> | undefined;

                // Execute callback if registered
                if (toolCallCallback) {
                    if (name === 'updateCareerInterests') {
                        toolCallCallback({
                            toolName: name,
                            success: true,
                            data: {
                                industries: (argsObj?.industries as string[]) || [],
                                job_titles: (argsObj?.job_titles as string[]) || []
                            },
                            message: 'Career interests updated successfully'
                        });
                    } else if (name === 'offerStrategicReport') {
                        toolCallCallback({
                            toolName: name,
                            success: true,
                            data: {
                                summary: (argsObj?.summary as string) || ''
                            },
                            message: 'Report generation triggered'
                        });
                    }
                }

                // Send function response back to model so it can continue
                const functionResponse = await chatSession.sendMessage([{
                    functionResponse: {
                        name,
                        response: { success: true, message: `${name} executed successfully` }
                    }
                }]);

                const textResponse = functionResponse.response.text();

                // Update history with the full exchange
                chatHistory.push(
                    { role: 'user', parts: [{ text: message }] },
                    { role: 'model', parts: [{ text: textResponse }] }
                );

                return textResponse;
            }
        }

        // No function calls - just get text response
        const textResponse = response.text();

        // Update history
        chatHistory.push(
            { role: 'user', parts: [{ text: message }] },
            { role: 'model', parts: [{ text: textResponse }] }
        );

        return textResponse;
    } catch (error: any) {
        console.error('Gemini chat error details:', error);
        if (error.response) {
            console.error('Gemini error response:', JSON.stringify(error.response, null, 2));
        }
        throw error;
    }
}

export async function parseResumeWithAI(resumeText: string): Promise<{
    name?: string;
    preferredName?: string;
    status?: string;
    education: Array<{ university: string; degree: string; major: string; startDate?: string; endDate?: string }>;
    work: Array<{ company: string; role: string; description: string; startDate?: string; endDate?: string }>;
    community: Array<{ organization: string; role: string; description: string; startDate?: string; endDate?: string }>;
    technicalSkills: Array<{ name: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>;
    personalSkills: Array<{ name: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>;
    languages: Array<{ language: string; proficiency: 'basic' | 'conversational' | 'professional' | 'native' }>;
    website?: string;
}> {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `Analyze the following resume text. Return ONLY a valid JSON object. Do not include markdown formatting, code blocks, or explanations. 

Resume text:
${resumeText}

STRICT JSON OUTPUT REQUIRED.
Required Fields & Rules:
1. "fullName": string (Exclusively the candidate's full name)
2. "preferredName": string | null (If explicitly mentioned in quotes or parentheses, e.g. "Jonathan (Jon)", extract "Jon". Otherwise null)
3. "currentStatus": string (MUST be one of: 'Student', 'Fresh Graduate', 'Career Switcher', 'Unemployed')
   - RULE: If graduated within the last 2 years (based on Education endDate) AND has no current full-time role, classify as "Fresh Graduate".
   - RULE: If currently enrolled in a degree program, classify as "Student".
4. "education": array of objects { institution, degree, yearStart, yearEnd (use "Present" if current) }
5. "experience": array of objects { company, role, yearStart, yearEnd, description }
   - Include ONLY paid professional experience.
6. "skills": array of strings (Extract technical and hard skills)

Return this EXACT JSON structure:
{
    "fullName": "...",
    "preferredName": "...", 
    "currentStatus": "...",
    "education": [ { "institution": "...", "degree": "...", "yearStart": "...", "yearEnd": "..." } ],
    "experience": [ { "company": "...", "role": "...", "yearStart": "...", "yearEnd": "...", "description": "..." } ],
    "skills": ["...", "..."],
    "personalSkills": ["...", "..."],
    "community": [ { "organization": "...", "role": "...", "description": "...", "yearStart": "...", "yearEnd": "..." } ], 
    "languages": [ { "language": "...", "proficiency": "..." } ],
    "website": "..."
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response (in case it includes markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse resume: No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure all arrays exist with defaults
        return {
            name: parsed.fullName || '',
            preferredName: parsed.preferredName || '',
            status: parsed.currentStatus,
            education: parsed.education?.map((e: any) => ({
                university: e.institution,
                degree: e.degree,
                major: 'Major', // Default since prompt doesn't explicitly ask for major separately in new strict mode, or we can ask prompts to split it
                startDate: e.yearStart,
                endDate: e.yearEnd
            })) || [],
            work: parsed.experience?.map((w: any) => ({
                company: w.company,
                role: w.role,
                description: w.description,
                startDate: w.yearStart,
                endDate: w.yearEnd
            })) || [],
            community: parsed.community?.map((c: any) => ({
                organization: c.organization,
                role: c.role,
                description: c.description,
                startDate: c.yearStart,
                endDate: c.yearEnd
            })) || [],
            technicalSkills: parsed.skills?.map((s: string) => ({
                name: s,
                level: 'intermediate'
            })) || [],
            personalSkills: parsed.personalSkills?.map((s: string) => ({
                name: s,
                level: 'intermediate'
            })) || [],
            languages: parsed.languages?.map((l: any) => ({
                language: l.language,
                proficiency: l.proficiency
            })) || [],
            website: parsed.website || '',
        };
    } catch (error) {
        console.error('Resume parsing error:', error);
        throw error;
    }
}

export function isGeminiConfigured(): boolean {
    return !!genAI;
}

export function isChatInitialized(): boolean {
    return !!chatSession;
}

/**
 * Silently re-initializes a chat session without sending a new greeting.
 * Useful for recovering state after HMR or page reloads if history is available.
 */
export async function reinitializeChatSession(
    userName: string,
    userProfile: UserProfileContext | undefined,
    existingMessages: ChatMessage[],
    personality: CoachPersonality = 'mix'
): Promise<void> {
    if (!genAI) return;

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        tools: CAREER_COACH_TOOLS,
    });

    const userDossier = buildUserDossier(userName, userProfile);
    const systemPrompt = generateSystemPrompt(personality, userDossier);
    const profileContext = generateProfileContext(userProfile);

    // Reconstruct history structure from UI messages
    if (chatHistory.length === 0 && existingMessages.length > 0) {
        console.log('[Gemini] Reconstructing history from', existingMessages.length, 'messages');
        
        // 1. Add the heavy system context as the first 'user' message
        const displayName = userProfile?.preferredName || userName.split(' ')[0];
        
        const contextPrompt = `${systemPrompt}

The user's name is ${userName}. ${userProfile?.preferredName ? `They prefer to be called "${displayName}".` : ''}
${profileContext}

Continue the conversation naturally. The user has already seen your greeting.`;

        chatHistory = [{ role: 'user', parts: [{ text: contextPrompt }] }];

        // 2. Map existing messages to history
        existingMessages.forEach(msg => {
            chatHistory.push({
                role: msg.sender === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        });
    }

    chatSession = model.startChat({
        history: chatHistory,
    });

    console.log('[Gemini] Chat session re-initialized with history length:', chatHistory.length);
}

export function getAPIKeyStatus(): string {
    if (!API_KEY) {
        return 'No API key configured';
    }
    return `API key loaded (${API_KEY.substring(0, 10)}...)`;
}
