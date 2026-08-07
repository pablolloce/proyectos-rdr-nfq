import CapacidadRoute from "@/components/coordinacion/CapacidadRoute";

export const metadata = {
  title: "Capacidad del equipo · RDR",
  description:
    "Capacidad del equipo RDR por trimestre: asignaciones persona-proyecto con % de dedicación, coberturas y cargas.",
};

// Ruta fina: la lógica vive en components/coordinacion/. Chrome global en AppFrame.
export default function CapacidadPage() {
  return <CapacidadRoute />;
}
