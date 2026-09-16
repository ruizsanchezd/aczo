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
import { BarraLateralCliente } from "./BarraLateralCliente";
import { FilaGrupo } from "./FilaGrupo";
import { OrganizaTuCartera } from "./OrganizaTuCartera";
import { MapaProvincias } from "./MapaProvincias";

/**
 * AreaCliente — la pantalla "Dashboard / Mi cartera" del área de cliente.
 *
 * Es otro momento distinto al recorrido de alta (/empresas, /particulares):
 * aquí la persona YA es clienta y lo que hace es vigilar su cartera.
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
 * oscuro. Se mezclan los DOS extremos de la familia verde del sistema
 * (`extended-five`), que es la paleta pensada para gráficas — así los bordes de
 * la escala son tokens de verdad y solo los pasos intermedios son mezcla, que
 * es lo que pide por fuerza una escala continua.
 *
 * Dos ajustes, y los dos por lo mismo (que el mapa se pueda leer):
 *
 *   La raíz cuadrada. Madrid tiene un tercio de toda la cartera, así que en una
 *   escala recta el resto de provincias caerían todas juntas abajo del todo y
 *   el mapa sería "Madrid y un montón de pálidos iguales". La raíz separa la
 *   parte baja de la escala, que es donde está casi todo.
 *
 *   El suelo del 25 %. Por debajo de ahí el verde se confunde con el gris de la
 *   tierra y una provincia con datos parecería no tener ninguno.
 */
function verde(peso: number): string {
  const porcentaje = Math.round(25 + 75 * Math.sqrt(peso));
  return `color-mix(in oklab, var(--color-extended-five-dark) ${porcentaje}%, var(--color-extended-five-light))`;
}

export function AreaCliente() {
  // La pantalla abre por UBICACIÓN: es la vista que más dice de un vistazo
  // (dónde está la cartera y cuánta hay en cada sitio) y la única con mapa.
  const [agrupacion, setAgrupacion] = useState<ModoAgrupacion>("ubicacion");
  const [filtros, setFiltros] = useState<FiltrosCartera>(FILTROS_VACIOS);
  const [marcado, setMarcado] = useState<string | null>(null);
  const [desplegado, setDesplegado] = useState<string | null>(null);
  const [inmuebleDesplegado, setInmuebleDesplegado] = useState<string | null>(
    null,
  );
  const [categorizando, setCategorizando] = useState<string | null>(null);
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

  const grupos = useMemo(() => {
    const agrupados = agruparCartera(agrupacion, filtros, categorias);

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
  }, [agrupacion, filtros, categorias]);

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

  // Cambiar de agrupación es empezar de cero: se suelta lo que hubiera marcado
  // y desplegado. Sin esto, al volver a una agrupación anterior reaparecería lo
  // que estaba marcado antes, y parecería que el mapa se enciende solo.
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
    setCategorizando(null);
  }

  const puntosVisibles = grupos.reduce((t, g) => t + g.puntos, 0);
  const porUbicacion = agrupacion === "ubicacion";

  return (
    <div className="flex min-h-screen bg-background-mid">
      <BarraLateralCliente />

      <main className="min-w-0 flex-1 px-06 py-07">
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
            <Button size="small">Añadir nuevos suministros</Button>
          </div>
        </header>

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
            <TarjetaDato key="estado" rotulo="Estado">
              <div className="flex flex-col gap-01">
                {ESTADOS_CARTERA.map((estado) => (
                  <PuntoEstado
                    key={estado.id}
                    color={estado.color}
                    rotulo={estado.rotulo}
                    cantidad={RESUMEN_CARTERA.estados[estado.id]}
                  />
                ))}
              </div>
            </TarjetaDato>,
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
                      nombre="Dirección"
                      {...comun}
                      seleccion={filtros.direcciones}
                      onChange={(direcciones) =>
                        setFiltros((f) => ({ ...f, direcciones }))
                      }
                      grupos={OPCIONES_FILTROS.direcciones.map((g) => ({
                        rotulo: g.provincia,
                        opciones: g.direcciones.map((d) => ({
                          value: d,
                          label: d,
                        })),
                      }))}
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
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() =>
                    setFiltros((f) => ({ ...f, soloSinClasificar: false }))
                  }
                >
                  Ver toda la cartera
                </Button>
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
                porUbicacion ? "lg:w-[588px]" : "lg:w-[365px]"
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
                )}
              </div>

              {/* La leyenda solo acompaña a la GRÁFICA. Con el mapa sobra: el
                  mapa ya dice qué provincia es cada cosa por su forma y su
                  sitio, y el detalle exacto lo da el globo al pasar por encima.
                  Una leyenda ahí sería repetir lo que ya se ve. */}
              {!porUbicacion && (
                <ul className="flex flex-wrap gap-x-04 gap-y-02">
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
                          className={`flex cursor-pointer items-center gap-02 rounded-sm text-left transition-opacity motion-micro-states hover:opacity-60 ${
                            marcadoVigente && !esteMarcado ? "opacity-30" : ""
                          }`}
                        >
                          <span
                            className="size-03 shrink-0 rounded-sm"
                            style={{ backgroundColor: grupo.color }}
                          />
                          <TextoRecortado variant="body-s" color="mid">
                            {grupo.nombre}
                          </TextoRecortado>
                          <Text variant="label-s" as="span">
                            {grupo.puntos}
                          </Text>
                          <Text variant="body-s" color="low" as="span">
                            {porcentaje}%
                          </Text>
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
                <div className="rounded-md border border-border-low bg-background-low p-06 text-center">
                  <Text variant="label-m" as="p">
                    No hay nada con esos filtros
                  </Text>
                  <Text variant="body-s" color="low" as="p" className="mt-01">
                    Prueba a quitar alguno para volver a ver tu cartera.
                  </Text>
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
                        inmuebleCategorizando={categorizando}
                        onCategorizarInmueble={(id) =>
                          setCategorizando(categorizando === id ? null : id)
                        }
                        onElegirCategoria={(id, categoria) => {
                          setCategorias((c) => ({ ...c, [id]: categoria }));
                          setCategorizando(null);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
