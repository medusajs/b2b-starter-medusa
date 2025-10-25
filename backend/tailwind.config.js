/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Yello Solar Hub Brand Colors
        'yello-yellow': '#FFCE00',
        'yello-orange': '#FF6600',
        'yello-magenta': '#FF0066',
      },
      backgroundImage: {
        // Yello Brand Gradients
        'gradient-yello': 'linear-gradient(135deg, #FFCE00 0%, #FF6600 50%, #FF0066 100%)',
        'gradient-yello-vertical': 'linear-gradient(180deg, #FFCE00 0%, #FF6600 50%, #FF0066 100%)',
        'gradient-yello-radial': 'radial-gradient(circle, #FFCE00 0%, #FF6600 50%, #FF0066 100%)',
      },
    },
  },
  presets: [require("@medusajs/ui-preset")],
};
