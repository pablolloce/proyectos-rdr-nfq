import SimuladorRoute from "@/components/coordinacion/SimuladorRoute";

export const metadata = {
  title: "Simulador de rentabilidad · RDR",
  description:
    "Simulador de rentabilidad del equipo RDR por trimestre: personas, costes, dedicaciones, proyectos y tarifas. Solo simulación — no modifica el Excel.",
};

// Ruta fina: la lógica vive en components/coordinacion/. Chrome global en AppFrame.
export default function SimuladorPage() {
  return <SimuladorRoute />;
}
