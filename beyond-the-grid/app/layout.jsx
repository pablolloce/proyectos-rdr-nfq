import "./globals.css";
import { Source_Serif_4, Lato } from "next/font/google";

// BBVA: Source Serif 4 para titulares, Lato para el resto.
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

export const metadata = {
  title: "RDR Knowledge · BBVA × NFQ",
  description:
    "Hub de documentación, formación y proyectos del Repositorio de Datos de Referencia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${serif.variable} ${lato.variable}`}>
      <body className="bg-midnight font-sans text-sand antialiased">{children}</body>
    </html>
  );
}
