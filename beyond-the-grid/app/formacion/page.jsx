import Shell from "@/components/Shell";
import FormacionRoute from "@/components/FormacionRoute";

// HUB Formativo: la esfera 3D por niveles (antes era el index).
export default function FormacionPage() {
  return (
    <Shell backHref="/" subtitle="Ruta formativa · niveles 00–06">
      <FormacionRoute />
    </Shell>
  );
}
