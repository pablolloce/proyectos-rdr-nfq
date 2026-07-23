import ProcessExplorer from "@/components/recursos/explorer/ProcessExplorer";

export const metadata = {
  title: "Process Explorer · Recursos RDR",
  description:
    "Los 91 procesos del inventario RDR clasificados por la taxonomía oficial, con sus cadenas Control-M, listeners online y publicación.",
};

// Ruta fina: toda la lógica vive en components/recursos/explorer/.
// El chrome global (header, auth, footer) lo pone AppFrame.
export default function ProcesosPage() {
  return <ProcessExplorer />;
}
