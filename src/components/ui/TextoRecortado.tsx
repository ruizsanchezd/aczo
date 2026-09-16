"use client";

import { useLayoutEffect, useState } from "react";
import { Text, type TextColor, type TextVariant } from "./Text";
import { Tooltip } from "./Tooltip";

/**
 * TextoRecortado — un texto que se corta con puntos suspensivos cuando no cabe
 * y que, SOLO en ese caso, enseña el texto entero al pasar por encima.
 *
 * Hace falta en las tablas y listas donde una columna es más estrecha que su
 * contenido: "Planta 1 Puerta…", "Calle Velázquez nº 10, Alcobendas, M…".
 * Cortar el texto está bien —mantiene las filas alineadas y comparables— pero
 * dejar al lector sin manera de ver lo que falta, no.
 *
 * LA CLAVE ESTÁ EN EL "SOLO EN ESE CASO". Poner la burbuja siempre llenaría la
 * pantalla de globos que repiten lo que ya se lee entero, y acabarían
 * ignorándose justo cuando sí hacen falta. Por eso se MIDE el elemento: si su
 * contenido es más ancho que la caja, hay algo escondido y entonces —y solo
 * entonces— se ofrece la burbuja.
 *
 * Animación: la de siempre del tooltip del sistema (micro-appear al entrar,
 * micro-leave al salir). Aquí no se inventa nada.
 */
export function TextoRecortado({
  children,
  variant = "label-s",
  color = "high",
  className = "",
}: {
  /** El texto. Se enseña entero en la burbuja cuando queda cortado. */
  children: string;
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
}) {
  /**
   * El elemento a medir se guarda en un ESTADO, no en una `ref` normal, y eso
   * es lo que hace que esto funcione.
   *
   * Al descubrir que el texto está cortado, este componente se vuelve a dibujar
   * envuelto en la burbuja — y envolverlo cambia el sitio del texto en la
   * página, así que el navegador lo tira y crea uno nuevo. Con una `ref` normal
   * nos quedaríamos apuntando al viejo, ya fuera del documento, midiendo para
   * siempre algo que ya no existe. Guardándolo en un estado, cada vez que
   * aparece un elemento nuevo se vuelve a medir sobre el bueno.
   */
  const [elemento, setElemento] = useState<HTMLElement | null>(null);
  const [recortado, setRecortado] = useState(false);

  useLayoutEffect(() => {
    if (!elemento) return;

    // El +1 es por los redondeos a subpíxel del navegador: sin él, un texto que
    // cabe justo se daría por cortado y saldría una burbuja de más.
    const medir = () =>
      setRecortado(elemento.scrollWidth > elemento.clientWidth + 1);

    medir();

    /*
     * Hay que volver a medir DOS veces más, y cada una por un motivo:
     *
     *   Cuando cambia el tamaño. El ancho de las columnas cambia solo: en "Mi
     *   cartera", al cambiar de agrupación el mapa se ensancha o se estrecha y
     *   la tabla de al lado se recoloca. Se vigila también al padre, que es
     *   quien manda el ancho de la celda.
     *
     *   Cuando acaban de cargar las tipografías. Es el caso que más despista:
     *   en la primera medición todavía está puesta la fuente de repuesto, más
     *   estrecha, y un texto que con Inter no cabe ahí sí cabía. La caja no
     *   cambia de tamaño al cambiar la fuente —solo cambia lo que hay dentro—,
     *   así que el observador de tamaño ni se entera.
     */
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    if (elemento.parentElement) observador.observe(elemento.parentElement);

    let vivo = true;
    document.fonts?.ready.then(() => {
      if (vivo) medir();
    });

    return () => {
      vivo = false;
      observador.disconnect();
    };
  }, [elemento, children]);

  const texto = (
    <Text
      ref={setElemento}
      variant={variant}
      color={color}
      as="span"
      className={`block truncate ${className}`}
    >
      {children}
    </Text>
  );

  if (!recortado) return texto;

  // `bloque`: la burbuja no puede dejar que su caja se ajuste al contenido, o
  // el texto dejaría de cortarse al envolverlo y la medición se volvería loca
  // (cortado → envuelvo → ya no cortado → desenvuelvo → cortado…).
  return (
    <Tooltip content={children} bloque>
      {texto}
    </Tooltip>
  );
}
