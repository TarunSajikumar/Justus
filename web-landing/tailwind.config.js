/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'Inter', 'sans-serif'],
      },
      colors: {
        rose: {
          DEFAULT: '#C9A96E',
          deep: '#A8865A',
          bright: '#E0C080',
        },
        blush: '#EDD9B4',
        petal: '#F7EFE0',
        cream: '#F8F6F2',
        night: '#0C0C0E',
        'night-light': '#161618',
        ember: '#1E1C18',
        gold: {
          DEFAULT: '#B8914A',
          light: '#D4A85C',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        float: 'floatGlide 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'pill-glow': 'pillGlow 3s infinite alternate',
        'scroll-left': 'scrollLeft 32s linear infinite',
      },
      keyframes: {
        floatGlide: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-0.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)', boxShadow: '0 0 0 transparent' },
          '50%': { opacity: '1', transform: 'scale(1.25)', boxShadow: '0 0 8px #C9A96E' },
        },
        pillGlow: {
          from: { boxShadow: '0 0 0 transparent' },
          to: { boxShadow: '0 0 14px rgba(201,169,110,0.2)' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
