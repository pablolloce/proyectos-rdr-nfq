import ProcessExplorer from "@/components/recursos/explorer/ProcessExplorer";

export const metadata = {
  title: "Process Explorer · Recursos RDR",
  description:
    "Cadenas batch, listeners online, publishers e inventario de procesos RDR con su flujo de ejecución paso a paso.",
};

// Ruta fina: toda la lógica vive en components/recursos/explorer/.
// El chrome global (header, auth, footer) lo pone AppFrame.
export default function ProcesosPage() {
  return <ProcessExplorer />;
}
