import FormacionRoute from "@/components/formacion/FormacionRoute";

// HUB Formativo: ruta por niveles con estructura 3D. El chrome (auth, cabecera,
// transiciones) vive en AppFrame (layout); la cabecera detecta esta ruta.
export default function FormacionPage() {
  return <FormacionRoute />;
}
