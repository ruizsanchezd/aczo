"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FiltroCasillas } from "@/components/ui/FiltroCasillas";
import { GrupoSegmentado } from "@/components/ui/GrupoSegmentado";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import { TarjetaDato } from "@/components/ui/TarjetaDato";
import { Text } from "@/components/ui/Text";
import { LogoComercializadora } from "@/components/prototipo/TarjetaPlan";
import {
  ACTUALIZACION_CARTERA,
  agruparCartera,
  ESTADOS_CARTERA,
  FILTROS_VACIOS,
  MODOS_AGRUPACION,
  listaDeInmuebles,
  OPCIONES_FILTROS,
  RESUMEN_CARTERA,
  type CategoriaInmueble,
  type EstadoCartera,
  type FiltrosCartera,
  type ModoAgrupacion,
  type TipoCartera,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { MAPA_ALTO } from "@/mocks/provincias-espana";
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

export function AreaCliente() {
  const [agrupacion, setAgrupacion] = useState<ModoAgrupacion>("sociedad");
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
    const agrupados = agruparCartera(agrupacion, filtros);
    if (Object.keys(categorias).length === 0) return agrupados;
    return agrupados.map((grupo) => ({
      ...grupo,
      detalle: grupo.detalle.map((linea) =>
        categorias[linea.id]
          ? { ...linea, categoria: categorias[linea.id] }
          : linea,
      ),
    }));
  }, [agrupacion, filtros, categorias]);

  // Los inmuebles que YA están clasificados y los que no. Se calculan sobre la
  // cartera entera (no sobre lo filtrado): "te quedan 5 sin clasificar" habla de
  // toda la cartera, no de lo que se esté viendo en ese momento.
  const { inmueblesClasificados, sinClasificar } = useMemo(() => {
    const todos = listaDeInmuebles().map((i) => ({
      ...i,
      categoria: categorias[i.id] ?? i.categoria,
    }));
    return {
      inmueblesClasificados: todos
        .filter((i) => i.categoria)
        .map((i) => ({
          value: i.id,
          label: i.nombre ?? `${i.categoria} · ${i.ciudad}`,
        })),
      sinClasificar: todos.filter((i) => !i.categoria).map((i) => i.id),
    };
  }, [categorias]);

  // Si lo que estaba marcado ya no está en la lista (porque un filtro lo ha
  // dejado fuera), se desmarca: si no, el mapa seguiría encendido por algo que
  // ya no se ve.
  const marcadoVigente = grupos.some((g) => g.id === marcado) ? marcado : null;

  // Cambiar de agrupación es empezar de cero: se suelta lo que hubiera marcado
  // y desplegado. Sin esto, al volver a una agrupación anterior reaparecería lo
  // que estaba marcado antes, y parecería que el mapa se enciende solo.
  function cambiarAgrupacion(modo: ModoAgrupacion) {
    setAgrupacion(modo);
    setMarcado(null);
    setDesplegado(null);
    setInmuebleDesplegado(null);
    setCategorizando(null);
  }

  const puntosVisibles = grupos.reduce((t, g) => t + g.puntos, 0);

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
              <FiltroCasillas
                nombre="Sociedad"
                abierto={filtroAbierto === "sociedades"}
                onAbrir={(abrir) =>
                  setFiltroAbierto(abrir ? "sociedades" : null)
                }
                seleccion={filtros.sociedades}
                onChange={(sociedades) =>
                  setFiltros((f) => ({ ...f, sociedades }))
                }
                grupos={[
                  {
                    opciones: OPCIONES_FILTROS.sociedades.map((s) => ({
                      value: s,
                      label: s,
                    })),
                  },
                ]}
              />
              <FiltroCasillas
                nombre="Tipo de suministro"
                abierto={filtroAbierto === "tipos"}
                onAbrir={(abrir) => setFiltroAbierto(abrir ? "tipos" : null)}
                seleccion={filtros.tipos}
                onChange={(tipos) =>
                  setFiltros((f) => ({ ...f, tipos: tipos as TipoCartera[] }))
                }
                grupos={[{ opciones: OPCIONES_FILTROS.tipos }]}
              />
              <FiltroCasillas
                nombre="Inmueble"
                abierto={filtroAbierto === "inmuebles"}
                onAbrir={(abrir) =>
                  setFiltroAbierto(abrir ? "inmuebles" : null)
                }
                seleccion={filtros.inmuebles}
                onChange={(inmuebles) =>
                  setFiltros((f) => ({ ...f, inmuebles }))
                }
                grupos={[{ opciones: inmueblesClasificados }]}
                pie={
                  sinClasificar.length > 0 ? (
                    <OrganizaTuCartera
                      sinClasificar={sinClasificar.length}
                      hayClasificados={inmueblesClasificados.length > 0}
                      onOrganizar={() => {
                        setFiltros((f) => ({ ...f, inmuebles: sinClasificar }));
                        setFiltroAbierto(null);
                      }}
                      onFiltrarPorUbicacion={() =>
                        setFiltroAbierto("direcciones")
                      }
                    />
                  ) : undefined
                }
              />
              <FiltroCasillas
                nombre="Dirección"
                abierto={filtroAbierto === "direcciones"}
                onAbrir={(abrir) =>
                  setFiltroAbierto(abrir ? "direcciones" : null)
                }
                seleccion={filtros.direcciones}
                onChange={(direcciones) =>
                  setFiltros((f) => ({ ...f, direcciones }))
                }
                grupos={OPCIONES_FILTROS.direcciones.map((g) => ({
                  rotulo: g.provincia,
                  opciones: g.direcciones.map((d) => ({ value: d, label: d })),
                }))}
              />
              <FiltroCasillas
                nombre="Estado"
                abierto={filtroAbierto === "estados"}
                onAbrir={(abrir) => setFiltroAbierto(abrir ? "estados" : null)}
                seleccion={filtros.estados}
                onChange={(estados) =>
                  setFiltros((f) => ({
                    ...f,
                    estados: estados as EstadoCartera[],
                  }))
                }
                grupos={[{ opciones: OPCIONES_FILTROS.estados }]}
              />
            </div>
          </div>

          <div className="mt-04 flex flex-col gap-04 lg:flex-row">
            {/* La lista */}
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
                      className="anim-aparece"
                      style={retardo(i)}
                    >
                      <FilaGrupo
                        grupo={grupo}
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

            {/* El mapa y su leyenda */}
            <div className="flex w-full shrink-0 flex-col gap-04 rounded-md border border-border-low p-04 lg:w-[365px]">
              <MapaProvincias grupos={grupos} seleccionado={marcadoVigente} />

              {/* La leyenda no crece sin fin: se queda como mucho tan alta
                  como el mapa y a partir de ahí rueda. Agrupando por ubicación
                  hay casi veinte filas, y sin tope el panel se descuadraría. */}
              <ul
                className="flex flex-col gap-01 overflow-y-auto"
                style={{ maxHeight: MAPA_ALTO }}
              >
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
                        className={`flex w-full cursor-pointer items-center justify-between gap-03 rounded-sm px-01 py-[2px] text-left transition-opacity motion-micro-states hover:opacity-60 ${
                          marcadoVigente && !esteMarcado ? "opacity-30" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-02">
                          <span
                            className="size-03 shrink-0 rounded-sm"
                            style={{ backgroundColor: grupo.color }}
                          />
                          <Text
                            variant="body-s"
                            color="mid"
                            as="span"
                            className="truncate"
                          >
                            {grupo.nombre}
                          </Text>
                        </span>
                        <span className="flex shrink-0 items-center gap-01">
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
