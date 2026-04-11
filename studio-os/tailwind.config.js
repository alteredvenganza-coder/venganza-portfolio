/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7b1f24',
          light: '#a82a30',
          dark: '#5a1619',
        },
      },
    },
  },
  plugins: [],
}
