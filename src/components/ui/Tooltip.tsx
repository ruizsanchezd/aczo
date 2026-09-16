"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * Aire mínimo que se deja entre la burbuja y el borde de la ventana: los 8 px
 * del token de espaciado 02. Va en JavaScript y no en CSS porque hay que
 * restarlo del tamaño de la ventana para saber dónde cabe la burbuja, y esa
 * cuenta en CSS no se puede hacer.
 */
const AIRE_CON_EL_BORDE = 8;

/**
 * Hueco entre el icono y la burbuja cuando se abre a un lado
 * (`position="right"`): los 4 px del token de espaciado 01, medidos en el
 * Figma. Arriba y abajo el hueco lo pone un margen (mb-02 / mt-02); aquí no
 * puede, porque la posición se calcula a mano y hay que sumarlo en la cuenta.
 */
const HUECO_CON_EL_ICONO = 4;

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
 * COLORES Y TIPOGRAFÍA salen del componente DS Tooltip de la librería, leídos
 * de una instancia del Figma de UI Design (node 5349:32575): superficie
 * `background-inverse` con texto `content-inverse` (es una superficie
 * INVERTIDA, no una superficie oscura fija: el día que se active el modo
 * oscuro, la burbuja pasa a ser clara con texto oscuro, y así sigue
 * destacando sobre la página), radio `md`, texto `body-m` y padding 12/8.
 *
 * `position` decide hacia qué lado se abre:
 *   - "top" (por defecto): hacia arriba, anclada por su borde derecho. Para
 *     cuando hay contenido debajo que no se quiere tapar.
 *   - "bottom": igual pero hacia abajo, para cuando el disparador está al
 *     principio de una tabla.
 *   - "right": a la derecha del icono y CENTRADA con él. Es la que pide el
 *     Figma para el aviso del mantenimiento (node 5349:32575): así no tapa ni
 *     las tarjetas de plan de arriba ni las comercializadoras de abajo, que es
 *     justo lo que pasaba abriéndola hacia arriba.
 *
 * DOS MODOS DE COMPORTAMIENTO:
 *
 *   - Por defecto es un tooltip de toda la vida: solo informa, se abre al
 *     pasar por encima y se cierra al salir. No se puede tocar (el ratón le
 *     pasa por encima sin enterarse).
 *   - Con `interactive` pasa a ser un aviso con acciones: la burbuja SÍ recibe
 *     el ratón, para que se puedan pulsar los botones que lleve dentro. Y
 *     entonces ya no se cierra sola al salir el ratón — sería imposible llegar
 *     hasta los botones cruzando el hueco que la separa del icono. Se cierra
 *     con Escape, pulsando fuera, o desde sus propios botones.
 *
 * `open` + `onOpenChange` permiten mandar desde fuera (modo controlado): lo
 * usa la pantalla de ahorro de empresas para abrir el aviso del mantenimiento
 * automático sola, en cuanto la sección asoma por la pantalla.
 */
