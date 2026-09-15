"use client";

import { useMemo, useState } from "react";
import { Text } from "./Text";

/**
 * GraficaAnillo — el reparto de un total entre varios, en un anillo.
 *
 * En "Mi cartera" ocupa el sitio del mapa cuando la lista NO va agrupada por
 * ubicación: agrupando por sociedad, comercializadora o inmueble, lo que se
 * quiere comparar no es dónde está cada cosa sino cuánto pesa cada una, y para
 * eso un anillo dice en un vistazo lo que un mapa no puede decir.
 *
 * En el centro va el total, que es el dato que ancla todo lo demás: cada tramo
 * se lee como "su parte de esos 100".
 *
 * INTERACCIÓN Y ANIMACIÓN — esto es lo que hay que replicar en producto:
 *
 *   Se dibuja al entrar. Los tramos no aparecen de golpe: se van dibujando uno
 *   detrás de otro, como si alguien recorriera la circunferencia con un
 *   rotulador (anim-anillo-entra, macro-structure: 500 ms, ease in out, con
 *   80 ms entre tramo y tramo). Un anillo que aparece entero es un dibujo; uno
 *   que se dibuja se lee como "esto se está calculando delante de ti" — que es
 *   justo lo que pasa cada vez que cambias un filtro. Por eso se vuelve a
 *   dibujar cuando cambian los datos.
 *
 *   Al pasar por encima de un tramo, los demás bajan de intensidad y ese se
 *   separa un poco hacia fuera (motion-micro-states). Es lo mismo que hace el
 *   mapa al señalar una provincia, y por lo mismo: contestar "¿cuál es este?"
 *   sin tener que buscarlo en la leyenda.
 *
 *   Pulsar un tramo lo marca, igual que pulsar su fila en la lista.
 */

/** Lado del lienzo. No es un token: es la geometría del propio dibujo. */
const LIENZO = 200;
/** Radio de la línea central del anillo y su grosor. */
const RADIO = 76;
const GROSOR = 30;
/** Hueco entre tramos, en unidades del lienzo. */
const HUECO = 2;
/** Cuánto espera cada tramo respecto al anterior al dibujarse. */
const ESCALONADO_MS = 80;

export type SegmentoAnillo = {
  id: string;
  etiqueta: string;
  valor: number;
  /** Color del tramo. Viene del dato, no del sistema. */
  color: string;
};

export function GraficaAnillo({
  segmentos,
  unidad,
  seleccionado,
  onSeleccionar,
}: {
  segmentos: SegmentoAnillo[];
  /** Qué se está contando. Va bajo el total, en el centro. */
  unidad: string;
  /** id del tramo marcado en la lista, o null. Los demás se apagan. */
  seleccionado?: string | null;
  onSeleccionar?: (id: string) => void;
}) {
  const [encima, setEncima] = useState<string | null>(null);

  const total = segmentos.reduce((t, s) => t + s.valor, 0);
  const circunferencia = 2 * Math.PI * RADIO;

  /**
   * Cada tramo con su largo y el giro que lo coloca en su sitio.
   *
   * Se calcula todo ANTES de pintar, acumulando el recorrido: cada tramo
   * empieza donde acabó el anterior.
   */
  const tramos = useMemo(() => {
    // Lo que ocupa cada tramo en la circunferencia.
    const partes = segmentos.map((s) =>
      total ? (s.valor / total) * circunferencia : 0,
    );
    return segmentos.map((segmento, i) => ({
      segmento,
      // Se le resta el hueco para que los tramos no se toquen entre sí.
      largo: Math.max(partes[i] - HUECO, 0),
      // Empieza donde acaban todos los anteriores.
      giro:
        (partes.slice(0, i).reduce((t, p) => t + p, 0) / circunferencia) * 360,
    }));
  }, [segmentos, total, circunferencia]);

  return (
    <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
      <svg
        viewBox={`0 0 ${LIENZO} ${LIENZO}`}
        className="block h-full w-full"
        role="img"
        aria-label={`Reparto de ${total} ${unidad} entre ${segmentos.length} grupos`}
      >
        {/* Se gira un cuarto de vuelta para que el primer tramo arranque
            arriba del todo y no a las tres en punto, que es donde empiezan los
            ángulos en SVG. */}
        <g transform={`rotate(-90 ${LIENZO / 2} ${LIENZO / 2})`}>
          {tramos.map(({ segmento, largo, giro }, i) => {
            // Un tramo se apaga si hay OTRO señalado con el ratón, o si hay
            // otro marcado en la lista. Señalar manda sobre marcar: es lo que
            // estás mirando ahora mismo.
            const marcado = seleccionado === segmento.id;
            const atenuado =
              encima !== null
                ? encima !== segmento.id
                : !!seleccionado && !marcado;
            const resaltado = encima === segmento.id || marcado;

            return (
              <circle
                key={segmento.id}
                cx={LIENZO / 2}
                cy={LIENZO / 2}
                r={RADIO}
                fill="none"
                stroke={segmento.color}
                strokeWidth={resaltado ? GROSOR + 6 : GROSOR}
                // El tramo se dibuja con una línea de puntos de un solo trazo:
                // su largo, y el resto del círculo en blanco.
                strokeDasharray={`${largo} ${circunferencia}`}
                // Cada tramo se COLOCA girándolo, no desplazando su línea de
                // puntos: ese desplazamiento es justo lo que anima la entrada,
                // y usarlo para las dos cosas haría que se pisaran.
                transform={`rotate(${giro} ${LIENZO / 2} ${LIENZO / 2})`}
                className="anim-anillo-entra transition-[opacity,stroke-width] motion-micro-states"
                style={
                  {
                    "--largo": `${largo}px`,
                    opacity: atenuado ? 0.35 : 1,
                    animationDelay: `${i * ESCALONADO_MS}ms`,
                    cursor: onSeleccionar ? "pointer" : undefined,
                  } as React.CSSProperties
                }
                onMouseEnter={() => setEncima(segmento.id)}
                onMouseLeave={() => setEncima(null)}
                onClick={() => onSeleccionar?.(segmento.id)}
              />
            );
          })}
        </g>
      </svg>

      {/* El total, en el centro. Fuera del SVG para poder usar la tipografía
          del sistema tal cual. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <Text variant="heading-m" as="p">
          {encima
            ? (segmentos.find((s) => s.id === encima)?.valor ?? total)
            : total}
        </Text>
        <Text
          variant="body-s"
          color="low"
          as="p"
          className="max-w-[60%] text-center"
        >
          {encima
            ? (segmentos.find((s) => s.id === encima)?.etiqueta ?? unidad)
            : unidad}
        </Text>
      </div>
    </div>
  );
}
