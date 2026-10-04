/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: '#F4F5FB',
        ink: '#1E1B4B',
        blurple: { DEFAULT: '#6366F1', dark: '#4F46E5' },
        lav: '#A5B4FC',
        night: '#0F111A',
        panel: '#171A29',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 4px 24px -6px rgba(30,27,75,0.12)' },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
        pop: { '0%': { opacity: 0, transform: 'scale(.94)' }, '100%': { opacity: 1, transform: 'none' } },
        wave: { '0%,100%': { transform: 'scaleY(.25)' }, '50%': { transform: 'scaleY(1)' } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(24px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: {
        fadeUp: 'fadeUp .45s ease-out both',
        pop: 'pop .25s ease-out both',
        wave: 'wave .8s ease-in-out infinite',
        slideIn: 'slideIn .3s ease-out both',
      },
    },
  },
  plugins: [],
};
