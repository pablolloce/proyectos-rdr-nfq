import OfertasRoute from "@/components/coordinacion/OfertasRoute";

export const metadata = {
  title: "Generación de ofertas · RDR",
  description:
    "Generador de ofertas RDR: rellena los datos y crea el Doc y el Sheet de la oferta a partir de las plantillas, en la carpeta de Drive.",
};

// Ruta fina: la lógica vive en components/coordinacion/. Chrome global en AppFrame.
export default function OfertasPage() {
  return <OfertasRoute />;
}
