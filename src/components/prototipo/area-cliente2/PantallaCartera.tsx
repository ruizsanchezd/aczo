"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FiltroCasillas } from "@/components/ui/FiltroCasillas";
import { GraficaAnillo } from "@/components/ui/GraficaAnillo";
import { GrupoSegmentado } from "@/components/ui/GrupoSegmentado";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import { TarjetaDato } from "@/components/ui/TarjetaDato";
import { Text } from "@/components/ui/Text";
import { TextoRecortado } from "@/components/ui/TextoRecortado";
import { Toast } from "@/components/ui/Toast";
import { LogoComercializadora } from "@/components/prototipo/TarjetaPlan";
import {
  ACTUALIZACION_CARTERA,
  agruparCartera,
  ESTADOS_CARTERA,
  FILTROS_POR_AGRUPACION,
  FILTROS_VACIOS,
  MODOS_AGRUPACION,
  listaDeInmuebles,
  OPCIONES_FILTROS,
  PALETA_CARTERA,
  RESUMEN_CARTERA,
  type CategoriaInmueble,
  type EstadoCartera,
  type FiltrosCartera,
  type ModoAgrupacion,
  type TipoCartera,
} from "@/mocks/aczo";
import { motionSafe, retardo } from "@/lib/prototipo";
import { FilaGrupo } from "./FilaGrupo";
import { ModalOrganizaCartera } from "./ModalOrganizaCartera";
import { BannerAhorroExtra } from "./PiezasAreaCliente";
import { OrganizaTuCartera } from "./OrganizaTuCartera";
import { MapaProvincias } from "./MapaProvincias";

/**
 * PantallaCartera — la pantalla "Mi cartera" del área de cliente.
 *
 * Es otro momento distinto al recorrido de alta (/empresas, /particulares):
 * aquí la persona YA es clienta y lo que hace es vigilar su cartera. Vive
 * dentro de AreaCliente2, que le pone alrededor el menú lateral y decide
 * cuándo se muestra.
 *
 * LO QUE ESTÁ VIVO
 *   · Marcar una fila enciende sus provincias en el mapa (y volver a pulsarla
 *     lo apaga). Ver FilaGrupo y MapaProvincias.
 *   · "Agrupar por" rehace la lista: por sociedad, por ubicación o por
 *     comercializadora. Las tres salen de los mismos datos.
 *   · Los cuatro filtros recortan la cartera antes de agruparla.
 *
 * ANIMACIÓN DE ENTRADA
 *   Las cinco tarjetas de arriba entran en cascada, con el paso de siempre del
 *   prototipo (PASO_CASCADA, 60 ms), de izquierda a derecha: es el orden en el
 *   que se leen. Las filas de la lista hacen lo mismo, y vuelven a entrar cada
 *   vez que cambia la agrupación o un filtro — así se ve que la lista se ha
 *   rehecho, y no que "han desaparecido cosas".
 *   Las dos usan anim-aparece (motion-micro-appear, 350 ms, ease in).
 */

/**
 * El verde de una provincia según su peso (0 a 1): cuanta más cantidad, más
 * oscuro. Se mezclan los DOS extremos de la escala tal como sale del Figma
 * (nodo 788:13581, el SVG del mapa): el verde amarillento pálido de
 * `extended-one-light` y, en el otro extremo, el verde oscuro de marca
 * `highlight-deep` — NO la familia `extended-five` (esa es azulada, no
 * amarillenta; se comprobó extrayendo los hex reales del SVG del Figma:
 * #eaf1da…#20270f, que son estos dos tokens y no aquellos). Así los bordes de
 * la escala son tokens de verdad y solo los pasos intermedios son mezcla, que
 * es lo que pide por fuerza una escala continua.
 *
 * La escala es RECTA (peso directo, sin raíz): con la raíz cuadrada que había
 * antes, las seis provincias de la cartera de mentira (entre el 18 % y el
 * 100 % del peso de Madrid) quedaban todas comprimidas en la mitad oscura de
 * la escala — el mapa se veía "Madrid y cinco verdes casi iguales" en vez de
 * un degradado que se pueda leer. La recta reparte ese mismo rango de datos
 * de punta a punta de la escala.
 *
 * El suelo del 12 %: por debajo de ahí el verde se confunde con el gris de la
 * tierra y una provincia con datos parecería no tener ninguno.
 */
