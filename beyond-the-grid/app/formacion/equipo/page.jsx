import EquipoRoute from "@/components/formacion/equipo/EquipoRoute";

export const metadata = { title: "Progreso del equipo · RDR Knowledge" };

// Progreso de formaciones del EQUIPO (migración de equipo-formaciones.html).
// El chrome (auth, cabecera, co-branding NFQ) vive en AppFrame (layout).
export default function EquipoFormacionesPage() {
  return <EquipoRoute />;
}
