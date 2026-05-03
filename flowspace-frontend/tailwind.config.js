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
        primary: '#00d4ff',
        'accent-cyan': '#00d4ff',
        'accent-blue': '#0077ff',
        'accent-amber': '#fb923c',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        'text-primary': '#1f2937',
        'text-secondary': '#4b5563',
        'text-muted': '#9ca3af',
        'bg-primary': '#ffffff',
        'bg-surface': '#f9fafb',
        'bg-hover': '#f3f4f6',
        'border-color': '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 20s infinite ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
