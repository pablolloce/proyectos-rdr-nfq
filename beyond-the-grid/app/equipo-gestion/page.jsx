import EquipoGestionRoute from "@/components/coordinacion/EquipoGestionRoute";
import SoloCoordinacion from "@/components/coordinacion/SoloCoordinacion";

export const metadata = {
  title: "Gestión del equipo · RDR",
  description:
    "Gestión del equipo RDR: edita equipo.json (miembros, tracks, roles, altas y bajas) y publica los cambios en la web.",
};

// Ruta fina: la lógica vive en components/coordinacion/. Chrome global en AppFrame.
export default function EquipoGestionPage() {
  return (
    <SoloCoordinacion>
      <EquipoGestionRoute />
    </SoloCoordinacion>
  );
}
