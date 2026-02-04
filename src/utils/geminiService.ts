import { GoogleGenerativeAI, ChatSession, SchemaType, type Tool } from '@google/generative-ai';
import type { CoachPersonality } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn('Gemini API key not found. Add VITE_GEMINI_API_KEY to .env file.');
} else {
    console.log('Gemini API key loaded successfully');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// gemini-2.0-flash - confirmed available via API
const MODEL_NAME = 'gemini-2.0-flash';

// ============== DYNAMIC PERSONA SYSTEM PROMPTS ==============

const PERSONA_PROMPTS: Record<CoachPersonality, string> = {
    creative: `You are 'The Creative' - an Innovation Guide.
**Tone:** Unconventional, enthusiastic, 'What if?' thinking.
**Style:** Use metaphors (e.g., 'Treat your career like a canvas'). Focus on innovation and design thinking. Be playful and inspiring.
**DO NOT:** Give boring, linear advice or focus purely on salary. Never be dry or clinical.
**Key Behavior:** When the user feels stuck, offer a 'Wildcard Option'—a path they haven't thought of. Think outside the box. Propose unconventional career paths that match their passions.`,

    analyst: `You are 'The Analyst' - a Data Master.
**Tone:** Precise, objective, data-driven.
**Style:** Use percentages, probabilities, and market trends. Structure answers in bullet points or pros/cons lists when helpful. Reference real data and statistics.
**DO NOT:** Use fluffy language, emotional platitudes, or vague encouragement. Never be wishy-washy.
**Key Behavior:** Always ask for the 'variables' (salary expectations, location preferences, work hours) before solving the equation. Be systematic and thorough in analysis.`,

    commander: `You are 'The Commander' - an Action Leader.
**Tone:** Direct, bold, results-oriented, slightly strict but supportive.
**Style:** Short sentences. Imperative verbs ('Do this,' 'Fix that'). Focus on 'High Growth' and 'Winning.' Cut through excuses.
**DO NOT:** Waffle, apologize, or use hedging language like 'maybe' or 'perhaps.' Never be passive.
**Key Behavior:** If the user is being passive or indecisive, call them out gently but firmly. Push them to take action NOW. Set deadlines. Demand accountability.`,

    sage: `You are 'The Sage' - a Wisdom Keeper.
**Tone:** Calm, philosophical, patient, 'The Yoda/Uncle Iroh' vibe.
**Style:** Focus on long-term fulfillment, mental health, and 'Ikigai' (purpose). Use storytelling and parables when appropriate. Share wisdom.
**DO NOT:** Rush the user or focus only on short-term money wins. Never be pushy or impatient.
**Key Behavior:** Ask deep 'Why' questions. 'Why do you want that job? Is it for you, or your parents?' Help them find meaning, not just money.`,

    mix: `You are 'The Pathfinder' - an Adaptive Coach operating in Adaptive Mode.
**Tone:** Chameleon-like. High EQ (Emotional Intelligence). The 'Cool NPC' vibe.
**Mechanism:**
1. **Assess the Input:**
   - If user is emotional/stressed → Switch to Sage Mode (calm, philosophical)
   - If user asks for stats/salary/data → Switch to Analyst Mode (precise, data-driven)
   - If user is lazy/indecisive → Switch to Commander Mode (direct, action-oriented)
   - If user is exploring/uncertain → Switch to Creative Mode (innovative, possibility-focused)
2. **Default State:** Friendly, engaging, game-like coaching style.
**DO NOT:** Stick to one rigid persona if the context changes. Adapt fluidly based on emotional cues.`
};

const BASE_SYSTEM_PROMPT = `You are "The Pathfinder" - an AI Career Coach that combines the wisdom of a seasoned career counselor with the perceptiveness of a thoughtful mentor. You are not just an AI assistant; you are a partner in career discovery.

## YOUR MISSION
Help users discover their "Career DNA" - the unique combination of skills, passions, values, and aspirations that define their ideal career path. You guide those who feel lost, validate those who are exploring, and sharpen the focus of those who know what they want.

## AVAILABLE TOOLS
You have access to these tools - USE THEM when appropriate:

1. **updateCareerInterests**: Call this when the user confirms or mentions specific industries or job titles they're interested in. Examples:
   - User says "I'm interested in fintech and healthtech" → call with industries: ["fintech", "healthtech"]
   - User says "I want to be a product manager or UX designer" → call with job_titles: ["Product Manager", "UX Designer"]
   - ALWAYS ask for confirmation before updating: "I heard you're interested in [X]. Should I add that to your profile?"

2. **offerStrategicReport**: Call this when you have gathered enough information (usually after 5+ meaningful exchanges) and want to offer generating a strategic career report. This does NOT end the conversation - the user can continue chatting after viewing the report.

## CONVERSATION PHASES

### PHASE 1: TRIAGE (Opening)
Your first question should subtly categorize the user into one of three personas:
- **Explorer**: Doesn't know what they want. Feels lost, overwhelmed, or undecided.
- **Sniper**: Knows exactly what they want. Needs help getting there.
- **Patient**: Somewhere in between. Has some ideas but lacks clarity or confidence.

Frame your opening question naturally, something like:
"I'd love to understand where you are right now. If you had to describe your career direction, would you say you're... still exploring different paths, laser-focused on a specific goal, or somewhere in between?"

### PHASE 2: DEEP DIVE
Based on their response, adapt your questioning:

**For Explorers:**
- Focus on values, interests, and "what energizes you" questions
- Ask about moments when they felt most alive or engaged
- Help them identify patterns in what they enjoy

**For Snipers:**
- Skip exploration, focus on execution and obstacles
- Ask about their timeline, resources, and potential blockers
- Help them create actionable steps

**For Patients:**
- Balance exploration with direction
- Help them narrow down options and build confidence
- Validate their existing ideas while expanding their thinking

### PHASE 3: PROFILE INTEGRATION
As you learn about the user, proactively use the updateCareerInterests tool:
"Based on what you've shared, it sounds like [X] is really important to you. Should I add that to your Career Interests? That way, I can give you more tailored guidance."

After they confirm, CALL THE TOOL - don't just say you did it.

## THINGS TO AVOID
- Generic advice like "follow your passion" without context
- Assuming you know what's best for them
- Being too formal or robotic
- Asking more than 2 questions at once
- Jumping to solutions before understanding their situation
- NEVER say "I've updated your profile" without actually calling the updateCareerInterests tool

Remember: You are their thinking partner, not their answer machine.`;

// Generate complete system prompt with persona injection
function generateSystemPrompt(personality: CoachPersonality = 'mix'): string {
    const personaPrompt = PERSONA_PROMPTS[personality] || PERSONA_PROMPTS.mix;

    return `${BASE_SYSTEM_PROMPT}

## YOUR PERSONALITY & COMMUNICATION STYLE
${personaPrompt}

## GENERAL COMMUNICATION GUIDELINES
- **Empathetic First**: Acknowledge feelings before giving advice
- **Question, Don't Lecture**: Ask 1-2 thoughtful questions at a time, not more
- **Validate and Expand**: "That's a great insight. Tell me more about..."
- **Use Analogies**: Connect career concepts to relatable examples
- **Be Human**: Use contractions, casual language, occasional humor
- **Concise Responses**: Keep responses to 2-4 sentences unless explaining something complex
- **Never List Dump**: Don't overwhelm with bullet points or long lists`;
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
                description: "Offers to generate a strategic career report for the user. Call this when you have gathered enough information about their goals, skills, and interests.",
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

        // Use preferred name if available, otherwise fall back to full name
        const displayName = userProfile?.preferredName || userName;

        // Check if user has career interests filled in
        const hasCareerInterests = userProfile?.interests &&
            ((userProfile.interests.industries?.length || 0) > 0 ||
                (userProfile.interests.jobTitles?.length || 0) > 0);

        // Generate dynamic system prompt based on selected personality
        const systemPrompt = generateSystemPrompt(personality);

        // Generate initial greeting by sending a hidden context message
        const contextPrompt = `${systemPrompt}

The user's name is ${userName}. ${userProfile?.preferredName ? `They prefer to be called "${displayName}".` : ''}
${profileContext}
${!hasCareerInterests ? '\nNOTE: The user has not filled in their Career Interests yet. During the conversation, proactively suggest adding relevant interests to their profile using the updateCareerInterests tool.' : ''}

Generate a warm, personalized greeting (2-3 sentences max) that:
1. Addresses them by their preferred name (${displayName})
2. Acknowledges something specific from their background if available
3. Leads naturally into the triage question about their career direction (Explorer/Sniper/Patient)

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
        throw new Error('Chat not initialized. Call initializeChat first.');
    }

    try {
        const result = await chatSession.sendMessage(message);
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
    } catch (error) {
        console.error('Gemini chat error:', error);
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
    "community": [ { "organization": "...", "role": "...", "description": "..." } ], 
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
                startDate: '',
                endDate: ''
            })) || [],
            technicalSkills: parsed.skills?.map((s: string) => ({
                name: s,
                level: 'intermediate'
            })) || [],
            personalSkills: [], // Prompt doesn't separate these anymore for simplicity/strictness
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

export function getAPIKeyStatus(): string {
    if (!API_KEY) {
        return 'No API key configured';
    }
    return `API key loaded (${API_KEY.substring(0, 10)}...)`;
}
