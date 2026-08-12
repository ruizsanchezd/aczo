"use client";

import { useId, type ReactNode } from "react";

/**
 * Tooltip — burbuja de ayuda que aparece al pasar el ratón o al enfocar con
 * el teclado (DS Tooltip).
 *
 * No usa el atributo `title` del navegador: ese tooltip nativo no se puede
 * diseñar (tipografía, color, tiempos) y en la práctica es poco fiable —
 * tarda en aparecer, es fácil no acertar sobre un icono pequeño, y varía
 * entre navegadores. Aquí se dibuja a mano con los tokens de motion pensados
 * justo para esto (`micro-appear`/`micro-leave`).
 *
 * `position` decide hacia qué lado se abre: "top" (por defecto) para cuando
 * hay contenido debajo que no se quiere tapar, "bottom" para cuando el
 * disparador está al principio de una tabla y conviene abrir hacia abajo.
 */
export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
}) {
  const id = useId();

  return (
    <span className={`group relative inline-flex ${className}`}>
      <span
        tabIndex={0}
        aria-describedby={id}
        className="inline-flex rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={[
          // Ancla el borde derecho de la burbuja al del icono, creciendo
          // hacia la izquierda: el icono suele estar pegado al lado derecho
          // de su fila, así que centrarla (como haría un tooltip normal) la
          // saca por fuera de la tarjeta. Con esto se queda siempre dentro.
          "pointer-events-none absolute right-0 z-10",
          position === "top" ? "bottom-full mb-02" : "top-full mt-02",
          // 28ch no es un token: mide el ancho máximo de la línea de texto,
          // no un valor de diseño.
          "w-max max-w-[28ch] rounded-sm bg-background-high px-03 py-02 text-left text-body-s text-content-always-light shadow-md",
          "opacity-0 transition-opacity motion-micro-leave",
          "group-hover:opacity-100 group-hover:motion-micro-appear",
          "group-focus-within:opacity-100 group-focus-within:motion-micro-appear",
        ].join(" ")}
      >
        {content}
      </span>
    </span>
  );
}
