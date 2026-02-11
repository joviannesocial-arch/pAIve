
import { tavily } from "@tavily/core";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming the script is in src/scripts, .env is in the root (two levels up)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Get API key from environment variables
const apiKey = process.env.TAVILY_API_KEY;

if (!apiKey) {
    console.error("Error: TAVILY_API_KEY is not set in the environment.");
    process.exit(1);
}

// Initialize the Tavily client
const tvly = tavily({ apiKey });

async function testTavily() {
    console.log("Testing Tavily API connection...");
    console.log("Query: 'Latest trends in UX Design 2026'");

    try {
        const response = await tvly.search("Latest trends in UX Design 2026", {
            includeAnswer: true,
            maxResults: 3,
        });

        console.log("\n--- Search Results ---");
        console.log(JSON.stringify(response, null, 2));
        console.log("\n--- End of Results ---");
        console.log("✅ Tavily API connection successful!");
    } catch (error) {
        console.error("\n❌ Error connecting to Tavily API:", error);
    }
}

testTavily();
