import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// body, label y title del sistema de diseño.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// heading — la fuente de marca, la que se usa en los titulares.
// Es la de verdad (Lineto), así que los titulares ya son fieles al Figma.
// El archivo está en src/fonts/ (ver el README de esa carpeta).
const bradford = localFont({
  src: "../fonts/BradfordLLTT-Medium.woff2",
  variable: "--font-bradford",
  weight: "500",
  style: "normal",
  display: "swap",
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
      className={`${inter.variable} ${bradford.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
