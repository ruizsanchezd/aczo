"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Aire mínimo que se deja entre la burbuja y el borde de la ventana. Son los
 * mismos 8 px del token de espaciado 02, pero aquí tienen que ir en JavaScript
 * porque hay que restarlos del ancho de la ventana para saber dónde cabe la
 * burbuja; en CSS no se puede hacer esa cuenta.
 */
const AIRE_CON_EL_BORDE = 8;

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
 * POR QUÉ VA EN UN PORTAL: la burbuja se dibuja al final del `<body>`, no
 * donde está el icono. Si se dibujara ahí, cualquier caja de alrededor con
 * `overflow-hidden` la cortaría — y las hay a mansalva: las tarjetas con
 * esquinas redondeadas y, sobre todo, los paneles plegables (que necesitan
 * recortar su contenido para poder animar el despliegue). Se veía en la tabla
 * de "Todas las ofertas": el tooltip de la columna "Mantenimiento" salía
 * cortado por abajo. Al ir en el `<body>` no hay nada que pueda recortarla.
 *
 * Como contrapartida, la burbuja ya no se mueve sola con el icono: hay que
 * recolocarla a mano al hacer scroll o al cambiar el tamaño de la ventana
 * (ver el efecto de abajo).
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
  const anclaRef = useRef<HTMLSpanElement>(null);
  const burbujaRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  /**
   * Se pone a true la primera vez que alguien pasa por encima y ya no se
   * quita. Así la burbuja se queda en el DOM y puede animar también la salida,
   * en vez de desaparecer de golpe; y mientras nadie la haya usado, no se
   * dibuja nada.
   */
  const [montado, setMontado] = useState(false);
  /** Dónde va la burbuja, en coordenadas de ventana. */
  const [caja, setCaja] = useState<{ top: number; right: number } | null>(null);

  // useLayoutEffect y no useEffect: coloca la burbuja ANTES de que el
  // navegador pinte, para que no se llegue a ver un fotograma en el sitio
  // equivocado.
  useLayoutEffect(() => {
    if (!visible) return;

    function medir() {
      const ancla = anclaRef.current;
      if (!ancla) return;
      const r = ancla.getBoundingClientRect();

      // Se ancla por la derecha, creciendo hacia la izquierda: el icono suele
      // estar pegado al lado derecho de su fila, y centrarla la sacaría por
      // fuera. Pero si el icono está muy a la izquierda, la burbuja se saldría
      // por ese lado, así que se separa del borde derecho lo justo para que
      // quepa entera.
      const ancho = burbujaRef.current?.offsetWidth ?? 0;
      const derechaMaxima = window.innerWidth - ancho - AIRE_CON_EL_BORDE;
      const derecha = Math.max(
        AIRE_CON_EL_BORDE,
        Math.min(window.innerWidth - r.right, derechaMaxima),
      );

      setCaja({
        // El borde por el que se ancla: arriba del icono o abajo. La
        // separación con el icono la pone el margen (mb-02 / mt-02).
        top: position === "top" ? r.top : r.bottom,
        right: derecha,
      });
    }

    medir();
    // `true` para capturar también el scroll de contenedores internos, no
    // solo el de la página.
    window.addEventListener("scroll", medir, true);
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir, true);
      window.removeEventListener("resize", medir);
    };
  }, [visible, position, montado]);

  const burbuja = montado && (
    <span
      ref={burbujaRef}
      id={id}
      role="tooltip"
      style={
        caja
          ? {
              position: "fixed",
              right: `${caja.right}px`,
              ...(position === "top"
                ? { bottom: `${window.innerHeight - caja.top}px` }
                : { top: `${caja.top}px` }),
            }
          : // Todavía sin medir (el fotograma en el que se monta). Se deja
            // fuera de la vista pero en el documento, que es lo que hace falta
            // para poder medir su ancho y colocarla bien acto seguido.
            { position: "fixed", top: 0, right: 0, visibility: "hidden" }
      }
      className={[
        "pointer-events-none z-50",
        position === "top" ? "mb-02" : "mt-02",
        // 28ch no es un token: mide el ancho máximo de la línea de texto,
        // no un valor de diseño.
        "w-max max-w-[28ch] rounded-sm bg-background-high px-03 py-02 text-left text-body-s text-content-always-light shadow-md",
        "transition-opacity",
        visible ? "opacity-100 motion-micro-appear" : "opacity-0 motion-micro-leave",
      ].join(" ")}
    >
      {content}
    </span>
  );

  return (
    <span className={`inline-flex ${className}`}>
      <span
        ref={anclaRef}
        tabIndex={0}
        aria-describedby={id}
        onMouseEnter={() => {
          setMontado(true);
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => {
          setMontado(true);
          setVisible(true);
        }}
        onBlur={() => setVisible(false)}
        className="inline-flex rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high"
      >
        {children}
      </span>
      {burbuja && createPortal(burbuja, document.body)}
    </span>
  );
}
