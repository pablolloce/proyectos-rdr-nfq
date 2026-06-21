import "./globals.css";
import { Space_Grotesk, Inter } from "next/font/google";

// Tipografías premium cargadas con next/font (sin layout shift, self-hosted).
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Beyond the Grid",
  description: "Un entorno digital fluido. React · Three.js · GSAP.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${inter.variable}`}>
      <body className="bg-ink font-sans text-white antialiased">{children}</body>
    </html>
  );
}
