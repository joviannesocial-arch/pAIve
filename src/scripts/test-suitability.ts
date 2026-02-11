
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash';

async function testSuitabilityTool() {
    console.log('Testing analyzeCareerFit logic directly...');

    if (!API_KEY) {
        console.error('❌ VITE_GEMINI_API_KEY is missing');
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const targetRole = "Senior React Developer";
    const userSkills = "Proficient in JavaScript, HTML, CSS. 3 years experience with React. Familiar with Redux and Node.js. Good communicator.";

    console.log(`\nAnalyzing fit for: ${targetRole}`);
    console.log(`User Skills: ${userSkills}\n`);

    const prompt = `
    Analyze the career fit for the role of "${targetRole}" based on the following user skills/context: "${userSkills}".

    Return a JSON object with this exact structure:
    {
        "matchScore": number (0-100),
        "missingSkills": string[],
        "strength": string,
        "culturalFit": string
    }
    
    Return ONLY the JSON object.
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log('Raw Response:', responseText);

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log('\n✅ Parsed Analysis:', JSON.stringify(analysis, null, 2));

            if (analysis.matchScore && analysis.missingSkills) {
                console.log('\n✅ Verification Passed: structure matches requirements.');
            } else {
                console.error('\n❌ Verification Failed: missing required fields.');
            }
        } else {
            console.error('\n❌ Failed to extract JSON from response.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSuitabilityTool();
