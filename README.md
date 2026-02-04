# pAlve - AI Career Strategy Agent

A gamified, immersive React application for AI-driven career coaching. Built with an engaging "Ready Player One" style experience.

## Features

✨ **Immersive Onboarding**
- Customizable AI Coach selection with 5 avatar personalities
- Smooth animated transitions between screens
- Conversational data collection (Name → Age → Location)

💬 **Interactive Chat Interface**
- Typewriter text effect for AI responses
- Quick reply chips for easy interaction
- Real-time typing indicators
- Session progress tracking with glowing lightbulb

📄 **Profile Management**
- Drag-and-drop CV upload
- Form-based profile editing
- Persistent user data

🎨 **Premium Design**
- Modern Inter typography
- Gradient cards with depth
- Glass-morphism effects
- Framer Motion animations throughout

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icons

## Getting Started

1. **Install dependencies:**
   ```bash
   cd palve
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── TypewriterText.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── QuickReplyChips.tsx
│   │   ├── FloatingInputBar.tsx
│   │   ├── AvatarStage.tsx
│   │   ├── ResumeDropzone.tsx
│   │   └── BottomNav.tsx
│   └── chat/         # Chat-specific components
│       └── MessageBubble.tsx
├── screens/          # Main screen components
│   ├── WelcomeScreen.tsx
│   ├── CoachSelectionScreen.tsx
│   ├── DataAcquisitionScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ChatScreen.tsx
├── hooks/            # Custom React hooks
│   └── useTypewriter.ts
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## User Flow

1. **Welcome** → Choose to customize AI Coach or skip
2. **Coach Selection** → Pick from 5 avatar personalities
3. **Data Acquisition** → Conversational Q&A (Name, Age, Location)
4. **Profile** → Upload CV and complete profile
5. **Chat** → Interactive session with AI Coach

## Customization

The app uses Tailwind CSS with custom theme tokens in `tailwind.config.js`:
- Custom colors for brand identity
- Glow and float animations
- Premium shadow effects

---

Built with 💜 for career seekers everywhere.
