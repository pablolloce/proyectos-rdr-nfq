// Reinyecta el splash de carga "RDR Knowledge" tras el <body> REAL.
// Arregla el bug previo: el regex cazaba un <body> dentro de un comentario CSS
// (tokens.css: "aplicar al <section> o al <body>") y metía el splash en el <style>.
// Ahora: 1) elimina cualquier splash previo, 2) lo inserta tras el <body> a inicio de línea.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "beyond-the-grid", "public");

const SNIPPET = `
<!-- RDR splash de carga (réplica del hub). Se autoelimina a ~1.7s. -->
<div id="rdr-splash" aria-hidden="true">
  <p class="rdr-splash-kicker">BBVA &times; NFQ</p>
  <h1 class="rdr-splash-title">RDR Knowledge</h1>
  <div class="rdr-splash-line"></div>
</div>
<style>
#rdr-splash{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#001391;font-family:'Lato',system-ui,sans-serif}
#rdr-splash{animation:rdrSplashOut .6s ease 1s forwards}
#rdr-splash .rdr-splash-kicker{margin:0;font-size:12px;letter-spacing:.4em;text-transform:uppercase;color:#85C8FF;opacity:0;transform:translateY(8px);animation:rdrSplashIn .5s ease .05s forwards}
#rdr-splash .rdr-splash-title{margin:12px 0 0;font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:clamp(2rem,6vw,3.75rem);color:#F7F8F8;opacity:0;transform:translateY(12px);animation:rdrSplashIn .6s ease .15s forwards}
#rdr-splash .rdr-splash-line{margin-top:32px;height:1px;width:160px;background:rgba(133,200,255,.6);transform:scaleX(0);transform-origin:left;animation:rdrSplashLine .8s ease .2s forwards}
@keyframes rdrSplashIn{to{opacity:1;transform:translateY(0)}}
@keyframes rdrSplashLine{to{transform:scaleX(1)}}
@keyframes rdrSplashOut{to{opacity:0;visibility:hidden}}
@media (prefers-reduced-motion:reduce){#rdr-splash{animation-delay:.3s}#rdr-splash *{animation:none;opacity:1;transform:none}}
</style>
<script>setTimeout(function(){var s=document.getElementById('rdr-splash');if(s&&s.remove)s.remove();},1700);</script>
`;

// Elimina cualquier inyección previa (exacta o variantes con CRLF).
function stripSplash(html) {
  html = html.split(SNIPPET).join("");
  // por si las dudas, elimina bloque por marcadores (comentario -> script de borrado)
  html = html.replace(/\n?<!-- RDR splash de carga[\s\S]*?rdr-splash'\);if\(s&&s\.remove\)s\.remove\(\);},1700\);<\/script>\n?/g, "");
  return html;
}

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => path.join(dir, f));
}

const targets = [
  ...listHtml(ROOT).filter((f) => path.basename(f).toLowerCase() !== "index.html"),
  ...listHtml(PUBLIC),
  ...listHtml(path.join(PUBLIC, "formacion")),
];

let ok = 0, failed = 0;
for (const file of targets) {
  try {
    let html = fs.readFileSync(file, "utf8");
    html = stripSplash(html);
    // <body> REAL = el que abre línea (descarta el "<body>" de comentarios CSS).
    const re = /^([ \t]*<body[^>]*>)/im;
    if (!re.test(html)) { console.warn("  · sin <body> a inicio de línea:", path.relative(ROOT, file)); failed++; continue; }
    html = html.replace(re, (m) => m + SNIPPET);
    fs.writeFileSync(file, html, "utf8");
    ok++;
    console.log("  ✓ " + path.relative(ROOT, file));
  } catch (e) {
    failed++;
    console.error("  ! " + file + " -> " + e.message);
  }
}
console.log(`\nOK: ${ok} · fallos: ${failed} · total: ${targets.length}`);
