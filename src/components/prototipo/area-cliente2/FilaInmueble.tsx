"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { TextoRecortado } from "@/components/ui/TextoRecortado";
import {
  CATEGORIAS_INMUEBLE,
  type CategoriaInmueble,
  type LineaDetalle,
} from "@/mocks/aczo";
import { TablaSuministrosInmueble } from "./TablaSuministrosInmueble";

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
 *   Desplegar. La flecha abre la tabla con los puntos de suministro del
 *   inmueble (ver TablaSuministrosInmueble), con la técnica de rejilla
 *   0fr → 1fr del resto del prototipo (macro-levelup).
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
            <span className="min-w-0">
              <TextoRecortado color="mid">{linea.direccion}</TextoRecortado>
            </span>
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

      {/* Los puntos de suministro del inmueble, uno por fila. */}
      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: desplegado ? "1fr" : "0fr" }}
        aria-hidden={!desplegado}
      >
        <div className="overflow-hidden">
          <TablaSuministrosInmueble puntos={linea.suministros} />
        </div>
      </div>
    </li>
  );
}