function verde(peso: number): string {
  const porcentaje = Math.round(12 + 88 * peso);
  return `color-mix(in oklab, var(--color-highlight-deep) ${porcentaje}%, var(--color-extended-one-light))`;
}

export function PantallaCartera({
  onAbrirNuevoSuministro,
}: {
  /** Abre el asistente "Añadir nuevos suministros" (ver
   * NuevoSuministroCliente.tsx), otra sección del mismo `seccion` state de
   * AreaCliente2.tsx. */
  onAbrirNuevoSuministro?: () => void;
}) {
  // La pantalla abre por UBICACIÓN: es la vista que más dice de un vistazo
  // (dónde está la cartera y cuánta hay en cada sitio) y la única con mapa.
  const [agrupacion, setAgrupacion] = useState<ModoAgrupacion>("ubicacion");
  const [filtros, setFiltros] = useState<FiltrosCartera>(FILTROS_VACIOS);
  const [marcado, setMarcado] = useState<string | null>(null);
  const [desplegado, setDesplegado] = useState<string | null>(null);
  const [inmuebleDesplegado, setInmuebleDesplegado] = useState<string | null>(
    null,
  );
  // id (dirección) del inmueble con el que se abrió ModalOrganizaCartera, o
  // null si está cerrado. El modal enseña TODA la cartera agrupada igual que
  // la lista, así que basta con saber qué inmueble desplegar de más.
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [avisoGuardado, setAvisoGuardado] = useState(false);
  // Solo puede haber un filtro abierto a la vez, así que quién está abierto lo
  // lleva la pantalla y no cada filtro por su cuenta. Es también lo que permite
  // que "Filtrar por ubicación" salte del filtro de Inmueble al de Dirección.
  const [filtroAbierto, setFiltroAbierto] = useState<
    keyof FiltrosCartera | null
  >(null);

  // Las categorías que se han puesto durante la sesión. Los datos de mentira no
  // se tocan: se guarda aparte lo que ha cambiado la persona y se aplica encima
  // al agrupar. Así basta con recargar para volver al punto de partida.
  const [categorias, setCategorias] = useState<
    Record<string, CategoriaInmueble>
  >({});
  // Lo mismo, pero para el nombre que se pone en ModalOrganizaCartera.
  const [nombres, setNombres] = useState<Record<string, string>>({});

  const grupos = useMemo(() => {
    const agrupados = agruparCartera(agrupacion, filtros, categorias, nombres);

    /*
     * De qué color va cada fila, y por qué cambia con la agrupación.
     *
     * Por SOCIEDAD el color viene ya del dato: cada sociedad tiene el suyo. Por
     * COMERCIALIZADORA lo hereda de la sociedad que más pesa dentro, y como hay
     * una por sociedad, salen distintos.
     *
     * Por TIPO DE INMUEBLE ese apaño no vale: en casi todos los tipos manda la
     * misma sociedad, así que media lista acabaría del mismo color. Se reparte
     * la paleta por orden — el mismo color que tendría la primera sociedad para
     * el primer tipo, y así. Es lo que hace que el gráfico se lea igual
     * agrupes por lo que agrupes.
     *
     * Por UBICACIÓN el color deja de ser identidad y pasa a contar CANTIDAD,
     * con la escala de verdes: cuanto más oscuro, más. Ahí el mapa ya dice
     * quién es cada cual (su forma y su sitio), así que el color puede dedicarse
     * a lo otro.
     */
    if (agrupacion === "inmueble") {
      return agrupados.map((g, i) => ({
        ...g,
        color: PALETA_CARTERA[i % PALETA_CARTERA.length],
      }));
    }

    if (agrupacion !== "ubicacion") return agrupados;

    const mayor = Math.max(1, ...agrupados.map((g) => g.puntos));
    return agrupados.map((g) => ({ ...g, color: verde(g.puntos / mayor) }));
  }, [agrupacion, filtros, categorias, nombres]);

  // Cuántos inmuebles faltan por catalogar. Se cuenta sobre la cartera entera
  // (no sobre lo filtrado): "te quedan 5 sin clasificar" habla de toda la
  // cartera, no de lo que se esté viendo en ese momento.
  const sinClasificar = useMemo(
    () => listaDeInmuebles(categorias).filter((i) => !i.categoria).length,
    [categorias],
  );

  // Si lo que estaba marcado ya no está en la lista (porque un filtro lo ha
  // dejado fuera), se desmarca: si no, el mapa seguiría encendido por algo que
  // ya no se ve.
  const marcadoVigente = grupos.some((g) => g.id === marcado) ? marcado : null;

  /**
   * Abre una provincia desde el mapa: despliega su fila y la trae a la vista.
   *
   * Lo segundo importa tanto como lo primero: la lista puede estar por debajo
   * de lo que se ve, y desplegar algo que no se ve se leería como que el clic
   * no ha hecho nada.
   */
  function abrirProvincia(provincia: string) {
    setDesplegado(provincia);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-grupo="${CSS.escape(provincia)}"]`)
        ?.scrollIntoView({
          block: "nearest",
          behavior: motionSafe() ? "smooth" : "auto",
        });
    });
  }

  function cambiarAgrupacion(modo: ModoAgrupacion) {
    setAgrupacion(modo);
    // Los filtros se van con lo demás porque cada agrupación tiene los suyos:
    // al pasar de ubicación a sociedades, la mitad de los que había puestos ni
    // siquiera se ven ya, y seguirían recortando la lista sin que nada lo
    // explique — se leería como que faltan cosas.
    setFiltros(FILTROS_VACIOS);
    setFiltroAbierto(null);
    setMarcado(null);
    setDesplegado(null);
    setInmuebleDesplegado(null);
    setEditandoId(null);
  }

  const puntosVisibles = grupos.reduce((t, g) => t + g.puntos, 0);
  const porUbicacion = agrupacion === "ubicacion";

  return (
    <>
      {/* Cabecera */}
      <header className="flex flex-wrap items-end justify-between gap-04">
        <div className="flex flex-col gap-01">
          <Text variant="label-s-uppercase" color="low" as="p">
            Última actualización · {ACTUALIZACION_CARTERA}
          </Text>
          <Text variant="heading-l" as="h1">
            Mi cartera
          </Text>
        </div>
        <div className="flex items-center gap-02">
          <Button variant="secondary" size="small" iconStart="call">
            ¿Necesitas asistencia?
          </Button>
          <Button size="small" onClick={onAbrirNuevoSuministro}>
            Añadir nuevos suministros
          </Button>
        </div>
      </header>

      <BannerAhorroExtra />

      {/* Las cinco tarjetas de resumen */}
      <div className="mt-06 flex flex-wrap items-stretch gap-05">
        {[
          <TarjetaDato
            key="sociedades"
            rotulo="Sociedades"
            valor={RESUMEN_CARTERA.sociedades}
          />,
          <TarjetaDato
            key="inmuebles"
            rotulo="Inmuebles"
            valor={RESUMEN_CARTERA.inmuebles}
          />,
          <TarjetaDato
            key="puntos"
            rotulo="Ptos. de suministro (CUPS)"
            valor={RESUMEN_CARTERA.puntos}
          />,
          <TarjetaDato key="comercializadoras" rotulo="Comercializadoras">
            <div className="flex items-end justify-between gap-03">
              <Text variant="heading-m" as="p">
                {RESUMEN_CARTERA.comercializadoras.length}
              </Text>
              {/* Los logos se solapan un poco, como en el Figma. */}
              <div className="flex">
                {RESUMEN_CARTERA.comercializadoras.map((nombre, i) => (
                  <LogoComercializadora
                    key={nombre}
                    nombre={nombre}
                    className={`size-08 ${i > 0 ? "-ml-03" : ""}`}
                  />
                ))}
              </div>
            </div>
          </TarjetaDato>,
          // No es un `TarjetaDato`: esa siempre pone el rótulo ARRIBA y el
          // valor debajo, y esta tarjeta va en horizontal — "Estado" a la
          // izquierda y la lista de puntitos a su derecha. `items-start`:
          // el rótulo va arriba, alineado con el de las otras cuatro
          // tarjetas, no centrado con el alto de la lista. Por fuera lleva
          // el mismo marco (fondo, radio, padding) para que la fila de
          // tarjetas se siga leyendo como una.
          <div
            key="estado"
            className="flex flex-1 items-start justify-between gap-04 rounded-md bg-background-base p-04"
          >
            <Text variant="label-s-uppercase" color="low" as="p">
              Estado
            </Text>
            <ul className="flex flex-col gap-01">
              {ESTADOS_CARTERA.map((estado) => (
                <li key={estado.id}>
                  <PuntoEstado
                    color={estado.color}
                    rotulo={estado.rotulo}
                    cantidad={RESUMEN_CARTERA.estados[estado.id]}
                  />
                </li>
              ))}
            </ul>
          </div>,
        ].map((tarjeta, i) => (
          <div
            key={tarjeta.key}
            className="anim-aparece flex min-w-[180px] flex-1"
            style={retardo(i)}
          >
            {tarjeta}
          </div>
        ))}
      </div>

      {/* El panel: barra de controles + lista + mapa */}
      <section className="mt-06 rounded-md bg-background-base p-04">
        <div className="flex flex-wrap items-center justify-between gap-04">
          <div className="flex items-center gap-02">
            <Text variant="label-s" color="mid" as="span">
              Agrupar por
            </Text>
            <GrupoSegmentado
              etiqueta="Agrupar por"
              opciones={MODOS_AGRUPACION}
              valor={agrupacion}
              onChange={cambiarAgrupacion}
            />
          </div>

          <div className="flex flex-wrap items-center gap-02">
            {/* Qué filtros salen depende de la agrupación: agrupando por
                ubicación, por ejemplo, el de "Sociedad" sobra. Ver
                FILTROS_POR_AGRUPACION en mocks. */}
            {FILTROS_POR_AGRUPACION[agrupacion].map((campo) => {
              const comun = {
                abierto: filtroAbierto === campo,
                onAbrir: (abrir: boolean) =>
                  setFiltroAbierto(abrir ? campo : null),
              };

              if (campo === "sociedades")
                return (
                  <FiltroCasillas
                    key={campo}
                    nombre="Sociedad"
                    {...comun}
                    seleccion={filtros.sociedades}
                    onChange={(sociedades) =>
                      setFiltros((f) => ({ ...f, sociedades }))
                    }
                    grupos={[
                      {
                        opciones: OPCIONES_FILTROS.sociedades.map((x) => ({
                          value: x,
                          label: x,
                        })),
                      },
                    ]}
                  />
                );

              if (campo === "comercializadoras")
                return (
                  <FiltroCasillas
                    key={campo}
                    nombre="Comercializadora"
                    {...comun}
                    seleccion={filtros.comercializadoras}
                    onChange={(comercializadoras) =>
                      setFiltros((f) => ({ ...f, comercializadoras }))
                    }
                    grupos={[
                      {
                        opciones: OPCIONES_FILTROS.comercializadoras.map(
                          (x) => ({ value: x, label: x }),
                        ),
                      },
                    ]}
                  />
                );

              if (campo === "tipos")
                return (
                  <FiltroCasillas
                    key={campo}
                    nombre="Tipo de suministro"
                    {...comun}
                    seleccion={filtros.tipos}
                    onChange={(tipos) =>
                      setFiltros((f) => ({
                        ...f,
                        tipos: tipos as TipoCartera[],
                      }))
                    }
                    grupos={[{ opciones: OPCIONES_FILTROS.tipos }]}
                  />
                );

              if (campo === "tiposDeInmueble")
                return (
                  <FiltroCasillas
                    key={campo}
                    nombre="Inmueble"
                    {...comun}
                    seleccion={filtros.tiposDeInmueble}
                    onChange={(tiposDeInmueble) =>
                      setFiltros((f) => ({
                        ...f,
                        tiposDeInmueble:
                          tiposDeInmueble as CategoriaInmueble[],
                      }))
                    }
                    grupos={[{ opciones: OPCIONES_FILTROS.tiposDeInmueble }]}
                    pie={
                      sinClasificar > 0 ? (
                        <OrganizaTuCartera
                          sinClasificar={sinClasificar}
                          hayClasificados={
                            sinClasificar < RESUMEN_CARTERA.inmuebles
                          }
                          onOrganizar={() => {
                            setFiltros((f) => ({
                              ...f,
                              soloSinClasificar: true,
                            }));
                            setFiltroAbierto(null);
                          }}
                          onFiltrarPorUbicacion={() =>
                            setFiltroAbierto("direcciones")
                          }
                        />
                      ) : undefined
                    }
                  />
                );

              if (campo === "direcciones")
                return (
                  <FiltroCasillas
                    key={campo}
                    // Agrupando por ubicación (la vista del mapa) tiene
                    // sentido bajar hasta la dirección exacta: un encabezado
                    // por provincia y debajo sus calles, así que ahí se
                    // llama "Dirección". En las otras tres agrupaciones lo
                    // que se compara ya es otra cosa (sociedad,
                    // comercializadora, tipo de inmueble) y el detalle de la
                    // calle sobra — el filtro es solo la provincia, una
                    // casilla por cada una, y por eso se llama "Provincias".
                    nombre={porUbicacion ? "Dirección" : "Provincias"}
                    {...comun}
                    seleccion={filtros.direcciones}
                    onChange={(direcciones) =>
                      setFiltros((f) => ({ ...f, direcciones }))
                    }
                    grupos={
                      porUbicacion
                        ? OPCIONES_FILTROS.direcciones.map((g) => ({
                            rotulo: g.provincia,
                            opciones: g.direcciones.map((d) => ({
                              value: d,
                              label: d,
                            })),
                          }))
                        : [
                            {
                              opciones: OPCIONES_FILTROS.provincias.map(
                                (p) => ({ value: p, label: p }),
                              ),
                            },
                          ]
                    }
                  />
                );

              return (
                <FiltroCasillas
                  key={campo}
                  nombre="Estado"
                  {...comun}
                  seleccion={filtros.estados}
                  onChange={(estados) =>
                    setFiltros((f) => ({
                      ...f,
                      estados: estados as EstadoCartera[],
                    }))
                  }
                  grupos={[{ opciones: OPCIONES_FILTROS.estados }]}
                />
              );
            })}
          </div>
        </div>

        {/* Mientras dura el modo "organizar", un aviso dice qué se está
            viendo y da la salida. Sin él, la lista parecería rota: faltarían
            inmuebles sin que nada lo explique. */}
        {filtros.soloSinClasificar && (
          <Alert tone="subtle" icon="folder" className="anim-aparece mt-04">
            <div className="flex flex-wrap items-center justify-between gap-03">
              <Text variant="body-m" color="mid" as="span">
                Estás viendo solo los inmuebles que faltan por clasificar.
              </Text>
              {/* "DS Button" tipo enlace: texto en highlight-muted y
                  subrayado, igual que "Ver cartera"/"Ver consumo y ahorro"
                  del Dashboard — no el `Button` terciario del sistema, que
                  va en content-high (negro) y no lleva subrayado. */}
              <button
                type="button"
                onClick={() =>
                  setFiltros((f) => ({ ...f, soloSinClasificar: false }))
                }
                className="text-label-s text-highlight-muted underline transition-opacity motion-micro-states hover:opacity-60"
              >
                Ver toda la cartera
              </button>
            </div>
          </Alert>
        )}

        {/* El mapa a la izquierda y la lista a la derecha. Ninguna de las dos
            columnas tiene alto fijo ni rueda por dentro: crecen lo que haga
            falta y quien rueda es la página, que es lo que se espera de una
            pantalla larga. */}
        <div className="mt-04 flex flex-col gap-04 lg:flex-row">
          {/* El mapa y su leyenda — a la izquierda. */}
          <div
            className={`flex w-full shrink-0 flex-col gap-04 overflow-hidden rounded-md border border-border-low p-04 lg:h-full ${
              porUbicacion ? "lg:w-[500px]" : "lg:w-[299px]"
            }`}
          >
            <div className="flex justify-center lg:min-h-0 lg:flex-1">
              {/* El mapa solo tiene sentido agrupando por ubicación. En las
                  demás agrupaciones lo que se quiere comparar no es DÓNDE
                  está cada cosa sino CUÁNTO pesa, y para eso el anillo dice
                  en un vistazo lo que un mapa no puede decir. */}
              {porUbicacion ? (
                <MapaProvincias
                  grupos={grupos}
                  seleccionado={marcadoVigente}
                  filtros={filtros}
                  onAbrirProvincia={abrirProvincia}
                />
              ) : (
                // 220px, no el ancho entero del panel (267px de hueco libre
                // dentro del borde): el Figma (nodo 797:31909) traía el
                // anillo en 178px, pero a ese tamaño el hueco central queda
                // más pequeño que la etiqueta "Ptos de suministro" y la
                // pisa. 220px —lo mismo que el anillo del Dashboard— agranda
                // el hueco lo justo para que el texto quepa dentro sin
                // tocar el trazo.
                <div className="w-[220px]">
                  <GraficaAnillo
                    unidad="Ptos de suministro"
                    seleccionado={marcadoVigente}
                    onSeleccionar={(id) =>
                      setMarcado(marcadoVigente === id ? null : id)
                    }
                    segmentos={grupos.map((g) => ({
                      id: g.id,
                      etiqueta: g.nombre,
                      valor: g.puntos,
                      color: g.color,
                    }))}
                  />
                </div>
              )}
            </div>

            {/* La leyenda solo acompaña a la GRÁFICA. Con el mapa sobra: el
                mapa ya dice qué provincia es cada cosa por su forma y su
                sitio, y el detalle exacto lo da el globo al pasar por encima.
                Una leyenda ahí sería repetir lo que ya se ve.
                Apilada en columna, no envuelta en línea: así la enseña el
                Figma, con el nombre a la izquierda y la cifra + el
                porcentaje a la derecha en cada fila. */}
            {!porUbicacion && (
              <ul className="flex flex-col gap-02">
                {grupos.map((grupo) => {
                  const porcentaje = puntosVisibles
                    ? Math.round((grupo.puntos / puntosVisibles) * 100)
                    : 0;
                  const esteMarcado = marcadoVigente === grupo.id;
                  return (
                    <li key={grupo.id}>
                      <button
                        type="button"
                        aria-pressed={esteMarcado}
                        onClick={() =>
                          setMarcado(esteMarcado ? null : grupo.id)
                        }
                        className={`flex w-full cursor-pointer items-center justify-between gap-02 rounded-sm text-left transition-opacity motion-micro-states hover:opacity-60 ${
                          marcadoVigente && !esteMarcado ? "opacity-30" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-02">
                          <span
                            className="size-03 shrink-0 rounded-sm"
                            style={{ backgroundColor: grupo.color }}
                          />
                          <TextoRecortado variant="body-s" color="mid">
                            {grupo.nombre}
                          </TextoRecortado>
                        </span>
                        <span className="flex shrink-0 items-center gap-02">
                          <Text variant="label-s" as="span">
                            {grupo.puntos}
                          </Text>
                          <Text variant="body-s" color="low" as="span">
                            {porcentaje}%
                          </Text>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* La lista — a la derecha. */}
          <div className="min-w-0 flex-1">
            {grupos.length === 0 ? (
              <div className="flex flex-col items-center gap-04 rounded-md border border-border-low bg-background-low p-06 text-center">
                <div>
                  <Text variant="label-m" as="p">
                    No hay nada con esos filtros
                  </Text>
                  <Text variant="body-s" color="low" as="p" className="mt-01">
                    Prueba a quitar alguno para volver a ver tu cartera.
                  </Text>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setFiltros(FILTROS_VACIOS)}
                >
                  Restablecer filtros
                </Button>
              </div>
            ) : (
              <ul
                // La `key` rehace la lista al cambiar agrupación o filtros,
                // para que la cascada de entrada vuelva a lanzarse.
                key={`${agrupacion}-${JSON.stringify(filtros)}`}
                className="flex flex-col gap-03"
              >
                {grupos.map((grupo, i) => (
                  <li
                    key={grupo.id}
                    data-grupo={grupo.id}
                    className="anim-aparece"
                    style={retardo(i)}
                  >
                    <FilaGrupo
                      grupo={grupo}
                      emblema={
                        agrupacion === "ubicacion"
                          ? "ubicacion"
                          : agrupacion === "comercializadora"
                            ? "comercializadora"
                            : "edificio"
                      }
                      apilado={porUbicacion}
                      marcado={marcadoVigente === grupo.id}
                      desplegado={desplegado === grupo.id}
                      onMarcar={() =>
                        setMarcado(
                          marcadoVigente === grupo.id ? null : grupo.id,
                        )
                      }
                      onDesplegar={() =>
                        setDesplegado(
                          desplegado === grupo.id ? null : grupo.id,
                        )
                      }
                      inmuebleDesplegado={inmuebleDesplegado}
                      onDesplegarInmueble={(id) =>
                        setInmuebleDesplegado(
                          inmuebleDesplegado === id ? null : id,
                        )
                      }
                      onEditarInmueble={(id) => setEditandoId(id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {editandoId && (
        <ModalOrganizaCartera
          key={editandoId}
          grupos={grupos}
          focoId={editandoId}
          onGuardar={(cambios) => {
            const nombresNuevos: Record<string, string> = {};
            const categoriasNuevas: Record<string, CategoriaInmueble> = {};
            for (const [id, cambio] of Object.entries(cambios)) {
              if (cambio.nombre) nombresNuevos[id] = cambio.nombre;
              if (cambio.categoria) categoriasNuevas[id] = cambio.categoria;
            }
            if (Object.keys(nombresNuevos).length > 0)
              setNombres((n) => ({ ...n, ...nombresNuevos }));
            if (Object.keys(categoriasNuevas).length > 0)
              setCategorias((c) => ({ ...c, ...categoriasNuevas }));
            if (Object.keys(cambios).length > 0) setAvisoGuardado(true);
          }}
          onCerrar={() => setEditandoId(null)}
        />
      )}

      <Toast
        mensaje="Nombre y tipo de activo añadido con éxito"
        abierto={avisoGuardado}
        onCerrar={() => setAvisoGuardado(false)}
      />
    </>
  );
}
