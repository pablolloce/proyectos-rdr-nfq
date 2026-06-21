/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Mapeadas a las CSS vars que inyecta next/font en layout.jsx
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#05060d",     // fondo casi negro
        accent: "#1D7CF4",  // azul
        accent2: "#CD3D60", // magenta
      },
    },
  },
  plugins: [],
};
