/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        // Brand
        burgundy: {
          DEFAULT: '#7b1f24',
          light:   '#a33030',
          muted:   '#c9888b',
          pale:    '#f5e8e8',
        },
        // Surface
        cream:   '#faf8f5',
        paper:   '#f3efe8',
        border:  '#e8e4dc',
        // Text
        ink:     '#1a1a1a',
        muted:   '#6b6460',
        subtle:  '#9e9690',
        // Stage colors (warm, light)
        stage: {
          lead:        '#fdf3e3',
          onboarding:  '#e8f0fe',
          in_progress: '#e6f4ea',
          waiting:     '#fff8e1',
          review:      '#fce8e6',
          completed:   '#e6f4ea',
        },
        // Payment
        pay: {
          unpaid:  '#fce8e6',
          deposit: '#fff8e1',
          paid:    '#e6f4ea',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        md:      '8px',
        lg:      '12px',
        xl:      '16px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(26,26,26,0.07), 0 1px 2px rgba(26,26,26,0.04)',
        modal: '0 8px 32px rgba(26,26,26,0.12)',
      },
    },
  },
  plugins: [],
}