export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
  interactive = false,
  open,
  onOpenChange,
  label,
  bloque = false,
}: {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "right";
  className?: string;
  /** La burbuja recibe el ratón: imprescindible si lleva botones dentro. */
  interactive?: boolean;
  /**
   * El disparador ocupa todo el ancho de su hueco en vez de ajustarse a su
   * contenido.
   *
   * Por defecto el disparador es `inline-flex`, que es lo que hace falta cuando
   * lo que envuelve es un icono: la caja se pega al icono. Pero envolviendo un
   * TEXTO QUE SE CORTA con puntos suspensivos eso lo estropea, y de una manera
   * que despista mucho: una caja que se ajusta a su contenido le da al texto
   * todo el ancho que pida, así que el texto deja de cortarse... y con él
   * desaparece el motivo mismo de poner la burbuja. Con `bloque` la caja se
   * queda del ancho de la celda y el texto se sigue cortando igual.
   */
  bloque?: boolean;
  /** Modo controlado: manda quien la usa (p. ej. para abrirla sola). */
  open?: boolean;
  onOpenChange?: (abierta: boolean) => void;
  /** Nombre accesible de la burbuja cuando lleva botones (es un diálogo, no
   * un simple texto de ayuda). */
  label?: string;
}) {
  const id = useId();
  const anclaRef = useRef<HTMLSpanElement>(null);
  const burbujaRef = useRef<HTMLSpanElement>(null);
  const [visibleInterno, setVisibleInterno] = useState(false);
  // Si llega `open`, manda quien nos usa; si no, nos lo guardamos nosotros.
  const controlado = open !== undefined;
  const visible = controlado ? open : visibleInterno;
  /**
   * Se pone a true la primera vez que la burbuja se abre y ya no se quita. Así
   * se queda en el DOM y puede animar también la salida, en vez de desaparecer
   * de golpe; y mientras nadie la haya abierto, no se dibuja nada.
   *
   * Se ajusta durante el render (no desde un efecto): es el patrón que
   * recomienda React para "cambiar un estado cuando cambia una prop", y
   * evita el render de más que encadenaría un efecto.
   */
  const [montado, setMontado] = useState(false);
  if (visible && !montado) setMontado(true);
  /** Dónde va la burbuja: el estilo ya calculado, en coordenadas de ventana.
   * Es un estilo y no unas coordenadas porque cada `position` se ancla por
   * bordes distintos (arriba por abajo, a la derecha por la izquierda...). */
  const [estilo, setEstilo] = useState<CSSProperties | null>(null);

  const cambiar = useCallback(
    (abierta: boolean) => {
      if (!controlado) setVisibleInterno(abierta);
      onOpenChange?.(abierta);
    },
    [controlado, onOpenChange],
  );

  // useLayoutEffect y no useEffect: coloca la burbuja ANTES de que el
  // navegador pinte, para que no se llegue a ver un fotograma en el sitio
  // equivocado.
  useLayoutEffect(() => {
    if (!visible) return;

    function medir() {
      const ancla = anclaRef.current;
      if (!ancla) return;
      const r = ancla.getBoundingClientRect();
      const ancho = burbujaRef.current?.offsetWidth ?? 0;
      const alto = burbujaRef.current?.offsetHeight ?? 0;

      if (position === "right") {
        // A la derecha del icono y centrada con él. Si no cabe a la derecha
        // (ventana estrecha), se pega al borde con el aire mínimo; y si no cabe
        // de alto, se sube o se baja lo justo para que quepa entera.
        const izquierda = Math.min(
          r.right + HUECO_CON_EL_ICONO,
          Math.max(AIRE_CON_EL_BORDE, window.innerWidth - ancho - AIRE_CON_EL_BORDE),
        );
        const arriba = Math.min(
          Math.max(AIRE_CON_EL_BORDE, r.top + r.height / 2 - alto / 2),
          Math.max(AIRE_CON_EL_BORDE, window.innerHeight - alto - AIRE_CON_EL_BORDE),
        );
        setEstilo({ position: "fixed", left: `${izquierda}px`, top: `${arriba}px` });
        return;
      }

      // Arriba y abajo se anclan por la derecha, creciendo hacia la izquierda:
      // el icono suele estar pegado al lado derecho de su fila, y centrarla la
      // sacaría por fuera. Pero si el icono está muy a la izquierda, la burbuja
      // se saldría por ese lado, así que se separa del borde derecho lo justo
      // para que quepa entera.
      const derechaMaxima = window.innerWidth - ancho - AIRE_CON_EL_BORDE;
      const derecha = Math.max(
        AIRE_CON_EL_BORDE,
        Math.min(window.innerWidth - r.right, derechaMaxima),
      );

      // La separación con el icono la pone el margen (mb-02 / mt-02).
      setEstilo({
        position: "fixed",
        right: `${derecha}px`,
        ...(position === "top"
          ? { bottom: `${window.innerHeight - r.top}px` }
          : { top: `${r.bottom}px` }),
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

  // Un aviso con acciones no se cierra al salir el ratón (ver la cabecera),
  // así que necesita las dos salidas de siempre: Escape y pulsar fuera.
  useEffect(() => {
    if (!interactive || !visible) return;

    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") cambiar(false);
    }
    function alPulsarFuera(e: PointerEvent) {
      const destino = e.target as Node | null;
      if (!destino) return;
      if (anclaRef.current?.contains(destino)) return;
      if (burbujaRef.current?.contains(destino)) return;
      cambiar(false);
    }

    document.addEventListener("keydown", alTeclear);
    document.addEventListener("pointerdown", alPulsarFuera);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("pointerdown", alPulsarFuera);
    };
  }, [interactive, visible, cambiar]);

  const burbuja = montado && (
    <span
      ref={burbujaRef}
      id={id}
      role={interactive ? "dialog" : "tooltip"}
      aria-label={interactive ? label : undefined}
      style={
        estilo ?? {
          // Todavía sin medir (el fotograma en el que se monta). Se deja fuera
          // de la vista pero en el documento, que es lo que hace falta para
          // poder medir su tamaño y colocarla bien acto seguido.
          position: "fixed",
          top: 0,
          right: 0,
          visibility: "hidden",
        }
      }
      className={[
        "z-50",
        // Cerrada nunca recibe el ratón, ni siquiera en modo interactivo: si
        // no, taparía lo que hay debajo estando invisible.
        interactive && visible ? "pointer-events-auto" : "pointer-events-none",
        // "right" ya lleva el hueco metido en la cuenta de la posición.
        position === "top" ? "mb-02" : position === "bottom" ? "mt-02" : "",
        // Con acciones dentro, el ancho es el del componente del Figma
        // (DS Tooltip, node 5349:32575: 320 px), que es el que deja sitio a los
        // dos botones en una línea. Sin acciones, se ajusta al texto: 28ch no
        // es un token, mide el ancho máximo de la línea, no un valor de diseño.
        interactive ? "w-[320px]" : "w-max max-w-[28ch]",
        "rounded-md bg-background-inverse px-03 py-02 text-left text-body-m text-content-inverse shadow-md",
        "transition-opacity",
        visible ? "opacity-100 motion-micro-appear" : "opacity-0 motion-micro-leave",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {content}
    </span>
  );

  // Mismos estilos de foco en los dos modos; lo que cambia es la etiqueta
  // (un botón de verdad cuando se puede abrir y cerrar a voluntad).
  const caja = bloque ? "block min-w-0" : "inline-flex";
  const clasesAncla = `${caja} rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high`;

  return (
    <span ref={anclaRef} className={`${caja} ${className}`}>
      {interactive ? (
        <button
          type="button"
          aria-expanded={visible}
          aria-controls={id}
          // Aquí NO se abre al pasar por encima, solo al pulsar: si se abriera
          // con el ratón, al pulsar el icono se abriría (hover) y se cerraría
          // (clic) en el mismo gesto, y no habría manera de volver a verla. Es
          // además lo que se espera de un aviso con botones: se abre y se
          // cierra a voluntad, no de refilón.
          onClick={() => cambiar(!visible)}
          className={`cursor-pointer ${clasesAncla}`}
        >
          {children}
        </button>
      ) : (
        <span
          tabIndex={0}
          aria-describedby={id}
          onMouseEnter={() => cambiar(true)}
          onMouseLeave={() => cambiar(false)}
          onFocus={() => cambiar(true)}
          onBlur={() => cambiar(false)}
          className={clasesAncla}
        >
          {children}
        </span>
      )}
      {burbuja && createPortal(burbuja, document.body)}
    </span>
  );
}
