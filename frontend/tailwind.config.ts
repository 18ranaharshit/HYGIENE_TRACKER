import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#14b8a6',  // teal-500
          300: '#5eead4',
          400: '#2dd4bf',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Backgrounds
        bg: {
          DEFAULT: '#0b1326',  // darkest slate
          dim: '#0f1a30',
        },
        // Surface layers
        surface: {
          DEFAULT: '#131c35',
          high: '#1a2440',
          highest: '#2d3449',
          bright: '#3d4a6a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(20, 184, 166, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(20,184,166,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(20,184,166,0.7)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
