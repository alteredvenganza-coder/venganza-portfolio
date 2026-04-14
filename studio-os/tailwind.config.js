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
          pale:    '#2d1015',   // dark burgundy tint (nav active bg)
        },
        // Surface (dark glass theme)
        cream:   '#0e0c14',                  // app background base
        paper:   'rgba(255,255,255,0.06)',   // inner surface on glass
        border:  'rgba(255,255,255,0.12)',   // glass border
        // Text (inverted for dark)
        ink:     '#f0ede8',   // primary text (warm near-white)
        muted:   '#b0acaa',   // secondary text
        subtle:  '#8c8884',   // tertiary text
        // Stage colors — kept for badges (small pills on any bg)
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
        card:  '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        modal: '0 16px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
}
