/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lilac: '#C8A2C8',
        'lilac-light': '#E6D7E6',
        'lilac-dark': '#A085A0',
      },
    },
  },
  plugins: [],
}