/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // BBVA: Source Serif 4 (titulares) + Lato (texto). Vars de next/font.
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-lato)", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta oficial BBVA (subset presentaciones). Config de build (CJS):
        // no puede importar lib/palette.js (ESM), que replica los acentos
        // (serene/mandarin/lime/purple/canary) para usarlos como valor JS en
        // componentes. Si un HEX cambia aquí, cambia también allí.
        midnight: "#070E46",
        electric: "#001391",
        serene: "#85C8FF",
        sand: "#F7F8F8",
        canary: "#FFE761",
        lime: "#88E783",
        aqua: "#8BE1E9",
        purple: "#9694FF",
        mandarin: "#FFB56B",
      },
    },
  },
  plugins: [],
};
