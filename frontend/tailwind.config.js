/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        darkBg: "#0A0A0A",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
