/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        border: 'var(--color-border)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',

        /* Game type pills */
        'pill-slots': 'var(--color-pill-slots)',
        'pill-crash': 'var(--color-pill-crash)',
        'pill-table': 'var(--color-pill-table)',
        'pill-live': 'var(--color-pill-live)',
        'pill-bingo': 'var(--color-pill-bingo)',
        'pill-lottery': 'var(--color-pill-lottery)',
        'pill-poker': 'var(--color-pill-poker)',
        'pill-default': 'var(--color-pill-default)',

        /* Currency mode */
        'currency-fiat': 'var(--color-currency-fiat)',
        'currency-crypto': 'var(--color-currency-crypto)',
        'currency-both': 'var(--color-currency-both)',
        'currency-custom': 'var(--color-currency-custom)',

        /* Status */
        'status-active': 'var(--color-status-active)',
        'status-inactive': 'var(--color-status-inactive)',

        /* Muted background */
        'muted-bg': 'var(--color-muted-bg)',

        /* Input border */
        'input-border': 'var(--color-input-border)',

        /* Accent */
        'accent-blue': 'var(--color-accent-blue)',
        'accent-green': 'var(--color-accent-green)',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.2s ease-out',
        fadeOut: 'fadeOut 0.2s ease-out',
        'spin-once': 'spinOnce 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        spinOnce: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
