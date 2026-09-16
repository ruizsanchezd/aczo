"use client";

import { useState } from "react";
import { DetalleTecnicoSuministro } from "@/components/prototipo/DetalleTecnicoSuministro";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { Tooltip } from "@/components/ui/Tooltip";
import { ESTADOS_CARTERA, type PuntoDeInmueble } from "@/mocks/aczo";

/**
 * TablaSuministrosInmueble — los puntos de suministro de un inmueble, dentro de
 * "Mi cartera". Es lo que se abre al desplegar la fila de un inmueble.
 *
 * Cuatro columnas: el nombre del punto, si es luz o gas, quién se lo sirve y si
 * lleva mantenimiento. A la derecha, el puntito de su estado y la flecha.
 *
 * INTERACCIÓN Y ANIMACIÓN — esto es lo que hay que replicar en producto:
 *
 *   Cada fila se abre con la MISMA ficha técnica que las tablas de empresas y
 *   particulares (`DetalleTecnicoSuministro`): CUPS, tarifa, consumo, potencia,
 *   perfil y compañía actual. No es una copia parecida, es el mismo componente,
 *   así que los tres sitios cambian a la vez.
 *
 *   Se despliega con la técnica de rejilla 0fr → 1fr del resto del prototipo
 *   (macro-levelup, 350 ms, ease out), y la flecha gira media vuelta con
 *   micro-states — acaba antes que el panel, así que se lee como "esto lo ha
 *   provocado la flecha".
 *
 *   Solo hay una fila abierta a la vez: abrir otra cierra la anterior. Con
 *   siete puntos en un inmueble, dejarlas todas abiertas convertiría la tabla
 *   en una lista larguísima donde ya no se pueden comparar las filas.
 */

/**
 * Las columnas, en la PROPORCIÓN que les da el Figma (106, 121, 151 y el resto
 * para mantenimiento) en vez de en píxeles fijos.
 *
 * Es por una razón práctica: la tabla vive dentro de la lista, y la lista no
 * siempre mide lo mismo — agrupando por ubicación el mapa se lleva mucho ancho
 * y la tabla se queda en poco más de 470 px, donde los anchos del Figma (519)
 * no caben y la última columna se cortaba. Con proporciones se encoge entera y
 * las columnas siguen alineadas con su cabecera.
 *
 * Las dos últimas, `auto`, son el puntito de estado y la flecha.
 */
const COLUMNAS = "106fr 121fr 151fr 110fr auto auto";

export function TablaSuministrosInmueble({
  puntos,
}: {
  puntos: PuntoDeInmueble[];
}) {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      {/* Cabecera */}
      <div
        className="grid items-center gap-02 border-b border-border-low bg-background-low px-03 py-02"
        style={{ gridTemplateColumns: COLUMNAS }}
      >
        <Columna>P. de sum.</Columna>
        <Columna>T. de sum.</Columna>
        <Columna>Comercializadora</Columna>
        <span className="flex min-w-0 items-center gap-01">
          <Text
            variant="label-s-uppercase"
            color="low"
            as="span"
            className="truncate"
          >
            Mantenimiento
          </Text>
          <Tooltip content="Aczo se encarga de las incidencias de la instalación: averías, revisiones y urgencias.">
            <Icon name="info" size={16} className="shrink-0 text-content-low" />
          </Tooltip>
        </span>
        {/* Los huecos del puntito de estado y de la flecha, para que cada
            rótulo caiga justo encima de su columna. */}
        <span className="size-02" />
        <span className="size-04" />
      </div>

      {puntos.map((punto) => {
        const { suministro } = punto;
        const estado = ESTADOS_CARTERA.find((e) => e.id === punto.estado);
        const desplegado = abierto === suministro.id;

        return (
          <div key={suministro.id}>
            <button
              type="button"
              aria-expanded={desplegado}
              onClick={() => setAbierto(desplegado ? null : suministro.id)}
              className="grid w-full cursor-pointer items-center gap-02 border-b border-border-low bg-background-base px-03 py-03 text-left transition-colors motion-micro-states hover:bg-background-low"
              style={{ gridTemplateColumns: COLUMNAS }}
            >
              <span className="min-w-0 truncate">
                <Text variant="label-s" as="span">
                  {suministro.nombre}
                </Text>
              </span>

              <span className="min-w-0">
                <Tag icon={suministro.tipo === "Luz" ? "lightbulb" : "fire"}>
                  {suministro.tipo}
                </Tag>
              </span>

              <span className="min-w-0 truncate">
                <Text variant="label-s" color="mid" as="span">
                  {punto.comercializadora}
                </Text>
              </span>

              <span className="min-w-0">
                <Text variant="label-s" color="mid" as="span">
                  {suministro.detalle.mantenimiento ? "Sí" : "No"}
                </Text>
              </span>

              <span
                className={`size-02 shrink-0 rounded-full ${estado?.color ?? ""}`}
                title={estado?.rotulo}
              />
              <Icon
                name="chevron-down"
                size={16}
                className={`shrink-0 text-content-high transition-transform motion-micro-states ${
                  desplegado ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className="grid transition-[grid-template-rows] motion-macro-levelup"
              style={{ gridTemplateRows: desplegado ? "1fr" : "0fr" }}
              aria-hidden={!desplegado}
            >
              <div className="overflow-hidden">
                <DetalleTecnicoSuministro
                  suministro={suministro}
                  compacto
                  etiquetaCups="Punto de suministro (CUPS)"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Un rótulo de columna. */
function Columna({ children }: { children: React.ReactNode }) {
  return (
    <span className="min-w-0 truncate">
      <Text variant="label-s-uppercase" color="low" as="span">
        {children}
      </Text>
    </span>
  );
}
