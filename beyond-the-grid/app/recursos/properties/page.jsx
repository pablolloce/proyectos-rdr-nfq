import PropertiesExplorer from "@/components/recursos/properties/PropertiesExplorer";

export const metadata = {
  title: "Properties GSProcess · Recursos RDR",
  description:
    "Los 510 ficheros .properties de GSProcess tal y como están escritos: búsqueda rápida por proceso, contenido, workflows o JARs.",
};

// Ruta fina: toda la lógica vive en components/recursos/properties/.
// El chrome global (header, auth, footer) lo pone AppFrame.
export default function PropertiesPage() {
  return <PropertiesExplorer />;
}
