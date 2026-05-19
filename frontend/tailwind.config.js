/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        rydo: {
          green:  '#00C853',
          dark:   '#0A0A0A',
          gray:   '#1A1A1A',
          light:  '#F5F5F5',
          muted:  '#6B7280',
          border: '#2A2A2A',
        },
      },
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cabinet)', 'Georgia', 'serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-green':'pulseGreen 2s infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:    { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown:  { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGreen: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,200,83,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(0,200,83,0)' } },
      },
      boxShadow: {
        'rydo':  '0 4px 24px rgba(0,200,83,0.15)',
        'card':  '0 2px 16px rgba(0,0,0,0.08)',
        'dark':  '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
