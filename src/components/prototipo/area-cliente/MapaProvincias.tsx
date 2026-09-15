"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MAPA_ALTO, MAPA_ANCHO, PROVINCIAS } from "@/mocks/provincias-espana";
import {
  ESTADOS_CARTERA,
  type FiltrosCartera,
  type GrupoCartera,
} from "@/mocks/aczo";
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

/**
 * Por qué eje se desglosa el globo de información, según lo que haya filtrado.
 *
 * La idea: si has filtrado por algo, el globo te cuenta ESE algo. Si has puesto
 * "Inmueble: local comercial", al pasar por encima de una provincia lo que
 * quieres saber es cuántos locales comerciales hay ahí — no cuántas sociedades.
 *
 * Solo hace falta cambiar el EJE, no lo que se cuenta: la lista que llega ya
 * viene filtrada, así que en un desglose por categoría solo pueden salir las
 * categorías que has elegido.
 *
 * "Dirección" no está en la lista a propósito: filtrar por direcciones no añade
 * nada dentro de una provincia, que ya es la ubicación.
 */
function ejeDelGlobo(filtros: FiltrosCartera) {
  if (filtros.tiposDeInmueble.length > 0) return "categoria" as const;
  if (filtros.estados.length > 0) return "estado" as const;
  if (filtros.tipos.length > 0) return "tipo" as const;
  // Sin filtros (o filtrando por sociedad), el reparto por sociedades.
  return "sociedad" as const;
}

/**
 * La caja negra del globo. Es un botón cuando hay una provincia que abrir y un
 * simple recuadro cuando no, para no prometer una acción que no existe.
 */
