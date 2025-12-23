/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: "#58CC02",
          dark: "#58A700",
          light: "#89E219",
        },
        // Secondary colors
        orange: {
          DEFAULT: "#FF9600",
          light: "#FFC800",
        },
        purple: {
          DEFAULT: "#CE82FF",
          dark: "#A560E8",
        },
        blue: {
          DEFAULT: "#1CB0F6",
          dark: "#1899D6",
        },
        pink: {
          DEFAULT: "#FF4B4B",
        },
        yellow: {
          DEFAULT: "#FFD700",
        },
        // Pastel backgrounds
        pastel: {
          mint: "#E5FFCC",
          lavender: "#F3E5FF",
          peach: "#FFE8CC",
          sky: "#E5F6FF",
          cream: "#FFF7E0",
        },
        // Cake colors
        cake: {
          frosting: "#FFB6C1",
          base: "#DEB887",
        },
      },
      fontFamily: {
        nunito: ["Nunito-Regular"],
        "nunito-bold": ["Nunito-Bold"],
        "nunito-extra": ["Nunito-ExtraBold"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
