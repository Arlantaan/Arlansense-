/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sensation-gold': '#e6c98a',
        'sensation-dark-gold': '#bfa76a',
        'sensation-dark': '#23201c',
        'sensation-bg': '#f9f9f9',
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Tahoma', 'sans-serif'],
      },
      animation: {
        'typewriter': 'typewriterCenterOut 3s ease-out forwards',
        'blink': 'blinkCursor 1s infinite',
        'float': 'floatToCart 1.2s cubic-bezier(0.23, 1, 0.320, 1) forwards',
        'ripple': 'rippleAnimation 0.6s ease-out',
        'pulse': 'pulse 2s infinite',
        'slideInRight': 'slideInRight 0.4s ease',
        'slideOutRight': 'slideOutRight 0.4s ease forwards',
      },
      keyframes: {
        typewriterCenterOut: {
          '0%': { clipPath: 'inset(0 50% 0 50%)' },
          '100%': { clipPath: 'inset(0 0% 0 0%)' },
        },
        blinkCursor: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        floatToCart: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
          '100%': { opacity: '0', transform: 'scale(0.5) translateY(-100px)' },
        },
        rippleAnimation: {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '300px', height: '300px', opacity: '0' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
