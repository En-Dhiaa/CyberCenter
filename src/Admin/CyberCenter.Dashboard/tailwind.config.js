/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#07090E',
          deep: '#0E131F',
          card: '#141C2E',
          cardHover: '#1B253D',
          border: '#253350',
          borderLight: '#334366',
          emerald: '#10B981',
          cyan: '#06B6D4',
          crimson: '#EF4444',
          gold: '#F59E0B',
          violet: '#8B5CF6',
          textMain: '#F8FAFC',
          textMuted: '#94A3B8',
          textDark: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Cairo', 'IBM Plex Sans Arabic', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'glow-crimson': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
};

