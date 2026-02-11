
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to get environment variables in both Vite and Node environments
const getEnvVar = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key] || import.meta.env[`VITE_${key}`];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || process.env[`VITE_${key}`];
    }
    return undefined;
};

const TAVILY_KEY = getEnvVar('TAVILY_API_KEY');
const GEMINI_KEY = getEnvVar('GEMINI_API_KEY');

if (!TAVILY_KEY) {
    console.warn("Missing TAVILY_API_KEY (or VITE_TAVILY_API_KEY). Search may fail.");
}

if (!GEMINI_KEY) {
    console.warn("Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY). Analysis may fail.");
}

// Initialize clients
// Note: We create instances lazily or check inside the function to avoid init errors if keys are missing at module load time in some envs
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

// Helper for exponential backoff retries
async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 1000,
    backoffFactor = 2
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        // Retry on 429 (Too Many Requests) or 503 (Service Unavailable)
        if (retries > 0 && (error.message?.includes('429') || error.message?.includes('503'))) {
            console.warn(`[DeepDive] Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(operation, retries - 1, delay * backoffFactor, backoffFactor);
        }
        throw error;
    }
}

export async function generateDeepDive(query: string) {
    if (!TAVILY_KEY) throw new Error("Tavily API key is missing.");
    if (!genAI) throw new Error("Gemini API key is missing.");

    try {
        // 1. Search with Tavily (using fetch directly to avoid SDK browser issues)
        console.log(`[DeepDive] Searching for: ${query}`);

        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: TAVILY_KEY,
                query: query,
                include_answer: true,
                max_results: 5
            })
        });

        if (!tavilyResponse.ok) {
            throw new Error(`Tavily API error: ${tavilyResponse.statusText}`);
        }

        const searchResult = await tavilyResponse.json();

        // 2. Prepare context for Gemini
        const searchContext = JSON.stringify(searchResult, null, 2);

        // 3. Generate Report with Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    You are a Senior Corporate Intelligence Analyst & Career Strategist.
    Your goal is to arm the user with "Insider Knowledge" to ace a job interview.
    You do not just summarize; you uncover the "Hard Data" and "Hidden Patterns" that generic candidates miss.

    **INPUT:** User Query: "${query}"

    **STEP 1: CLASSIFY INTENT**
    First, determine if the user is asking about a specific **COMPANY** (e.g., "Google", "DBS") or a general **ROLE/INDUSTRY** (e.g., "UX Design", "Fintech").

    ---

    **STEP 2: EXECUTE DEEP RESEARCH STRATEGY**
    
    **REAL-TIME DATA (from Tavily Search):**
    ${searchContext}

    **OPTION A: IF COMPANY TARGET (The "Interviewer-Ready" Dossier)**
    Conduct a forensic analysis of these 8 Strategic Pillars. You MUST cite data.
    1.  **Company Overview:** Mission, Values, & Business Model (How do they *actually* make money?).
    2.  **Financial Health (The Hard Data):** Market Cap, Revenue, Profitability, and key ratios (**ROE/ROA**) if public. Check debt levels.
    3.  **Leadership Structure:** Who is the CEO/CFO? Any recent executive shake-ups?
    4.  **Growth & Strategy (The North Star):** What is their one big focus for 2026? (e.g., AI pivots, new markets).
    5.  **The "Atlassian" Pain Point Analysis:**
        * *Identify:* What are they struggling with? (Read between the lines of news/earnings).
        * *The Pitch:* Based on this pain, suggest a specific **Project Idea** the user could propose to solve it (e.g., "They struggle with mobile retention -> Pitch a 'Mobile Audit'").
    6.  **Recent News & Sentiment:** Headlines, legal issues, or market sentiment (The "Watercooler" talk).
    7.  **Competitors:** Who are they fighting? What is their competitive moat?
    8.  **Public Filings:** Key takeaways from the latest Earnings Call (10-K/10-Q).

    **OPTION B: IF ROLE/INDUSTRY (The "Market Pulse" Report)**
    1.  **Market Pulse:** Is demand Growing or Shrinking? (Include specific % growth stats).
    2.  **Salary Benchmarks:** Create a table for **Junior vs. Mid vs. Senior** salaries (Specific to the user's location if known).
    3.  **Pattern Recognition (The "Unwritten Rules"):**
        * *Keywords:* What 3-5 specific skills appear in *every* job description right now?
        * *Reality Check:* What do hiring managers want but don't say? (e.g., "For PMs, they say 'Strategy' but they really want 'SQL'").
    4.  **Growth Clusters:** Which specific industries are hiring this role most? (e.g., "Fintech is slowing, Healthtech is booming").
    5.  **Hidden Risks:** Automation threats, saturation warnings, or layoff trends.

    ---

    **STEP 3: GENERATE REPORT (Markdown)**
    * **Tone:** Professional, Strategic, "Insider".
    * **Structure:** Use **Bold Headers** (\`###\`) and **Bullet Points**.
    * **Constraint:** You MUST cite your sources (e.g., [Source]).
    * **Length:** Comprehensive (approx. 500-600 words).

    **CRITICAL ENDING:**
    End with a "Strategic Angle" section:
    *"Based on this research, here is a killer question you can ask in the interview..."*
    `;

        console.log(`[DeepDive] Generating analysis with Gemini...`);
        const result = await retryWithBackoff(() => model.generateContent(prompt));
        const response = await result.response;
        const text = response.text();

        return text;

    } catch (error) {
        console.error("Error in generateDeepDive:", error);
        throw error;
    }
}
