import VacacionesRoute from "@/components/vacaciones/VacacionesRoute";

export const metadata = {
  title: "Vacaciones del equipo · RDR Knowledge",
  description: "Calendario anual de ausencias del equipo RDR (solo lectura).",
};

// Ruta migrada desde public/vacaciones.html. El chrome (auth, cabecera,
// footer NFQ, enlaces) vive en AppFrame (layout); aquí solo va el contenido.
export default function VacacionesPage() {
  return <VacacionesRoute />;
}
