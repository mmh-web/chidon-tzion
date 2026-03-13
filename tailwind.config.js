/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['Rubik', 'sans-serif'],
      },
      colors: {
        israel: {
          blue: '#0038b8',
          'blue-light': '#4a7ee6',
          'blue-dark': '#002a8a',
          white: '#ffffff',
          gold: '#f5c842',
        },
      },
    },
  },
  plugins: [],
}
