# Using pAlve with PhpStorm / WebStorm

This project is a standard React + Vite application and works perfectly with JetBrains IDEs like PhpStorm, WebStorm, or IntelliJ IDEA Ultimate.

## Setup Instructions

1.  **Open Project**:
    - Launch PhpStorm.
    - Click **Open** and select the `/Users/jovanne/.gemini/antigravity/scratch/palve` folder.

2.  **Install Dependencies**:
    - Open the **Terminal** tool window (usually at the bottom).
    - Run `npm install` (or right-click `package.json` -> **Run 'npm install'**).

3.  **Running the App**:
    - Open `package.json`.
    - Click the green play icon (▶) next to the `"dev"` script in the `scripts` section.
    - OR use the Terminal: `npm run dev`.

4.  **Formatting**:
    - PhpStorm automatically detects code style.
    - To reformat a file, press `Option + Command + L` (macOS).

## Recommended Plugins
- **Tailwind CSS**: Pre-installed in newer versions. Ensure it's enabled in Settings -> Plugins.
- **Prettier**: Use `Option + Shift + Command + P` if you have it configured (optional).

## Troubleshooting
- If TypeScript errors aren't showing up, ensure the **TypeScript** service is enabled in **Settings -> Languages & Frameworks -> TypeScript**.
