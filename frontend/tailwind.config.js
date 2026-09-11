/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5fb',
          100: '#d7e8f5',
          200: '#b0d1eb',
          300: '#82b4dd',
          400: '#5495cf',
          500: '#2f78b8',
          600: '#215f97',
          700: '#1c4c78',
          800: '#193f62',
          900: '#0f2a44',
        },
      },
    },
  },
  plugins: [],
};
