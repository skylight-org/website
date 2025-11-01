/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'dark-surface': '#1a1a1a',
        'dark-surface-hover': '#252525',
        'dark-border': '#333333',
        'accent-gold': '#fcd754',
        'accent-gold-hover': '#f5c933',
      },
    },
  },
  plugins: [],
}

