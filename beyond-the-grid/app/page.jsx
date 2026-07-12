import BentoHub from "@/components/hub/BentoHub";

// Index: bento grid glassmorphism (rápido y accesible, sin WebGL).
// El chrome (auth, cabecera, splash, transiciones) vive en AppFrame (layout).
export default function Home() {
  return <BentoHub />;
}
