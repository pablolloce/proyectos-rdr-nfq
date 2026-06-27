import "./globals.css";
import { Source_Serif_4, Lato } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import AppFrame from "@/components/AppFrame";

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
    <ViewTransitions>
      <html lang="es" className={`${serif.variable} ${lato.variable}`} style={{ backgroundColor: "#070E46" }}>
        <body className="bg-midnight font-sans text-sand antialiased">
          <AppFrame>{children}</AppFrame>
          {/* Speculation Rules: prerenderiza el destino al pasar el ratón
              (eagerness moderate) -> abrir una página/formación casi instantáneo.
              Solo Chromium; el resto lo ignora (degradación elegante). */}
          <script
            type="speculationrules"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                prerender: [{ where: { selector_matches: "a[data-prerender]" }, eagerness: "moderate" }],
              }),
            }}
          />
        </body>
      </html>
    </ViewTransitions>
  );
}
