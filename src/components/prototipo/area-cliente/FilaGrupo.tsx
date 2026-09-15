"use client";

import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import {
  ESTADOS_CARTERA,
  type CategoriaInmueble,
  type GrupoCartera,
} from "@/mocks/aczo";
import { FilaInmueble } from "./FilaInmueble";

/**
 * FilaGrupo — una fila de la lista de "Mi cartera".
 *
 * Vale para las cuatro agrupaciones (ubicación, sociedad, comercializadora e
 * inmueble) porque las cuatro producen la misma forma de dato: un
 * `GrupoCartera` con sus provincias, sus inmuebles y sus puntos. Ver
 * `agruparCartera` en mocks.
 *
 * Tiene dos formas, y la elige quien la usa con `apilado`: con el estado a la
 * derecha (lista ancha) o debajo del nombre (lista estrecha, que es como queda
 * agrupando por ubicación porque ahí el mapa se lleva más sitio).
 *
 * INTERACCIÓN — esto es lo que hay que replicar en producto:
 *
 *   Marcar. Pulsar la fila la MARCA, y al marcarla el mapa de al lado se apaga
 *   y solo enciende las provincias de esa fila. Volver a pulsarla la desmarca y
 *   el mapa vuelve a enseñarlo todo. Un solo gesto para las dos cosas: nunca
 *   hace falta buscar un botón de "quitar filtro".
 *
 *   Cómo se ve que está marcada: el borde y el cuadrado del icono se pintan del
 *   color de la fila — el MISMO color con el que se enciende en el mapa. Ese
 *   color compartido es lo que ata la lista y el mapa; sin él, serían dos cosas
 *   que cambian a la vez sin que se entienda por qué.
 *   Transición: motion-micro-states (200 ms, lineal).
 *
 *   Desplegar. El chevron de la derecha abre el detalle. Se abre con
 *   motion-macro-levelup (350 ms, ease out) porque es "entrar en un detalle",
 *   igual que el resto de desplegables del prototipo, y el chevron gira media
 *   vuelta a la vez.
 */

/**
 * Los puntitos de estado de un grupo.
 *
 * "Activas" no se enseña: en una cartera sana son casi todas, y lo que interesa
 * de un vistazo es lo que NO está ya resuelto.
 */
function Estados({ grupo }: { grupo: GrupoCartera }) {
  return (
    <span className="flex flex-wrap items-center gap-03">
      {ESTADOS_CARTERA.filter(
        (e) => e.id !== "activa" && grupo.estados[e.id] > 0,
      ).map((estado) => (
        <PuntoEstado
          key={estado.id}
          color={estado.color}
          rotulo={estado.rotulo}
          cantidad={grupo.estados[estado.id]}
          estirado={false}
        />
      ))}
    </span>
  );
}

export function FilaGrupo({
  grupo,
  marcado,
  desplegado,
  onMarcar,
  onDesplegar,
  apilado = false,
  inmuebleDesplegado,
  onDesplegarInmueble,
  inmuebleCategorizando,
  onCategorizarInmueble,
  onElegirCategoria,
}: {
  grupo: GrupoCartera;
  marcado: boolean;
  desplegado: boolean;
  onMarcar: () => void;
  onDesplegar: () => void;
  /**
   * Apila el estado DEBAJO del nombre en vez de mandarlo a la derecha. Es la
   * forma de la fila cuando la lista va estrecha — agrupando por ubicación, el
   * mapa se lleva más ancho y la fila ya no tiene sitio para una sola línea.
   */
  apilado?: boolean;
  /** id del inmueble que tiene abierto su detalle, o null. */
  inmuebleDesplegado: string | null;
  onDesplegarInmueble: (id: string) => void;
  /** id del inmueble que tiene abierto el desplegable de categorías, o null. */
  inmuebleCategorizando: string | null;
  onCategorizarInmueble: (id: string) => void;
  onElegirCategoria: (id: string, categoria: CategoriaInmueble) => void;
}) {
  return (
    <div
      className="rounded-md border bg-background-low transition-colors motion-micro-states"
      // El color viene del dato, no del sistema: por eso va por `style` y no
      // como clase. Ver el comentario de `color` en SOCIEDADES_CARTERA.
      style={{
        borderColor: marcado ? grupo.color : "var(--color-border-low)",
      }}
    >
      <div className="flex items-center justify-between gap-04 p-04">
        <button
          type="button"
          aria-pressed={marcado}
          onClick={onMarcar}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-04 text-left"
        >
          <span
            className="flex size-08 shrink-0 items-center justify-center rounded-md text-highlight-soft transition-colors motion-micro-states"
            style={{
              backgroundColor: marcado
                ? grupo.color
                : "var(--color-highlight-deep)",
            }}
          >
            <Icon name="building-office" />
          </span>

          <span className="flex min-w-0 flex-col gap-01">
            <span className="flex min-w-0 flex-wrap items-center gap-04">
              <Text variant="label-m" as="span">
                {grupo.nombre}
              </Text>
              <span className="flex items-center gap-02">
                <Text variant="body-m" color="low" as="span">
                  {grupo.inmuebles}{" "}
                  {grupo.inmuebles === 1 ? "inmueble" : "inmuebles"}
                </Text>
                <Text variant="body-m" color="low" as="span">
                  ·
                </Text>
                <Text variant="body-m" color="low" as="span">
                  {grupo.puntos}{" "}
                  {grupo.puntos === 1
                    ? "punto de suministro"
                    : "puntos de suministro"}
                </Text>
              </span>
            </span>

            {/* Apilado: el estado baja a su propia línea, debajo del nombre. */}
            {apilado && <Estados grupo={grupo} />}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-03">
          {!apilado && <Estados grupo={grupo} />}

          <button
            type="button"
            aria-expanded={desplegado}
            aria-label={`${desplegado ? "Ocultar" : "Ver"} el detalle de ${grupo.nombre}`}
            onClick={onDesplegar}
            className="flex cursor-pointer items-center rounded-md p-02 text-content-high transition-opacity motion-micro-states hover:opacity-60"
          >
            <Icon
              name="chevron-down"
              className={`transition-transform motion-micro-states ${desplegado ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Misma técnica de despliegue que el resto del prototipo (ver
          TablaAhorro): una rejilla de una fila que pasa de 0fr a 1fr. No se
          anima `height` porque no se puede animar hasta un alto desconocido. */}
      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: desplegado ? "1fr" : "0fr" }}
        aria-hidden={!desplegado}
      >
        <div className="overflow-hidden">
          {/* Los inmuebles del grupo, uno por fila. Agrupando por sociedad son
              los suyos; agrupando por ubicación o comercializadora, los que
              caen en esa provincia o en esa compañía. */}
          <ul className="flex flex-col gap-03 px-04 pb-04">
            {grupo.detalle.map((linea) => (
              <FilaInmueble
                key={linea.id}
                linea={linea}
                desplegado={inmuebleDesplegado === linea.id}
                onDesplegar={() => onDesplegarInmueble(linea.id)}
                categorizando={inmuebleCategorizando === linea.id}
                onCategorizar={() => onCategorizarInmueble(linea.id)}
                onElegirCategoria={(categoria) =>
                  onElegirCategoria(linea.id, categoria)
                }
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
