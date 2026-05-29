const fs = require('fs');

const files = [
  'C:\\Pablo\\2-CODE\\HUB Documentacion RDR\\proyectos-rdr-nfq\\formacion\\form-welcome-0-que-es-rdr.html',
  'C:\\Pablo\\2-CODE\\HUB Documentacion RDR\\proyectos-rdr-nfq\\formacion\\form-functional-1-finance-basic.html',
  'C:\\Pablo\\2-CODE\\HUB Documentacion RDR\\proyectos-rdr-nfq\\formacion\\form-tecnico-1-tecnologias-rdr.html',
];

const wrongBlock = `
  /* NFQ note/pull: keep isotipo small on mobile */
  .nfq-note img { height: 20px !important; width: auto !important; }
  .nfq-pull img { height: 28px !important; width: auto !important; }
  .nfq-note { padding: var(--bbva-space-2) var(--bbva-space-3) !important; gap: 8px !important; font-size: clamp(13px, 3.5vw, 15px) !important; }
  .nfq-pull { padding: var(--bbva-space-2) var(--bbva-space-3) !important; gap: 8px !important; }
  .nfq-pull__quote { font-size: clamp(16px, 4.5vw, 22px) !important; }
  .nfq-credit img { height: 20px !important; }

  /* Slide content: prevent clipping on mobile */
  .slide main { overflow: visible !important; }

  `;

const mobileCSS = `
  /* NFQ note/pull: keep isotipo small on mobile */
  .nfq-note img { height: 20px !important; width: auto !important; max-width: 20px !important; }
  .nfq-pull img { height: 28px !important; width: auto !important; max-width: 28px !important; }
  .nfq-note { padding: var(--bbva-space-2) var(--bbva-space-3) !important; gap: 8px !important; font-size: clamp(13px, 3.5vw, 15px) !important; overflow-wrap: break-word !important; word-wrap: break-word !important; }
  .nfq-note > div { min-width: 0 !important; overflow-wrap: break-word !important; }
  .nfq-pull { padding: var(--bbva-space-2) var(--bbva-space-3) !important; gap: 8px !important; }
  .nfq-pull__quote { font-size: clamp(16px, 4.5vw, 22px) !important; }
  .nfq-credit img { height: 20px !important; max-width: 20px !important; }

  /* Slide content: prevent clipping on mobile */
  .slide main { overflow: visible !important; }
`;

for (const f of files) {
  let c = fs.readFileSync(f, 'utf-8');
  
  // 1. Remove wrongly-placed block from print section
  if (c.includes(wrongBlock)) {
    c = c.replace(wrongBlock, '');
    console.log(`  Removed wrong block from print: ${f.split('\\').pop()}`);
  }
  
  // 2. Find the mobile media query and insert before its closing .nav-arrows rule
  // The mobile query is @media (max-width: 819px) { ... .nav-arrows { display: none !important; } ... }
  // We need to find the .nav-arrows INSIDE the 819px media query (not the print one)
  const mobileStart = c.indexOf('@media (max-width: 819px)');
  if (mobileStart === -1) {
    console.log(`  SKIP ${f.split('\\').pop()} - no mobile query found`);
    continue;
  }
  
  // Find .nav-arrows after mobileStart
  const navArrowsInMobile = c.indexOf('.nav-arrows { display: none !important; }', mobileStart);
  if (navArrowsInMobile === -1) {
    console.log(`  SKIP ${f.split('\\').pop()} - no nav-arrows in mobile`);
    continue;
  }
  
  // Check if already has our mobile fix
  if (c.substring(mobileStart, navArrowsInMobile).includes('.nfq-note img { height: 20px')) {
    console.log(`  SKIP ${f.split('\\').pop()} - already patched correctly`);
    continue;
  }
  
  // Insert before .nav-arrows in mobile
  c = c.substring(0, navArrowsInMobile) + mobileCSS + '\n  ' + c.substring(navArrowsInMobile);
  
  fs.writeFileSync(f, c, 'utf-8');
  console.log(`OK ${f.split('\\').pop()}`);
}
