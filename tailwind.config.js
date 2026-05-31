/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'bg-white/8', 'bg-white/15', 'border-white/8',
    'bg-amber-500/10', 'bg-blue-500/10', 'bg-emerald-500/10', 'bg-primary-500/10',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0B1120',
          900: '#0F172A', // Slate 900
          800: '#1E293B', // Slate 800
          700: '#334155', // Slate 700
          600: '#475569', // Slate 600
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA', // Blue 400
          500: '#3B82F6', // Blue 500
          600: '#2563EB', // Blue 600
          700: '#1D4ED8', // Blue 700
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        surface: '#F8FAFC', // Slate 50
        card:    '#FFFFFF',
      },
      boxShadow: {
        card:  '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        nav:   '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-up':   'fadeUp 0.3s ease-out both',
        'fade-in':   'fadeIn 0.2s ease-out both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
    },
  },
  plugins: [],
}