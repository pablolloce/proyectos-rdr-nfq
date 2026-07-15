import RecursosHub from "@/components/recursos/RecursosHub";

export const metadata = {
  title: "Recursos · RDR Knowledge",
  description: "Biblioteca de recursos de referencia del equipo RDR.",
};

// Sub-hub de recursos (catálogo en lib/recursos.js). El chrome lo pone AppFrame.
export default function RecursosPage() {
  return <RecursosHub />;
}
