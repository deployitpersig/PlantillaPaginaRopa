/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        brandPrimary: '#000000',
        brandSecondary: '#333333',
        brandAccent: '#f0f0f0',
      }
    },
  },
  plugins: [],
}
