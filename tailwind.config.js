/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#050814',
          navy: '#0B1B55',
          'navy-deep': '#060F33',
          'navy-light': '#142A7C',
          'navy-hover': '#0E226A',
          orange: '#FF9800',
          'orange-hover': '#F57C00',
          'orange-light': '#FFF3E0',
          'orange-glow': 'rgba(255, 152, 0, 0.25)',
          white: '#FFFFFF',
          'light-bg': '#F5F7FB',
          'light-card': '#FFFFFF',
          'light-border': '#E2E8F0',
          'light-hover': '#F1F5F9',
          'text-dark': '#0F172A',
          'text-muted': '#64748B',
          'text-light': '#94A3B8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'brand-card': '0 2px 6px 0 rgba(11, 27, 85, 0.04), 0 1px 3px -1px rgba(11, 27, 85, 0.04)',
        'brand-card-hover': '0 10px 25px -5px rgba(11, 27, 85, 0.08), 0 8px 10px -6px rgba(11, 27, 85, 0.05)',
        'brand-glow': '0 0 20px rgba(255, 152, 0, 0.35)',
        'brand-navy-glow': '0 0 25px rgba(11, 27, 85, 0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(0.8deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-0.8deg)' },
        },
        'gradient-text': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
        'blob': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(25px, -35px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.94)' },
        },
      },
      animation: {
        'float': 'float 3.5s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 5s ease-in-out infinite',
        'gradient-text': 'gradient-text 4s ease infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'blob': 'blob 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
