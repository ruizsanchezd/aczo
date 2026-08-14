import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { useEffect, type ReactNode } from "react";

/**
 * Las mismas dos fuentes que carga `src/app/layout.tsx`. Hace falta
 * repetirlo aquí porque Storybook no pasa por ese layout.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bradford = localFont({
  src: "../src/fonts/BradfordLLTT-Medium.woff2",
  variable: "--font-bradford",
  weight: "500",
  style: "normal",
  display: "swap",
});

/**
 * Fuerza modo claro y las fuentes de marca, igual que `src/app/layout.tsx`
 * en la app real. Lo usa el decorador global de `preview.tsx` (para las
 * historias) y, además, cada página de "Fundamentos" lo envuelve
 * directamente en su MDX: al ser MDX puro (sin `<Story>`), el decorador
 * nunca llega a ejecutarse para ellas.
 *
 * OJO: las clases de fuente y `data-theme` se ponen en `document.documentElement`
 * (el `<html>` de verdad), no en un `<div>` normal. `--font-heading` se
 * declara en `globals.css` como `var(--font-bradford), Georgia, serif` sobre
 * `:root`; si `--font-bradford` solo existiera en un div más adentro, esa
 * referencia sería inválida justo en la raíz (donde no hay `--font-bradford`
 * todavía) y ese valor inválido es el que se heredaría hacia abajo — no se
 * "arregla" luego, aunque el div de más adentro sí tenga la variable. Por
 * eso tiene que ir en el mismo elemento que `:root`.
 */
export function ModoClaro({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add(inter.variable, bradford.variable);
    html.setAttribute("data-theme", "light");
    return () => {
      html.classList.remove(inter.variable, bradford.variable);
    };
  }, []);

  return <div className="antialiased">{children}</div>;
}
