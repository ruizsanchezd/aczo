"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Text } from "./Text";

/**
 * GrupoSegmentado — el selector de pestañas pequeño, tipo interruptor de
 * varias posiciones. En "Mi cartera" es el "Agrupar por: Ubicación /
 * Sociedad / Comercializadora".
 *
 * INTERACCIÓN — esto es lo que hay que replicar en el repo de producto:
 *
 *   La pastilla oscura NO salta de una opción a otra: se DESLIZA. Es lo que
 *   hace que el control se lea como una sola pieza que se mueve, y no como
 *   tres botones que se encienden y se apagan por turnos.
 *
 *   qué la dispara  pulsar otra opción (o moverse con las flechas del teclado)
 *   qué se anima    la posición y el ancho de la pastilla + el color del texto
 *   duración/curva  motion-micro-states (200 ms, lineal) — es un cambio de
 *                   estado dentro de un mismo elemento, el token que le toca
 *
 *   La pastilla se mide en tiempo real (no hay anchos escritos a mano), así
 *   que funciona con rótulos de cualquier largo y en cualquier idioma.
 *
 * Teclado: flechas izquierda/derecha para cambiar de opción, como manda el
 * patrón de "tablist".
 */

export type OpcionSegmentada<T extends string> = { id: T; rotulo: string };

export function GrupoSegmentado<T extends string>({
  opciones,
  valor,
  onChange,
  etiqueta,
}: {
  opciones: readonly OpcionSegmentada<T>[];
  valor: T;
  onChange: (id: T) => void;
  /** Texto accesible del grupo, p. ej. "Agrupar por". */
  etiqueta: string;
}) {
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const [pastilla, setPastilla] = useState<{ left: number; width: number }>();

  const activo = opciones.findIndex((o) => o.id === valor);

  // Se mide el botón activo para colocar la pastilla. En cuanto cambia la
  // opción, los valores nuevos entran con transición y la pastilla se desliza.
  useLayoutEffect(() => {
    const boton = botones.current[activo];
    if (!boton) return;
    setPastilla({ left: boton.offsetLeft, width: boton.offsetWidth });
  }, [activo, opciones]);

  function conTeclado(e: React.KeyboardEvent) {
    const paso =
      e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : undefined;
    if (paso === undefined) return;
    e.preventDefault();
    const siguiente = (activo + paso + opciones.length) % opciones.length;
    onChange(opciones[siguiente].id);
    botones.current[siguiente]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      onKeyDown={conTeclado}
      className="relative flex items-center gap-01 rounded-sm border border-border-low bg-background-low p-01"
    >
      {/* La pastilla que se desliza. Va detrás de los rótulos. */}
      {pastilla && (
        <span
          aria-hidden
          className="absolute top-01 bottom-01 rounded-sm bg-background-inverse transition-all motion-micro-states"
          style={{ left: pastilla.left, width: pastilla.width }}
        />
      )}

      {opciones.map((opcion, i) => {
        const seleccionado = opcion.id === valor;
        return (
          <button
            key={opcion.id}
            ref={(el) => {
              botones.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={seleccionado}
            tabIndex={seleccionado ? 0 : -1}
            onClick={() => onChange(opcion.id)}
            className="relative cursor-pointer rounded-sm px-02 py-01"
          >
            {/* El color lo pone el propio Text (si no, su color por defecto
                pisaría al de la clase del botón). */}
            <Text
              variant="body-s"
              as="span"
              color={seleccionado ? "inverse" : "low"}
              className="transition-colors motion-micro-states"
            >
              {opcion.rotulo}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
