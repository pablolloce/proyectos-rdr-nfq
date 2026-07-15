// Arte generativo (Higgsfield · nano_banana_2, 21:9, paleta BBVA) para las
// franjas decorativas de cada sección. Servido desde el CDN de Higgsfield:
// el sandbox de CI no puede descargarlo al repo (política de red), así que se
// hotlinkea. <ArtBanner> lo oculta solo si la URL dejara de responder — la
// página nunca depende de estas imágenes para ser legible.
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3GOWGrUJj7S85vx8fFuK74iZk8n";

export const ART = {
  // Cintas de cristal + naranja mandarin — Comidas, Vacaciones, Retro.
  equipo: `${CDN}/hf_20260712_091359_869badf3-72ac-4a29-9c4e-27b47f167935.png`,
  // Planos ascendentes tipo timeline + verde lime — Pases calendados.
  proyectos: `${CDN}/hf_20260712_091401_6d58793e-b51c-4099-ba3f-461f05f27838.png`,
  // Ondas y espiral de nodos + azul serene — Qué es RDR, Formaciones equipo.
  formacion: `${CDN}/hf_20260712_091403_b20919bb-905f-4b82-8af3-e8972de6db30.png`,
  // Barras de cristal analíticas + púrpura — Control RDR.
  coordinacion: `${CDN}/hf_20260712_091405_cd1ca353-8627-4443-aaa6-dddf95440eb4.png`,
  // Planos tipo biblioteca + flujos de datos en aqua — Recursos.
  recursos: `${CDN}/hf_20260715_080444_f5e62e8a-7b41-4817-b830-19fe658283c0.png`,
};
