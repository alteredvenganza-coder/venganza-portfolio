/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Suisse International', 'Suisse Intl', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Suisse International', 'Suisse Intl', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Suisse International', 'Suisse Intl', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        background: '#131313',
        surface: '#1c1c1c',
        primary: '#7b1f24',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
