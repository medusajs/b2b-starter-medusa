/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
      },
    },
  },
  plugins: [require("@medusajs/ui-preset")],
};
