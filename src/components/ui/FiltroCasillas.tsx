"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Checkbox } from "./Checkbox";
import { Icon } from "./Icon";
import { Text } from "./Text";

/**
 * FiltroCasillas — el filtro de varias respuestas, con su lista desplegable.
 *
 * Es el hermano de `FiltroSelect` para cuando se puede elegir MÁS DE UNA cosa.
 * En "Mi cartera" es el filtro de "Dirección": se abre una lista con todas las
 * direcciones de la cartera, agrupadas por provincia, cada una con su casilla.
 *
 *   ┌──────────────────────────┐
 *   │ ☐ VALENCIA               │  ← encabezado del grupo: marca o desmarca
 *   │ ☐ Calle Castellón 6      │    todas las direcciones que cuelgan de él
 *   │ ☐ Calle Moratines 12     │
 *   │ ──────────────────────── │
 *   │ ☐ MADRID                 │
 *   └──────────────────────────┘
 *
 * INTERACCIÓN — esto es lo que hay que replicar en producto:
 *
 *   Abrir. La lista aparece pegada al botón con anim-aparece (micro-appear,
 *   350 ms) y la flecha gira media vuelta con micro-states. Se cierra pulsando
 *   fuera, con Escape, o volviendo a pulsar el botón.
 *
 *   Encabezados a medias. Si de una provincia hay elegidas unas direcciones sí
 *   y otras no, su casilla se queda en el estado "indeterminado" (la rayita en
 *   vez del check). Es lo que evita tener que bajar la lista para saber si ahí
 *   dentro hay algo marcado.
 *
 *   El degradado de abajo. Cuando quedan direcciones por debajo del borde, la
 *   última se difumina. No es decoración: es lo que avisa de que la lista
 *   sigue. Desaparece al llegar al final, así que también sirve de "ya está".
 *
 *   La cuenta en el botón. Con algo elegido, el botón dice "Dirección (3)" y se
 *   oscurece, igual que el resto de filtros de la barra: así se ve de un vistazo
 *   cuáles están puestos sin abrir ninguno.
 */

export type GrupoCasillas = {
  /** El encabezado. Se pinta en mayúsculas. */
  rotulo: string;
  opciones: string[];
};

/**
 * Medidas del propio desplegable, en píxeles. No son valores del sistema de
 * diseño (no hay un token para "cuánto mide una lista antes de rodar"), así que
 * van aquí a la vista y no repartidas por las clases.
 */
const ANCHO = 320;
const ALTO_MAXIMO = 320;

export function FiltroCasillas({
  nombre,
  grupos,
  seleccion,
  onChange,
}: {
  nombre: string;
  grupos: GrupoCasillas[];
  seleccion: string[];
  onChange: (seleccion: string[]) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  // Cerrar al pulsar fuera o con Escape.
  useEffect(() => {
    if (!abierto) return;

    function fuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  // ¿Queda lista por debajo? Es lo que enciende el degradado de abajo. Se mira
  // al abrir (por eso el efecto) y en cada movimiento de la lista.
  function comprobarSiQuedaLista() {
    const el = lista.current;
    if (!el) return;
    setHayMas(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }

  useLayoutEffect(() => {
    if (abierto) comprobarSiQuedaLista();
  }, [abierto, grupos]);

  const elegido = (opcion: string) => seleccion.includes(opcion);

  function alternar(opcion: string) {
    onChange(
      elegido(opcion)
        ? seleccion.filter((o) => o !== opcion)
        : [...seleccion, opcion],
    );
  }

  function alternarGrupo(grupo: GrupoCasillas, marcar: boolean) {
    onChange(
      marcar
        ? [...new Set([...seleccion, ...grupo.opciones])]
        : seleccion.filter((o) => !grupo.opciones.includes(o)),
    );
  }

  const puesto = seleccion.length > 0;

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
        className={`flex h-07 cursor-pointer items-center gap-02 rounded-md border bg-background-base px-03 transition-colors motion-micro-states ${
          puesto
            ? "border-border-high text-content-high"
            : "border-border-low text-content-mid"
        }`}
      >
        <Text variant="body-s" as="span" color={puesto ? "high" : "mid"}>
          {puesto ? `${nombre} (${seleccion.length})` : nombre}
        </Text>
        <Icon
          name="chevron-down"
          size={16}
          className={`transition-transform motion-micro-states ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div
          style={{ width: ANCHO }}
          className="anim-aparece absolute top-[calc(100%+var(--spacing-02))] right-0 z-20 overflow-hidden rounded-lg border border-border-low bg-background-base shadow-md"
        >
          <div
            ref={lista}
            onScroll={comprobarSiQuedaLista}
            style={{ maxHeight: ALTO_MAXIMO }}
            className="overflow-y-auto"
          >
            {grupos.map((grupo, i) => {
              const marcadas = grupo.opciones.filter(elegido).length;
              const todas = marcadas === grupo.opciones.length;
              return (
                <div
                  key={grupo.rotulo}
                  className={i > 0 ? "border-t border-border-low" : ""}
                >
                  <div className="px-04 py-03">
                    <Checkbox
                      checked={todas}
                      indeterminate={marcadas > 0 && !todas}
                      onChange={(marcar) => alternarGrupo(grupo, marcar)}
                    >
                      <Text variant="label-s-uppercase" color="low" as="span">
                        {grupo.rotulo}
                      </Text>
                    </Checkbox>
                  </div>
                  {grupo.opciones.map((opcion) => (
                    <div key={opcion} className="px-04 pb-03">
                      <Checkbox
                        checked={elegido(opcion)}
                        onChange={() => alternar(opcion)}
                      >
                        {opcion}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* El degradado que avisa de que la lista sigue por debajo. */}
          {hayMas && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-08 bg-gradient-to-t from-background-base to-transparent"
            />
          )}
        </div>
      )}
    </div>
  );
}
