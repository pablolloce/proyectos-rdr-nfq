// Inyecta el splash de carga "RDR Knowledge" (réplica del LoadingScreen del hub)
// en cada HTML de destino. Idempotente: si ya está, lo salta.
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

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => path.join(dir, f));
}

// Raíz (sin index.html: es la puerta de acceso) + public + public/formacion
const targets = [
  ...listHtml(ROOT).filter((f) => path.basename(f).toLowerCase() !== "index.html"),
  ...listHtml(PUBLIC),
  ...listHtml(path.join(PUBLIC, "formacion")),
];

let injected = 0, skipped = 0, failed = 0;
for (const file of targets) {
  try {
    let html = fs.readFileSync(file, "utf8");
    if (html.includes('id="rdr-splash"')) { skipped++; continue; }
    if (!/<body[^>]*>/i.test(html)) { console.warn("  · sin <body>:", file); failed++; continue; }
    html = html.replace(/(<body[^>]*>)/i, (m) => m + SNIPPET);
    fs.writeFileSync(file, html, "utf8");
    injected++;
    console.log("  + " + path.relative(ROOT, file));
  } catch (e) {
    failed++;
    console.error("  ! " + file + " -> " + e.message);
  }
}
console.log(`\nInyectados: ${injected} · ya tenían: ${skipped} · fallos: ${failed} · total objetivo: ${targets.length}`);
