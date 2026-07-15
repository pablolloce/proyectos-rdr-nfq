import FlowMap from "@/components/recursos/mapa/FlowMap";

export const metadata = {
  title: "Mapa de flujos · Recursos RDR",
  description:
    "Mapa interactivo de los flujos de ejecución RDR: pasos, workflows, eventos y colas conectados entre procesos.",
};

// Ruta fina: toda la lógica vive en components/recursos/mapa/.
// El chrome global (header, auth, footer) lo pone AppFrame.
export default function MapaPage() {
  return <FlowMap />;
}
