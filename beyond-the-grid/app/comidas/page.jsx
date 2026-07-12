import ComidasRoute from "@/components/comidas/ComidasRoute";

// Comidas de los jueves: votación semanal + restaurantes + histórico.
// El chrome (auth, cabecera, co-branding NFQ, toasts) vive en AppFrame (layout).
export const metadata = {
  title: "Comidas RDR · BBVA × NFQ",
  description: "Coordinación de las comidas de los jueves del equipo RDR.",
};

export default function ComidasPage() {
  return <ComidasRoute />;
}
