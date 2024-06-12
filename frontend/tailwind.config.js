/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'cust': {
          '50': '#fdf2f9',
          '100': '#fde6f5',
          '200': '#fcceed',
          '300': '#fba6dd',
          '400': '#f86ec5',
          '500': '#f143ab',
          '600': '#e0218a',
          '700': '#c3136f',
          '800': '#a1135b',
          '900': '#86154e',
          '950': '#52052c',
       },
      }
    },
  },
  plugins: [],
}

