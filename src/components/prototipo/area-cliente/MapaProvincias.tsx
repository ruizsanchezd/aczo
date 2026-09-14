"use client";

import { useMemo, useState } from "react";
import { MAPA_ALTO, MAPA_ANCHO, PROVINCIAS } from "@/mocks/provincias-espana";
import type { GrupoCartera } from "@/mocks/aczo";
import { Text } from "@/components/ui/Text";

/**
 * MapaProvincias — el mapa de España de "Mi cartera".
 *
 * QUÉ HACE
 *   En reposo pinta cada provincia del color de la sociedad que más puntos de
 *   suministro tiene allí. Al marcar una fila de la lista, el mapa se apaga y
 *   solo se encienden las provincias de esa fila, con su color.
 *
 * INTERACCIÓN Y ANIMACIÓN — esto es lo que hay que replicar en producto:
 *
 *   1. Encendido escalonado. Al marcar una fila, sus provincias no aparecen
 *      todas a la vez: se encienden de norte a sur, con 40 ms entre una y la
 *      siguiente. Es un gesto cortísimo (seis provincias son 240 ms de punta a
 *      punta) pero convierte un cambio de color plano en un recorrido que la
 *      vista puede seguir, y deja claro que las provincias que se encienden
 *      son un conjunto y no un cambio suelto.
 *      Entrada de cada provincia: anim-aparece-simple (motion-micro-appear,
 *      350 ms, ease in).
 *
 *   2. Al pasar por encima. La provincia señalada se queda a plena intensidad
 *      y las demás bajan a 55 % de opacidad (motion-micro-states, 200 ms). No
 *      se mueve nada: el mapa es un dato, no un botón, y moverlo lo haría
 *      parecer pulsable.
 *
 *   3. Latido del marcador. Sobre la provincia principal de la fila marcada
 *      late un marcador de tres aros escalonados (anim-pulso-mapa). Sale del
 *      Figma, donde está dibujado como tres círculos concéntricos sobre Madrid;
 *      aquí se pone en movimiento y sigue a la sociedad que se marque.
 *
 *   4. El globo con el detalle aparece con anim-aparece (motion-micro-appear) y
 *      desaparece de golpe al salir, que es lo que se espera de un globo de
 *      información: si tardase en irse, estorbaría al mirar la provincia de al
 *      lado.
 *
 * COLORES — excepción consciente a "tokens siempre":
 *   El mar, la tierra y las fronteras son colores de cartografía, no de
 *   interfaz: no hay (ni tiene mucho sentido que haya) un token del sistema
 *   para "mar". Están muestreados de la imagen del mapa del Figma. El color de
 *   cada provincia encendida tampoco es un token: viene del dato (ver el
 *   comentario de `color` en SOCIEDADES_CARTERA, en mocks/aczo.ts).
 */

/** Colores de la base del mapa, muestreados de la imagen del Figma. */
const MAR = "#B8D6EF";
const TIERRA = "#D2D2D2";
const FRONTERA = "#B5B5B5";

/** Cuánto espera cada provincia respecto a la anterior al encenderse. */
const ESCALONADO_MS = 40;

/** Opacidad de las provincias que NO están señaladas con el ratón. */
const ATENUADA = 0.55;

