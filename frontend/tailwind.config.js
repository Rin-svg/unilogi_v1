/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'unilogis-dark': '#09392D',
        'unilogis-green': '#389038',
        'unilogis-yellow': '#FFC80D',
        'unilogis-light': '#94D358',
      },
    },
  },
  plugins: [],
}