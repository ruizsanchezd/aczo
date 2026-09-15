"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import {
  CATEGORIAS_INMUEBLE,
  ESTADOS_CARTERA,
  type CategoriaInmueble,
  type LineaDetalle,
} from "@/mocks/aczo";

/**
 * FilaInmueble — un inmueble dentro de una sociedad desplegada, en "Mi cartera".
 *
 * Lee de izquierda a derecha: casa · nombre · dirección … CUPS · flecha.
 *
 *   🏠 Edificio Oficinas Madrid  ·  Calle Velázquez nº 10…   7 CUPS  ⌄
 *
 * La categoría (Oficinas, Almacén…) NO se enseña en la fila: la fila es para
 * localizar el inmueble, y para eso mandan el nombre y la dirección. La
 * categoría sigue estando en el dato — es lo que decide si un inmueble está
 * catalogado y, por tanto, si se puede elegir en el filtro de "Inmueble".
 *
 * EL NOMBRE VA SUBRAYADO a propósito: en el Figma es un DS Button terciario, no
 * un texto. El subrayado es lo que avisa de que ese trozo se puede tocar. Y
 * cuando el inmueble aún no tiene nombre ni categoría (llegó de una factura y
 * nadie lo ha clasificado), ese mismo botón pasa a decir "Categoriza este
 * inmueble": la fila no se rompe, solo cambia lo que pide.
 *
 * Ojo: el `Button` del sistema NO subraya su etiqueta, y el DS Button terciario
 * del Figma sí. Se añade aquí con una clase en lugar de tocar el componente
 * compartido, porque cambiarlo afectaría a las diez pantallas que ya lo usan.
 * Si se confirma que el terciario debe ir siempre subrayado, el sitio de
 * arreglarlo es `Button.tsx` y esta clase sobra.
 *
 * INTERACCIÓN — esto es lo que hay que replicar en producto:
 *
 *   Categorizar. Al pulsar el nombre (o "Categoriza este inmueble") sale en su
 *   sitio un desplegable con las categorías. Al elegir una, la fila vuelve a su
 *   forma normal ya con su etiqueta. Entra y sale con motion-micro-states, sin
 *   mover nada de alrededor.
 *
 *   Desplegar. La flecha abre el reparto de los CUPS de ese inmueble, con la
 *   técnica de rejilla 0fr → 1fr del resto del prototipo (macro-levelup).
 *   ⚠️ En el Figma esta flecha está solo en su estado cerrado: lo que hay
 *   debajo NO está diseñado todavía. Aquí se enseña lo que ya se sabe del
 *   inmueble (luz/gas y en qué estado están sus puntos) para que el control no
 *   quede muerto. Cuando exista el diseño de ese nivel, se sustituye.
 */

export function FilaInmueble({
  linea,
  desplegado,
  onDesplegar,
  categorizando,
  onCategorizar,
  onElegirCategoria,
}: {
  linea: LineaDetalle;
  desplegado: boolean;
  onDesplegar: () => void;
  /** true si esta fila tiene abierto el desplegable de categorías. */
  categorizando: boolean;
  onCategorizar: () => void;
  onElegirCategoria: (categoria: CategoriaInmueble) => void;
}) {
  const sinClasificar = !linea.categoria;
  // Qué dice el botón: el nombre si lo tiene; si no, su categoría (es lo único
  // que se sabe de él); y si no tiene ninguna de las dos, la llamada a
  // catalogarlo.
  const rotulo = linea.nombre ?? linea.categoria ?? "Categoriza este inmueble";

  return (
    <li className="rounded-md border border-border-low bg-background-base">
      <div className="flex items-center gap-04 p-03">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-04">
          <div className="flex min-w-0 items-center gap-02">
            {categorizando ? (
              <select
                autoFocus
                aria-label={`Categoría de ${linea.direccion}`}
                defaultValue={linea.categoria ?? ""}
                onChange={(e) =>
                  onElegirCategoria(e.target.value as CategoriaInmueble)
                }
                onBlur={onCategorizar}
                className="h-07 cursor-pointer rounded-md border border-border-mid bg-background-base px-02 text-label-s text-content-high"
              >
                <option value="" disabled>
                  Elige una categoría
                </option>
                {CATEGORIAS_INMUEBLE.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <Button
                variant="tertiary"
                size="small"
                iconStart="home"
                onClick={onCategorizar}
                className="px-00 underline"
              >
                {rotulo}
              </Button>
            )}

            <Text variant="label-m" color="mid" as="span">
              ·
            </Text>
            <Text variant="label-s" color="mid" as="span" className="truncate">
              {linea.direccion}
            </Text>
          </div>

          <Text variant="body-s" color="low" as="span" className="shrink-0">
            {linea.puntos} CUPS
          </Text>
        </div>

        <button
          type="button"
          aria-expanded={desplegado}
          aria-label={`${desplegado ? "Ocultar" : "Ver"} los suministros de ${
            linea.nombre ?? linea.direccion
          }`}
          onClick={onDesplegar}
          className="flex cursor-pointer shrink-0 items-center text-content-high transition-opacity motion-micro-states hover:opacity-60"
        >
          <Icon
            name="chevron-down"
            size={16}
            className={`transition-transform motion-micro-states ${desplegado ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Reparto de los CUPS del inmueble (ver el aviso de la cabecera). */}
      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: desplegado ? "1fr" : "0fr" }}
        aria-hidden={!desplegado}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-04 border-t border-border-low px-03 py-03">
            <span className="flex items-center gap-01">
              {linea.tipos.map((tipo) => (
                <Tag key={tipo} icon={tipo === "luz" ? "lightbulb" : "fire"}>
                  {tipo === "luz" ? "Luz" : "Gas"}
                </Tag>
              ))}
            </span>
            {ESTADOS_CARTERA.filter((e) => linea.estados[e.id] > 0).map(
              (estado) => (
                <PuntoEstado
                  key={estado.id}
                  color={estado.color}
                  rotulo={estado.rotulo}
                  cantidad={linea.estados[estado.id]}
                  estirado={false}
                />
              ),
            )}
            {sinClasificar && (
              <Text variant="body-s" color="low" as="span">
                Sin categorizar
              </Text>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
