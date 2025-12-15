/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#009FE3',
          dark: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}