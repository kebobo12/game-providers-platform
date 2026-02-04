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
      },
    },
  },
  plugins: [],
}
