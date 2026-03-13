/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      /* Custom Color System */
      colors: {
        primaryLight: "#dbe3ef",
        softBlue: "#c7d4e5",
        midBlue: "#aabbd1",
        deepBlue: "#1b2f4b",

        success: "#16a34a",
        warning: "#f97316",
        danger: "#dc2626",
      },

      /* Professional Font Setup */
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      /* Custom Shadow for Cards */
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.15)",
      },

      /* Custom Animation */
      animation: {
        slowPulse: "pulse 3s ease-in-out infinite",
      },

    },
  },
  plugins: [],
}