/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) Export estático: genera la carpeta out/ con HTML+JS+CSS servibles
  //    por GitHub Pages (sin servidor Node).
  output: "export",

  // 2) Project page: el sitio cuelga de https://rdr-nfq.github.io/team-hub/
  //    Sin basePath/assetPrefix, todos los /_next/... darían 404.
  basePath: "/team-hub",
  assetPrefix: "/team-hub/",

  // 3) No hay servidor que optimice imágenes en Pages.
  images: { unoptimized: true },

  // Útil en hosting estático para que /ruta sirva /ruta/index.html.
  trailingSlash: true,

  // Desactivado: con R3F, StrictMode duplica el montaje del canvas en dev.
  reactStrictMode: false,
};

export default nextConfig;
