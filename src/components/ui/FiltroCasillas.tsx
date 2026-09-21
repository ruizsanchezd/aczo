"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Checkbox } from "./Checkbox";
import { Icon } from "./Icon";
import { Text } from "./Text";

/**
 * FiltroCasillas — un filtro de la barra de "Mi cartera", con su lista
 * desplegable de casillas. Todos los filtros de esa barra son así: se puede
 * elegir MÁS DE UNA cosa, y no elegir ninguna quiere decir "todas".
 *
 * Sirve para los cinco, que solo se diferencian en lo que meten dentro:
 *
 *   lista llana      Tipo de suministro (Luz/Gas), Estado, Sociedad, Inmueble
 *   lista agrupada   Dirección — un encabezado por provincia y sus direcciones
 *   con pie          Inmueble — debajo de la lista, el bloque "Organiza tu
 *                    cartera" que se pasa por `pie`
 *
 * INTERACCIÓN — esto es lo que hay que replicar en producto:
 *
 *   Abrir. La lista aparece pegada al botón con anim-aparece (micro-appear,
 *   350 ms) y la flecha gira media vuelta con micro-states. Se cierra pulsando
 *   fuera, con Escape, o volviendo a pulsar el botón. Solo puede haber UNO
 *   abierto: por eso quién está abierto lo lleva la pantalla, no el componente.
 *
 *   Encabezados a medias. Si de un grupo hay elegidas unas opciones sí y otras
 *   no, su casilla se queda en el estado "indeterminado" (la rayita en vez del
 *   check). Es lo que evita tener que bajar la lista para saber si ahí dentro
 *   hay algo marcado.
 *
 *   El degradado de abajo. Cuando quedan opciones por debajo del borde, la
 *   última se difumina. No es decoración: es lo que avisa de que la lista
 *   sigue. Desaparece al llegar al final, así que también sirve de "ya está".
 *
 *   La cuenta en el botón. Con algo elegido, el botón dice "Dirección (3)" y se
 *   oscurece: así se ve de un vistazo qué filtros están puestos sin abrir
 *   ninguno.
 */

export type OpcionCasilla = { value: string; label: string };

export type GrupoCasillas = {
  /** Encabezado del grupo. Si no se pasa, el grupo va sin encabezado. */
  rotulo?: string;
  opciones: OpcionCasilla[];
};

/**
 * Medidas del propio desplegable, en píxeles. No son valores del sistema de
 * diseño (no hay un token para "cuánto mide una lista antes de rodar"), así que
 * van aquí a la vista y no repartidas por las clases.
 */
const ANCHO = 320;
const ALTO_MAXIMO = 340;

export function FiltroCasillas({
  nombre,
  grupos,
  seleccion,
  onChange,
  abierto,
  onAbrir,
  pie,
}: {
  nombre: string;
  grupos: GrupoCasillas[];
  seleccion: string[];
  onChange: (seleccion: string[]) => void;
  abierto: boolean;
  /** Avisa de que hay que abrir este filtro (true) o cerrarlo (false). */
  onAbrir: (abrir: boolean) => void;
  /** Bloque suelto debajo de la lista. Lo usa el filtro de Inmueble. */
  pie?: ReactNode;
}) {
  const [hayMas, setHayMas] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  // Cerrar al pulsar fuera o con Escape.
  useEffect(() => {
    if (!abierto) return;

    function fuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) onAbrir(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") onAbrir(false);
    }

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto, onAbrir]);

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

  const elegido = (valor: string) => seleccion.includes(valor);

  function alternar(valor: string) {
    onChange(
      elegido(valor)
        ? seleccion.filter((o) => o !== valor)
        : [...seleccion, valor],
    );
  }

  function alternarGrupo(grupo: GrupoCasillas, marcar: boolean) {
    const valores = grupo.opciones.map((o) => o.value);
    onChange(
      marcar
        ? [...new Set([...seleccion, ...valores])]
        : seleccion.filter((o) => !valores.includes(o)),
    );
  }

  const puesto = seleccion.length > 0;
  const hayLista = grupos.some((g) => g.opciones.length > 0);

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => onAbrir(!abierto)}
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
          {hayLista && (
            <div className="relative">
              <div
                ref={lista}
                onScroll={comprobarSiQuedaLista}
                style={{ maxHeight: ALTO_MAXIMO }}
                className="overflow-y-auto py-02"
              >
                {grupos.map((grupo, i) => {
                  const valores = grupo.opciones.map((o) => o.value);
                  const marcadas = valores.filter(elegido).length;
                  const todas =
                    valores.length > 0 && marcadas === valores.length;
                  return (
                    <div
                      key={grupo.rotulo ?? i}
                      className={
                        i > 0 ? "mt-02 border-t border-border-low pt-02" : ""
                      }
                    >
                      {grupo.rotulo && (
                        <div className="px-04 py-02">
                          <Checkbox
                            checked={todas}
                            indeterminate={marcadas > 0 && !todas}
                            onChange={(marcar) => alternarGrupo(grupo, marcar)}
                          >
                            <Text
                              variant="label-s-uppercase"
                              color="low"
                              as="span"
                            >
                              {grupo.rotulo}
                            </Text>
                          </Checkbox>
                        </div>
                      )}
                      {grupo.opciones.map((opcion) => (
                        <div key={opcion.value} className="px-04 py-02">
                          <Checkbox
                            checked={elegido(opcion.value)}
                            onChange={() => alternar(opcion.value)}
                          >
                            {opcion.label}
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

          {/* Sin lista y sin pie: en vez de un recuadro flotante vacío (se
              lee como que algo se ha roto), un aviso explica por qué no hay
              nada que marcar — pasa, por ejemplo, cuando otro filtro ya ha
              recortado la cartera hasta dejar este sin ninguna opción. */}
          {!hayLista && !pie && (
            <div className="p-04">
              <Text variant="body-s" color="mid" as="p">
                No hay opciones para {nombre.toLowerCase()} con los filtros
                puestos.
              </Text>
            </div>
          )}

          {pie && (
            <div className={hayLista ? "border-t border-border-low" : ""}>
              {pie}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
