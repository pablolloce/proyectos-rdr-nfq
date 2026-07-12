# Beyond the Grid

Hub del equipo RDR (BBVA × NFQ): **Next.js (App Router, export estático) +
React Three Fiber + Framer Motion + next-view-transitions + Tailwind**.

## Arranque

```bash
cd beyond-the-grid
npm install
npm run dev   # http://localhost:3000
```

## Estructura

```
app/
  layout.jsx          Fuentes (Source Serif 4 / Lato) + <AppFrame> + Speculation Rules
  page.jsx            Ruta / -> <BentoHub/>
  formacion/page.jsx  Ruta /formacion -> <FormacionRoute/>
  formacion/equipo/   Ruta /formacion/equipo -> progreso de formaciones del equipo
  comidas/            Ruta /comidas -> votación del restaurante (comidasBackend)
  vacaciones/         Ruta /vacaciones -> calendario anual de ausencias (vacacionesBackend)
  retro/              Ruta /retro -> retrospectivas en vivo (retroBackend, polling 3s)
  pases/              Ruta /pases -> ciclo completo del pase a producción (pasesBackend)
  control/            Ruta /control -> control económico, solo coordinación (controlBackend)
  que-es-rdr/         Ruta /que-es-rdr -> presentación editorial de introducción (sin backend)
  globals.css         Tailwind + tokens visuales compartidos (blobs, tilt, skeleton…)
  icon.svg            Favicon (isotipo RDR)
components/
  chrome/     Chrome persistente (vive en AppFrame, en todas las rutas)
    AppFrame.jsx        Orquesta LinksProvider + splash + AuthGate + Header + footer NFQ
    AuthGate.jsx        Puerta de acceso Google Sign-In (equipo/equipo.json)
    Header.jsx          Cabecera fija: título/subtítulo por ruta, sesión, logo BBVA
    LoadingScreen.jsx   Splash de marca (1×sesión, sessionStorage)
    Toast.jsx           Aviso flotante (usado por lib/links.js)
  hub/
    BentoHub.jsx        Contenido REAL del index: secciones -> columnas -> tarjetas
  formacion/
    FormacionRoute.jsx    Orquesta seed + localStorage + progreso remoto -> <ProgresoTorre/>
    ProgresoTorre.jsx     Ruta formativa: niveles, tarjetas de curso, hero + progreso
    ProgresoSkeleton.jsx  Esqueleto (misma estructura que ProgresoTorre) mientras carga
    EstructuraTower.jsx   Canvas R3F: nube de partículas (shader) que sigue niveles/scroll
  icons.jsx   Set de iconos inline compartido por hub/ y formacion/
hooks/
  useTilt.js       Tilt 3D + spotlight por puntero (variables CSS --rx/--ry/--mx/--my)
  useLowPower.js   Detecta equipos de poca capacidad -> activa modo "lite" (html.rdr-lite)
lib/
  formaciones.js   Catálogo de niveles/formaciones/tracks
  links.js         LinksProvider: fuente única de URLs externas (public/links/links.json)
  palette.js       Única fuente de los HEX de acento reutilizados en JS (hub + formaciones)
  progreso.js       Progreso de formación: semilla (progreso.json) ∪ localStorage ∪ backend
  ui.js            Helpers compartidos (rgba, n2)
```

## Cómo encaja el scroll con el 3D (lo importante)

No hay una librería de scroll de por medio: `EstructuraTower` (dentro de
`components/formacion/`) mide el DOM directamente.

1. Cada `LevelSection` de `ProgresoTorre` marca su `<section data-level={n}>`.
2. `EstructuraTower` escucha `scroll`/`resize` (con rAF) y calcula, a partir de
   los `getBoundingClientRect()` de esos `[data-level]`, un **nivel continuo**
   (p.ej. `2.4`) según qué sección cruza ~42% del alto de pantalla.
3. En su `useFrame`, amortigua (`lerp`) ese nivel objetivo y con él mueve la
   cámara/posición de la nube de puntos (desciende en espiral) y activa el
   `uFocusY` del shader (la banda del nivel activo brilla e "hincha").
4. El ratón se seguye aparte, con su propio `pointermove` local, y entra en el
   shader como `uMouse` (parallax).

Así la estructura 3D reacciona al scroll real de la página **sin re-renders de
React** (todo vive en refs/uniforms) y sin ninguna dependencia de animación
externa.

## Convenciones útiles

- `[data-prerender]` -> Speculation Rules (registrado en `app/layout.jsx`)
  prerenderiza la página al pasar el ratón por el enlace (solo Chromium).
- `[data-level]` -> marca de sección que lee `EstructuraTower` para saber en
  qué nivel de formación está el usuario (ver arriba).
- `.rdr-tilt` / `.rdr-spot` (`hooks/useTilt.js`) -> tilt 3D + spotlight que
  sigue al puntero en las tarjetas; se desactiva con `prefers-reduced-motion`
  y en modo "lite".
- `html.rdr-lite` (`hooks/useLowPower.js`) -> equipos de poca capacidad:
  `globals.css` quita blur, blobs animados, tilt y spotlight.

## Despliegue en GitHub Pages

Configurado para **project page** `https://rdr-nfq.github.io/team-hub/`:

- `next.config.mjs` → `output: "export"`, `basePath: "/team-hub"`, `images.unoptimized`.
- `public/.nojekyll` → evita que Jekyll ignore la carpeta `_next`.
- `.github/workflows/deploy.yml` → build + publish del `out/` en cada push a `main`
  que toque `beyond-the-grid/**`.

**Paso manual único:** en GitHub → *Settings → Pages → Source* = **GitHub Actions**.

## Contenido migrado y autenticación

- **Hub real**: las secciones y tarjetas viven en `components/hub/BentoHub.jsx`;
  las URLs externas en `public/links/links.json` (fuente única).
- **Todas las páginas de la app son rutas Next** (comidas, vacaciones, retro,
  pases, control, qué-es-RDR, formaciones del equipo). Cada una replica 1:1 el
  contrato de su backend Apps Script (URL por clave `*Backend` de links.json;
  POST `text/plain` sin preflight CORS). En `public/` solo quedan estáticos los
  **cursos** de `formacion/` y las presentaciones de `pendientes/`.
- **Arte generativo**: las franjas de los héroes salen de `lib/art.js`
  (imágenes Higgsfield hotlinkeadas; `ArtBanner` las oculta si el CDN falla).
- **Login Google**: `components/chrome/AuthGate.jsx` valida contra
  `public/equipo/equipo.json` y comparte sesión (`localStorage` `rdr_auth_email`)
  con las subpáginas estáticas que quedan.

> ⚠️ **OAuth**: el `GOOGLE_CLIENT_ID` debe tener autorizados los *Orígenes de
> JavaScript* en Google Cloud Console: `https://rdr-nfq.github.io` (producción)
> y `http://localhost:3000` (desarrollo). Si no, el botón de Google fallará.

`npm run build` genera `out/` (export estático). El workflow lo sube como
artefacto de Pages; no se commitea (está en `.gitignore`).

