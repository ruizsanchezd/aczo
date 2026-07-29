import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

// body, label y title del sistema de diseño.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// SUSTITUTO TEMPORAL de "Bradford LL TT" (los `heading` de marca).
// Bradford es una fuente de pago y no está en el repo, así que de momento se usa
// esta serif parecida para que los titulares no se vean con una fuente cualquiera.
// Los titulares NO son fieles al Figma hasta que se añada la fuente real.
const heading = Newsreader({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Aczo · Prototipo",
  description:
    "Prototipo de animaciones e interacciones del proyecto Aczo. Datos de mentira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