function Rotulo({
  como,
  onClick,
  children,
}: {
  como: "button" | "div";
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const clases =
    "block rounded-md bg-background-inverse px-03 py-02 text-left shadow-md";
  if (como === "div") return <div className={clases}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${clases} cursor-pointer transition-opacity motion-micro-states hover:opacity-60`}
    >
      {children}
    </button>
  );
}

/** Una línea del globo: "Local comercial · 3 inmuebles". */
type LineaGlobo = { etiqueta: string; cantidad: number; unidad: Unidad };

type Unidad = "inmuebles" | "pts.";

/** "1 inmueble" / "3 inmuebles"; los puntos no cambian. */
function enUnidades(cantidad: number, unidad: Unidad): string {
  if (unidad !== "inmuebles") return `${cantidad} ${unidad}`;
  return `${cantidad} ${cantidad === 1 ? "inmueble" : "inmuebles"}`;
}

export function MapaProvincias({
  grupos,
  seleccionado,
  filtros,
  onAbrirProvincia,
}: {
  grupos: GrupoCartera[];
  /** id del grupo marcado en la lista, o null si no hay ninguno. */
  seleccionado: string | null;
  /** Lo que hay filtrado. Decide por qué eje desglosa el globo. */
  filtros: FiltrosCartera;
  /**
   * Qué hacer al pulsar una provincia (o su globo). Solo se pasa cuando la
   * lista va agrupada por ubicación, que es cuando una provincia SE
   * CORRESPONDE con una fila; en las demás agrupaciones no hay nada que abrir.
   */
  onAbrirProvincia?: (provincia: string) => void;
}) {
  const [encima, setEncima] = useState<string | null>(null);

  /*
   * El globo no se va en cuanto sales de la provincia: espera un momento.
   *
   * Sin esa espera sería imposible pulsarlo — al salir del trazado para ir
   * hacia él, el globo desaparecería por el camino. Los 120 ms son el tiempo
   * justo para cruzar el hueco sin que el globo se quede colgado cuando de
   * verdad te has ido a otro sitio.
   */
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  function señalar(provincia: string) {
    clearTimeout(temporizador.current);
    setEncima(provincia);
  }

  function dejarDeSeñalar() {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEncima(null), 120);
  }

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const grupoMarcado = grupos.find((g) => g.id === seleccionado);
  const eje = ejeDelGlobo(filtros);

  /**
   * Qué hay en cada provincia, SOLO de lo que se ve en la lista.
   *
   * Es importante que salga de `grupos` y no de todos los datos: así, si los
   * filtros dejan la lista vacía, el mapa se apaga entero en vez de seguir
   * enseñando una cartera que no está a la vista.
   *
   * De cada provincia se guardan dos cosas: su color (el de quien más puntos
   * tiene allí) y el desglose que enseña el globo, por el eje que toque.
   */
  const porProvincia = useMemo(() => {
    const mapa = new Map<
      string,
      { color: string; puntosDelColor: number; lineas: Map<string, LineaGlobo> }
    >();

    for (const grupo of grupos) {
      for (const linea of grupo.detalle) {
        const provincia = mapa.get(linea.provincia) ?? {
          color: grupo.color,
          puntosDelColor: 0,
          lineas: new Map<string, LineaGlobo>(),
        };

        // El color de la provincia lo pone quien más puntos aporta.
        if (linea.puntos > provincia.puntosDelColor) {
          provincia.color = grupo.color;
          provincia.puntosDelColor = linea.puntos;
        }

        const suma = (etiqueta: string, cantidad: number, unidad: Unidad) => {
          const ya = provincia.lineas.get(etiqueta);
          if (ya) ya.cantidad += cantidad;
          else provincia.lineas.set(etiqueta, { etiqueta, cantidad, unidad });
        };

        if (eje === "categoria") {
          suma(linea.categoria ?? "Sin catalogar", 1, "inmuebles");
        } else if (eje === "estado") {
          // Solo los estados marcados. Un inmueble "en trámite" casi siempre
          // tiene también puntos activos, y sacarlos aquí sería responder a una
          // pregunta que no se ha hecho.
          for (const id of filtros.estados) {
            if (linea.estados[id] > 0) {
              const estado = ESTADOS_CARTERA.find((e) => e.id === id);
              if (estado) suma(estado.rotulo, linea.estados[id], "pts.");
            }
          }
        } else if (eje === "tipo") {
          // Igual: solo luz o solo gas si es lo que se ha marcado.
          for (const tipo of linea.tipos) {
            if (filtros.tipos.includes(tipo)) {
              suma(tipo === "luz" ? "Luz" : "Gas", 1, "inmuebles");
            }
          }
        } else {
          suma(linea.sociedad, linea.puntos, "pts.");
        }

        mapa.set(linea.provincia, provincia);
      }
    }
    return mapa;
  }, [grupos, eje, filtros]);

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
      for (const [provincia, datos] of porProvincia) {
        mapa.set(provincia, datos.color);
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

  // Las líneas del globo, de mayor a menor.
  const detalleGlobo = encima
    ? [...(porProvincia.get(encima)?.lineas.values() ?? [])].sort(
        (a, b) => b.cantidad - a.cantidad,
      )
    : undefined;
  const provinciaEncima = encima
    ? PROVINCIAS.find((p) => p.nombre === encima)
    : undefined;

  return (
    // El recorte del mapa va en el div de DENTRO, no en este: si estuviera
    // aquí, el globo de una provincia del norte se cortaría por arriba.
    //
    // El mapa ocupa todo el ancho que le den y su alto sale de la proporción,
    // que se mantiene siempre: es lo que hace que el globo de información, que
    // se coloca en porcentajes, caiga donde toca.
    <div
      className="relative w-full"
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
                  cursor: onAbrirProvincia ? "pointer" : undefined,
                }}
                onMouseEnter={() => señalar(p.nombre)}
                onMouseLeave={dejarDeSeñalar}
                onClick={() => onAbrirProvincia?.(p.nombre)}
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
          className="anim-aparece absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(provinciaEncima.cx / MAPA_ANCHO) * 100}%`,
            top: `${(provinciaEncima.cy / MAPA_ALTO) * 100}%`,
          }}
          onMouseEnter={() => señalar(provinciaEncima.nombre)}
          onMouseLeave={dejarDeSeñalar}
        >
          {/* El globo es un BOTÓN cuando hay algo que abrir: pulsarlo despliega
              esa provincia en la lista, con sus inmuebles. Es el atajo natural
              — acabas de leer "3 locales comerciales" y lo siguiente que
              quieres saber es cuáles. */}
          <Rotulo
            como={onAbrirProvincia ? "button" : "div"}
            onClick={
              onAbrirProvincia
                ? () => onAbrirProvincia(provinciaEncima.nombre)
                : undefined
            }
          >
            <Text variant="label-s" color="inverse" as="p">
              {provinciaEncima.nombre}
            </Text>
            {detalleGlobo.map((linea) => (
              <Text
                key={linea.etiqueta}
                variant="body-s"
                color="inverse"
                as="p"
                className="whitespace-nowrap opacity-60"
              >
                {linea.etiqueta} · {enUnidades(linea.cantidad, linea.unidad)}
              </Text>
            ))}
            {onAbrirProvincia && (
              <Text
                variant="body-s"
                color="inverse"
                as="p"
                className="mt-01 whitespace-nowrap opacity-60"
              >
                Pulsa para ver los inmuebles
              </Text>
            )}
          </Rotulo>
        </div>
      )}
    </div>
  );
}
