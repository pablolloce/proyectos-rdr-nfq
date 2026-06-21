# Beyond the Grid

Experiencia web inmersiva: **Next.js (App Router) + React Three Fiber + GSAP/ScrollTrigger + Framer Motion + Tailwind + Lenis**.

## Arranque

```bash
cd beyond-the-grid
npm install
npm run dev   # http://localhost:3000
```

## Estructura

```
app/
  layout.jsx        Fuentes (Space Grotesk / Inter) + globals + <html>/<body>
  page.jsx          Server component -> renderiza <Experience/>
  globals.css       Tailwind + cursor:none + estilos Lenis
components/
  Experience.jsx    Orquestador cliente: capas, cursor, loader, ratón->store
  Scene.jsx         Canvas R3F (cámara, luces, Environment) — sin SSR
  DistortedSphere.jsx  Esfera perlin (MeshDistortMaterial) reactiva en useFrame
  LoadingScreen.jsx Loader brutalista + salida con timeline GSAP
  CustomCursor.jsx  Cursor con spring (Framer Motion), crece en [data-hover]
  Hero.jsx          Overlay 100vh con el título "BEYOND THE GRID"
  ContentSection.jsx  Secciones con texto [data-reveal] (staggered)
hooks/
  useLenis.js          Smooth scroll + sync con ScrollTrigger/ticker GSAP
  useGsapAnimations.js Coreografía de scroll + split de texto + puente a Three
lib/
  gsap.js           Registro de ScrollTrigger (solo cliente)
  scrollStore.js    Estado mutable fuera de React (puente GSAP <-> Three)
```

## Cómo encaja el scroll con el 3D (lo importante)

`scrollStore` es un objeto plano fuera de React.

1. `useGsapAnimations` crea un `ScrollTrigger` que recorre toda la página y en
   su `onUpdate` escribe `scrollStore.progress` (0..1).
2. `Experience` escribe `scrollStore.mouseX/Y` en `mousemove`.
3. `DistortedSphere` **lee** esos valores en su `useFrame` y aplica `lerp` a
   rotación, escala, posición, color y distorsión.

Así mutamos el objeto a 60 fps **sin provocar re-renders de React** — clave para
la fluidez. Lenis y GSAP comparten un único `requestAnimationFrame` (el ticker
de GSAP), evitando saltos entre librerías.

## Convenciones útiles

- `[data-hover]`  -> el cursor personalizado se agranda sobre ese elemento.
- `[data-reveal]` -> su texto se revela palabra por palabra al entrar en viewport.
- Material cristal/refracción: en `DistortedSphere.jsx`, sube `transmission`
  y baja `metalness` (ya hay un comentario con los valores sugeridos).
- ¿Sin red? El `<Environment preset="city" />` descarga un HDRI; quítalo o usa
  un `.hdr` local si trabajas offline.

## Despliegue en GitHub Pages

Configurado para **project page** `https://rdr-nfq.github.io/team-hub/`:

- `next.config.mjs` → `output: "export"`, `basePath: "/team-hub"`, `images.unoptimized`.
- `public/.nojekyll` → evita que Jekyll ignore la carpeta `_next`.
- `.github/workflows/deploy.yml` → build + publish del `out/` en cada push a `main`
  que toque `beyond-the-grid/**`.

**Paso manual único:** en GitHub → *Settings → Pages → Source* = **GitHub Actions**.

`npm run build` genera `out/` (export estático). El workflow lo sube como
artefacto de Pages; no se commitea (está en `.gitignore`).

