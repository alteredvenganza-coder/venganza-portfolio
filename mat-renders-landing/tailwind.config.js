/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F2F0E9',
        charcoal: '#1A1A1A',
        moss: '#2E4036',
        clay: '#CC5833',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        'large': '2rem',
        'xlarge': '3rem',
      }
    },
  },
  plugins: [],
}
