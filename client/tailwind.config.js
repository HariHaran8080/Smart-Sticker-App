/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edfcf5',
          100: '#d5f8e7',
          200: '#aef1d3',
          300: '#75e6b7',
          400: '#38d596',
          500: '#00DF81', // Caribbean Green
          600: '#00ba6a',
          700: '#009355',
          800: '#057445',
          900: '#065f3a',
          950: '#013620',
        },
        antiflash: '#F1F7F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
}
