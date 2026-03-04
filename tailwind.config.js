/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f8',
          100: '#d5dff0',
          200: '#aabfe1',
          300: '#7f9fd1',
          400: '#5480c2',
          500: '#2b60b3',
          600: '#2b4c8f',
          700: '#1e3a6e',
          800: '#162d55',
          900: '#0e1f3c',
          DEFAULT: '#2b4c8f',
        },
        cream: {
          50:  '#faf7f0',
          100: '#f5eedc',
          200: '#ede0c4',
          300: '#e0ccaa',
        },
        gold: {
          100: '#fef3c7',
          300: '#f5d77a',
          400: '#e8c254',
          500: '#d4a92a',
        },
      },
      fontFamily: {
        sans: [
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Yu Gothic Medium"',
          'YuGothic',
          'Meiryo',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
