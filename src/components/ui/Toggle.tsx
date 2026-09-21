"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Text } from "./Text";

/**
 * Toggle — el interruptor de dos (o más) posiciones del Dashboard: "Coste
 * (€) / Consumo (kWh)" y "Estado cartera / Detalle cartera".
 *
 * No es `GrupoSegmentado` (el de "Agrupar por" en "Mi cartera"): ese tiene la
 * pastilla oscura sobre una pista casi blanca; este tiene la pastilla BLANCA
 * sobre una pista gris (`background-mid`), con más aire por dentro de cada
 * opción y las esquinas más marcadas en la pista que en la pastilla. Son dos
 * componentes distintos en la librería de Figma, no una variante del mismo.
 *
 * INTERACCIÓN — igual que `GrupoSegmentado`: la pastilla no salta, se
 * DESLIZA (posición + ancho, `motion-micro-states`), midiéndose en tiempo
 * real para funcionar con rótulos de cualquier largo. Teclado: flechas
 * izquierda/derecha, patrón `tablist`.
 */

export type OpcionToggle<T extends string> = { id: T; rotulo: string };

export function Toggle<T extends string>({
  opciones,
  valor,
  onChange,
  etiqueta,
}: {
  opciones: readonly OpcionToggle<T>[];
  valor: T;
  onChange: (id: T) => void;
  /** Texto accesible del grupo, p. ej. "Ver por". */
  etiqueta: string;
}) {
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const [pastilla, setPastilla] = useState<{ left: number; width: number }>();

  const activo = opciones.findIndex((o) => o.id === valor);

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
      className="relative flex items-center gap-01 rounded-md bg-background-mid p-01"
    >
      {/* La pastilla blanca que se desliza. Va detrás de los rótulos. */}
      {pastilla && (
        <span
          aria-hidden
          className="absolute top-01 bottom-01 rounded-sm bg-background-base transition-all motion-micro-states"
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
            className="relative flex-1 cursor-pointer rounded-sm px-04 py-02"
          >
            <Text
              variant="label-s"
              as="span"
              color={seleccionado ? "high" : "low"}
              className="whitespace-nowrap transition-colors motion-micro-states"
            >
              {opcion.rotulo}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
