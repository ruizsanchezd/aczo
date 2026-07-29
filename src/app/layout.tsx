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
    // data-theme="light" fuerza el modo claro en todo el prototipo.
    //
    // El producto va SIEMPRE en claro. El modo oscuro está implementado y se
    // queda en la recámara por si algún día se activa: los tokens de color
    // siguen declarados como light-dark(claro, oscuro) en globals.css, así que
    // basta con quitar este atributo para que vuelva a seguir el ajuste del
    // sistema de cada persona.
    //
    // OJO, no confundir con las SUPERFICIES OSCURAS (la tarjeta "Ahorro Aczo",
    // el fondo de la pantalla de carga, la banda "Aczo garantiza"). Esas son
    // oscuras siempre, también en modo claro, y no tienen nada que ver con esto:
    // usan tokens que no cambian entre modos (highlight-deep, highlight-muted)
    // y textos content-always-light / content-always-dark.
    <html
      lang="es"
      data-theme="light"
      className={`${inter.variable} ${bradford.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