export function MapaProvincias({
  grupos,
  seleccionado,
}: {
  grupos: GrupoCartera[];
  /** id del grupo marcado en la lista, o null si no hay ninguno. */
  seleccionado: string | null;
}) {
  const [encima, setEncima] = useState<string | null>(null);

  const grupoMarcado = grupos.find((g) => g.id === seleccionado);

  /**
   * Qué hay en cada provincia, SOLO de lo que se ve en la lista.
   *
   * Es importante que salga de `grupos` y no de todos los datos: así, si los
   * filtros dejan la lista vacía, el mapa se apaga entero en vez de seguir
   * enseñando una cartera que no está a la vista.
   */
  const porProvincia = useMemo(() => {
    const mapa = new Map<
      string,
      { sociedad: string; color: string; puntos: number }[]
    >();
    for (const grupo of grupos) {
      for (const linea of grupo.detalle) {
        const lista = mapa.get(linea.provincia) ?? [];
        const ya = lista.find((x) => x.sociedad === linea.sociedad);
        if (ya) ya.puntos += linea.puntos;
        else
          lista.push({
            sociedad: linea.sociedad,
            color: grupo.color,
            puntos: linea.puntos,
          });
        mapa.set(linea.provincia, lista);
      }
    }
    for (const lista of mapa.values())
      lista.sort((a, b) => b.puntos - a.puntos);
    return mapa;
  }, [grupos]);

  // De qué color va cada provincia:
  //   sin nada marcado → el de quien más puntos tiene allí
  //   con algo marcado → el del grupo marcado, y solo en SUS provincias
  const colores = useMemo(() => {
    const mapa = new Map<string, string>();
    if (grupoMarcado) {
      for (const provincia of grupoMarcado.provincias) {
        mapa.set(provincia, grupoMarcado.color);
      }
    } else {
      for (const [provincia, lista] of porProvincia) {
        mapa.set(provincia, lista[0].color);
      }
    }
    return mapa;
  }, [porProvincia, grupoMarcado]);

  // Las provincias encendidas, de norte a sur: es el orden en el que se
  // encienden (ver el punto 1 de la cabecera).
  const encendidas = useMemo(
    () =>
      PROVINCIAS.filter((p) => colores.has(p.nombre)).sort(
        (a, b) => a.cy - b.cy,
      ),
    [colores],
  );

  // El marcador late sobre la provincia con más puntos del grupo marcado.
  const marcador = useMemo(() => {
    if (!grupoMarcado) return undefined;
    const puntosPorProvincia = new Map<string, number>();
    for (const linea of grupoMarcado.detalle) {
      puntosPorProvincia.set(
        linea.provincia,
        (puntosPorProvincia.get(linea.provincia) ?? 0) + linea.puntos,
      );
    }
    const principal = [...puntosPorProvincia].sort((a, b) => b[1] - a[1])[0];
    const provincia = PROVINCIAS.find((p) => p.nombre === principal?.[0]);
    return provincia && { provincia, color: grupoMarcado.color };
  }, [grupoMarcado]);

  const detalleGlobo = encima ? porProvincia.get(encima) : undefined;
  const provinciaEncima = encima
    ? PROVINCIAS.find((p) => p.nombre === encima)
    : undefined;

  return (
    // El recorte del mapa va en el div de DENTRO, no en este: si estuviera
    // aquí, el globo de una provincia del norte se cortaría por arriba.
    <div
      className="relative"
      style={{ aspectRatio: `${MAPA_ANCHO} / ${MAPA_ALTO}` }}
    >
      <div className="h-full overflow-hidden rounded-md">
        <svg
          viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`}
          className="block h-full w-full"
          role="img"
          aria-label={
            grupoMarcado
              ? `Mapa de España con las provincias de ${grupoMarcado.nombre} destacadas`
              : "Mapa de España con las provincias donde la cartera tiene suministros"
          }
        >
          <rect width={MAPA_ANCHO} height={MAPA_ALTO} fill={MAR} />

          {/* Capa de abajo: España entera en gris. No se mueve nunca. */}
          <g>
            {PROVINCIAS.map((p) => (
              <path
                key={p.nombre}
                d={p.d}
                fill={TIERRA}
                stroke={FRONTERA}
                strokeWidth={0.4}
              />
            ))}
          </g>

          {/*
          Capa de arriba: solo las provincias encendidas, con su color.
          La `key` del grupo va a propósito: al cambiar lo que está marcado,
          React rehace estos trazados y la animación de entrada se lanza otra
          vez desde cero. Sin eso el navegador reutilizaría los nodos y el
          encendido escalonado no se vería.
        */}
          <g key={seleccionado ?? "todas"}>
            {encendidas.map((p, i) => (
              <path
                key={p.nombre}
                d={p.d}
                fill={colores.get(p.nombre)}
                stroke={FRONTERA}
                strokeWidth={0.4}
                className="anim-aparece-simple transition-opacity motion-micro-states"
                style={{
                  animationDelay: `${i * ESCALONADO_MS}ms`,
                  opacity: encima && encima !== p.nombre ? ATENUADA : 1,
                }}
                onMouseEnter={() => setEncima(p.nombre)}
                onMouseLeave={() => setEncima(null)}
              />
            ))}
          </g>

          {/* El marcador que late sobre la provincia principal del grupo. */}
          {marcador && (
            <g key={`marcador-${seleccionado}`}>
              {[0, 800, 1600].map((retardo) => (
                <circle
                  key={retardo}
                  cx={marcador.provincia.cx}
                  cy={marcador.provincia.cy}
                  r={3}
                  fill={marcador.color}
                  className="anim-pulso-mapa"
                  style={{ animationDelay: `${retardo}ms` }}
                />
              ))}
              <circle
                cx={marcador.provincia.cx}
                cy={marcador.provincia.cy}
                r={4}
                fill="var(--color-background-always-light)"
              />
              <circle
                cx={marcador.provincia.cx}
                cy={marcador.provincia.cy}
                r={2}
                fill={marcador.color}
              />
            </g>
          )}
        </svg>
      </div>

      {/* El globo de información. Va fuera del SVG para poder usar los tokens
          de tipografía y la sombra del sistema tal cual. Se coloca en
          porcentajes sobre el mismo lienzo, así que sigue a su provincia
          aunque el mapa cambie de tamaño. */}
      {detalleGlobo && provinciaEncima && (
        <div
          className="anim-aparece pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-background-inverse px-03 py-02 shadow-md"
          style={{
            left: `${(provinciaEncima.cx / MAPA_ANCHO) * 100}%`,
            top: `${(provinciaEncima.cy / MAPA_ALTO) * 100}%`,
          }}
        >
          <Text variant="label-s" color="inverse" as="p">
            {provinciaEncima.nombre}
          </Text>
          {detalleGlobo.map((p) => (
            <Text
              key={p.sociedad}
              variant="body-s"
              color="inverse"
              as="p"
              className="whitespace-nowrap opacity-60"
            >
              {p.sociedad} · {p.puntos} pts.
            </Text>
          ))}
        </div>
      )}
    </div>
  );
}
