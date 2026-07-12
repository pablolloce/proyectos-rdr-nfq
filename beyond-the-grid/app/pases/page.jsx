import PasesRoute from "@/components/pases/PasesRoute";

// Pases Calendados RDR: gestión del ciclo de vida de cada release (pase)
// contra el backend Apps Script. El chrome (auth, cabecera, co-branding)
// vive en AppFrame (layout); esta página solo monta la ruta cliente.
export const metadata = {
  title: "Pases Calendados RDR · BBVA × NFQ",
  description:
    "Gestión de pases calendados: proyectos, componentes, orden de implantación, checks y mergeos.",
};

export default function PasesPage() {
  return <PasesRoute />;
}
