import ControlRoute from "@/components/control/ControlRoute";

export const metadata = {
  title: "Control RDR · BBVA × NFQ",
  description:
    "Control económico del equipo RDR: iniciativas, ejecución, economía, capacidad, bolsa y encuestas. Solo coordinación.",
};

// Control RDR (solo coordinación): migración de public/control.html.
// El chrome (auth, cabecera, splash, co-branding) vive en AppFrame (layout).
export default function ControlPage() {
  return <ControlRoute />;
}
