/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                slate: {
                    950: '#020617',
                },
                brand: {
                    green: {
                        light: '#86efac',
                        DEFAULT: '#4b7c5b',
                        dark: '#2d4a36',
                    },
                    purple: {
                        light: '#c4b5fd',
                        DEFAULT: '#8b5cf6',
                        dark: '#6d28d9',
                    },
                    indigo: {
                        light: '#a5b4fc',
                        DEFAULT: '#6366f1',
                        dark: '#4f46e5',
                    }
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            boxShadow: {
                'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
                'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.5)',
            }
        },
    },
    plugins: [],
}
