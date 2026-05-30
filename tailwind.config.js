/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#060E1F',
          900: '#0F2241',
          800: '#1B3A6B',
          700: '#234E8C',
          600: '#2B62AD',
        },
        gold: {
          400: '#F5C842',
          500: '#E8A820',
          600: '#C98A10',
        },
        surface: '#F7F5F0',
        card:    '#FFFFFF',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(15,34,65,0.06), 0 4px 16px rgba(15,34,65,0.08)',
        hover: '0 4px 12px rgba(15,34,65,0.12), 0 12px 32px rgba(15,34,65,0.10)',
        nav:   '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'fade-in':   'fadeIn 0.3s ease both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
    },
  },
  plugins: [],
}