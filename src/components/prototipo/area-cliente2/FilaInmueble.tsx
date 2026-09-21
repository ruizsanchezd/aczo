"use client";

import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { TextoRecortado } from "@/components/ui/TextoRecortado";
import { type LineaDetalle } from "@/mocks/aczo";
import { TablaSuministrosInmueble } from "./TablaSuministrosInmueble";

/**
 * FilaInmueble — un inmueble dentro de una sociedad desplegada, en "Mi cartera".
 *
 * Sin nombre todavía, la fila lee de izquierda a derecha: casa · dirección …
 * CUPS · flecha — es lo único que el OCR lee de la factura, así que es lo
 * único que se puede dar por hecho en cuanto el inmueble entra a la cartera:
 *
 *   🏠 Calle Velázquez nº 10, Alcobendas, Madrid   7 CUPS  ⌄
 *
 * En cuanto tiene nombre (ModalOrganizaCartera, Figma nodo 797:16376), el
 * nombre pasa a mandar y la dirección baja de rango: se queda como apoyo,
 * detrás de una etiqueta con el tipo de inmueble:
 *
 *   🏠 Oficinas Madrid  Oficinas · Calle Velázquez nº 10…   7 CUPS  ⌄
 *
 * EL ENLACE VERDE SUBRAYADO ES SIEMPRE LO QUE SE PUEDE TOCAR — la dirección
 * cuando no hay nombre, el nombre en cuanto lo hay — y en los dos casos abre
 * el mismo modal: el nombre se puede editar siempre que se quiera, no solo la
 * primera vez. Es el mismo patrón que "Ver cartera" del Dashboard.
 *
 * INTERACCIÓN — esto es lo que hay que replicar en producto:
 *
 *   Nombrar y categorizar. Al pulsar el enlace se abre ModalOrganizaCartera
 *   con este inmueble ya desplegado. La categoría decide si el inmueble está
 *   catalogado y, por tanto, si se puede elegir en el filtro de "Inmueble".
 *
 *   Desplegar. La flecha abre la tabla con los puntos de suministro del
 *   inmueble (ver TablaSuministrosInmueble), con la técnica de rejilla
 *   0fr → 1fr del resto del prototipo (macro-levelup).
 */

export function FilaInmueble({
  linea,
  desplegado,
  onDesplegar,
  onEditar,
}: {
  linea: LineaDetalle;
  desplegado: boolean;
  onDesplegar: () => void;
  /** Abre ModalOrganizaCartera con este inmueble ya desplegado. */
  onEditar: () => void;
}) {
  return (
    <li className="rounded-md border border-border-low bg-background-base">
      <div className="flex items-center gap-04 p-03">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-04">
          <div className="flex min-w-0 flex-1 items-center gap-02">
            <Icon name="home" size={16} className="shrink-0 text-content-mid" />
            <button
              type="button"
              onClick={onEditar}
              className="shrink-0 cursor-pointer text-highlight-muted underline transition-opacity motion-micro-states hover:opacity-60"
            >
              <Text variant="body-s" color="highlight-muted" as="span">
                {linea.nombre ?? linea.direccion}
              </Text>
            </button>

            {/* Solo cuando ya tiene nombre: sin él, la dirección YA es el
                enlace de arriba y repetirla aquí sería decir lo mismo dos
                veces. */}
            {linea.nombre && (
              <>
                {linea.categoria && (
                  <Tag tone="outline" className="border border-border-low shrink-0">
                    {linea.categoria}
                  </Tag>
                )}
                <Text variant="body-s" color="low" as="span" className="shrink-0">
                  ·
                </Text>
                <span className="min-w-0">
                  <TextoRecortado color="mid">{linea.direccion}</TextoRecortado>
                </span>
              </>
            )}
          </div>

          <Text variant="body-s" color="low" as="span" className="shrink-0">
            {linea.puntos} CUPS
          </Text>
        </div>

        <button
          type="button"
          aria-expanded={desplegado}
          aria-label={`${desplegado ? "Ocultar" : "Ver"} los suministros de ${linea.nombre ?? linea.direccion}`}
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
