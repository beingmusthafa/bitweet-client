/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontWeight: {
        'thin': '100',
        'extralight': '200', 
        'light': '250',
        'normal': '350',
        'medium': '450',
        'semibold': '550',
        'bold': '650',
        'extrabold': '750',
        'black': '850'
      }
    },
  },
  plugins: [],
}
