import GestionRoute from "@/components/timereport/GestionRoute";
import SoloCoordinacion from "@/components/coordinacion/SoloCoordinacion";

export const metadata = {
  title: "Time Report · Coordinación · RDR",
  description:
    "Gestión del Time Report del equipo: proyectos del trimestre, estados por quincena, bloqueos y reparto de horas.",
};

// Ruta fina: la lógica vive en components/timereport/. Chrome global en AppFrame.
export default function TimeReportGestionPage() {
  return (
    <SoloCoordinacion>
      <GestionRoute />
    </SoloCoordinacion>
  );
}
