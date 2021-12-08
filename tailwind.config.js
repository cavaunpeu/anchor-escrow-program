module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'light-gray': '#B1AAA0',
        'dark-grey': '#1D1F20'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
