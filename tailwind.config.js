// tailwind.config.js

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./scr/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily:{
        customsregular:['Manrop-Regular'],
        customssemibold:['Manrope-SemiBold'],
        customsbold:['Manrope-Bold'],
        customsmedium:['Manrope-Medium'],
      },
    },
  },
  plugins: [],
};