
import dotenv from 'dotenv';
import { generateDeepDive } from '../actions/generateDeepDive';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testDeepDive() {
    console.log('Testing generateDeepDive action...');

    // Check API Keys
    const geminiKey = process.env.VITE_GEMINI_API_KEY;
    const tavilyKey = process.env.VITE_TAVILY_API_KEY;

    if (!geminiKey) console.error('❌ VITE_GEMINI_API_KEY is missing');
    if (!tavilyKey) console.error('❌ VITE_TAVILY_API_KEY is missing');

    if (!geminiKey || !tavilyKey) {
        console.error('Please ensure .env file has both keys.');
        return;
    }

    try {
        const query = "Future of Frontend Development 2025 salary";
        console.log(`\n🔍 Searching and Analyzing for: "${query}"...\n`);

        const report = await generateDeepDive(query);

        console.log('\n✅ Report Generated Successfully:\n');
        console.log('---------------------------------------------------');
        console.log(report);
        console.log('---------------------------------------------------');

    } catch (error) {
        console.error('\n❌ Error during deep dive test:', error);
    }
}

testDeepDive();
