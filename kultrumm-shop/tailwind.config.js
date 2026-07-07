/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        bauhaus: {
          bg:       '#121212',
          surface:  '#1a1a1a',
          text:     '#f3f3f3',
          muted:    '#8a8a8a',
          red:      '#dd3b3b',
          amber:    '#ff9d00',
        },
      },
    },
  },
  plugins: [],
}

