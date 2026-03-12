import { parseResumeWithAI } from './src/utils/geminiService.js';

const mockResume = `
Jovanne Doe
Software Engineer
Student at National University of Singapore

Experience:
- Intern at Tech Corp (May 2023 - Present)
  Developed web apps using React.

Education:
- Bachelor of Computing, NUS (Aug 2021 - Present)

Community & Leadership:
- President, Tech Club (Aug 2022 - May 2023)
  Organized hackathons.

Technical Skills:
- TypeScript, React, Node.js

Personal Skills:
- Public Speaking, Leadership, Teamwork
`;

async function run() {
  console.log('Testing resume parsing...');
  try {
    const result = await parseResumeWithAI(mockResume);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
