import RetroRoute from "@/components/retro/RetroRoute";

export const metadata = {
  title: "Retro RDR · BBVA",
  description: "Retrospectivas del equipo RDR: termómetro de confianza, tablero por fases e histórico.",
};

// Retrospectivas RDR (migración de public/retro.html). El chrome (auth GIS,
// cabecera, splash, co-branding NFQ) vive en AppFrame (layout persistente).
export default function RetroPage() {
  return <RetroRoute />;
}
