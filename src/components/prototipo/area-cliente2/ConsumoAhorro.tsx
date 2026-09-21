"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FiltroCasillas } from "@/components/ui/FiltroCasillas";
import { GraficaBarras } from "@/components/ui/GraficaBarras";
import { Icon } from "@/components/ui/Icon";
import { TarjetaDato } from "@/components/ui/TarjetaDato";
import { Text } from "@/components/ui/Text";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  ACTUALIZACION_DASHBOARD,
  AHORRO_POTENCIAL_ANUAL_DASHBOARD,
  AHORRO_REAL_ACUMULADO_DASHBOARD,
  COSTE_ULTIMO_MES_DASHBOARD,
  CONSUMO_MENSUAL_DASHBOARD,
  CONSUMO_ULTIMO_MES_DASHBOARD,
  FILTROS_VACIOS,
  OPCIONES_FILTROS,
  RESUMEN_CARTERA,
  agruparCartera,
  euros,
  kwh,
  type FiltrosCartera,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { Tendencia, ValorConUnidad } from "./PiezasAreaCliente";

/**
 * ConsumoAhorro — "Consumo y ahorro" (Figma nodo 797:8291).
 *
 * Es la versión ampliada de la sección "Consumo y ahorro" del Dashboard: el
 * mismo gráfico de barras y las mismas cuatro tarjetas de cabecera, pero con
 * sitio para los filtros completos y el coste y el consumo cada uno con su
 * propio bloque de estadísticas (medio, máximo, mínimo) al lado de su
 * gráfica.
 *
 * REUTILIZA, tal cual, las piezas del Dashboard (mismas reglas visuales):
 *   - `GraficaBarras`: eje, barras, tramas de "estimado" y tooltips — no se
 *     toca nada de eso aquí, esta pantalla solo le da más sitio.
 *   - `ValorConUnidad` / `Tendencia`: el número grande + unidad y la línea
 *     "-6% vs julio 2025", ahora en `PiezasAreaCliente.tsx` porque las usan
 *     las dos pantallas.
 *
 * LOS FILTROS SON DE VARIAS RESPUESTAS (`FiltroCasillas`, el mismo de "Mi
 * cartera"), no un desplegable de una sola opción: se puede marcar más de
 * una sociedad o más de una provincia a la vez, y no marcar ninguna quiere
 * decir "todas".
 *
 * Y SE EXCLUYEN ENTRE ELLOS: elegir una sociedad recorta las opciones que
 * ofrecen los demás filtros a lo que esa sociedad de verdad tiene — si
 * "mendesaltaren SL" no tiene ningún hotel, "Hotel" no sale en "Tipo de
 * inmueble" mientras esté marcada. `opcionesDisponibles` calcula esto
 * reutilizando `agruparCartera`: agrupa con los filtros puestos MENOS el que
 * se está calculando, y de las filas que quedan saca qué valores de ESE
 * filtro aparecen de verdad.
 *
 * "Datos de mentira que se mueven": los filtros no tienen con qué recortar
 * los doce meses de verdad, así que se escala el histórico por el PESO real
 * de la cartera filtrada sobre el total (puntos de suministro que pasan los
 * cuatro filtros a la vez, entre los puntos totales) — ya no es una
 * aproximación por filtro como antes: al cruzar los cuatro de verdad, el
 * peso ya sale exacto de la propia cartera filtrada. Los filtros están a
 * nivel de PANTALLA, no de gráfica, así que ese mismo peso también escala
 * las cuatro tarjetas de arriba: si no, cambiar un filtro movería una cosa
 * sí y la otra no, y se leería como roto.
 *
 * OJO: como ahora mismo NINGÚN inmueble tiene categoría puesta (ver "Mi
 * cartera"), el filtro "Tipo de inmueble" no tiene nada que ofrecer todavía
 * — no es un fallo, es que de verdad no hay ninguno catalogado. En cuanto se
 * nombren y categoricen inmuebles desde ModalOrganizaCartera, sus tipos
 * empiezan a aparecer aquí solos.
 *
 * Las flechas junto al título de cada gráfica (◀ ▶) están en el Figma sin
 * decir a dónde llevan — como "Organizar cartera" en su momento (ver
 * OrganizaTuCartera.tsx): aquí no hay más años de histórico que enseñar, así
 * que de momento van desactivadas en vez de fingir una navegación que no
 * existe.
 */
/**
 * Qué filas quedan si se aplican todos los filtros MENOS `sinFiltro` — es
 * decir, qué ofrece ese filtro dados los otros tres. Fuera del componente
 * (no depende de nada suyo) para no arrastrar el aviso de dependencias de
 * los `useMemo` que la usan: la única entrada real es `filtros`.
 */
function filasCon(filtros: FiltrosCartera, sinFiltro: keyof FiltrosCartera) {
  const f: FiltrosCartera = { ...filtros, [sinFiltro]: [] };
  return agruparCartera("ubicacion", f).flatMap((g) => g.detalle);
}

export function ConsumoAhorro() {
  const [filtros, setFiltros] = useState<FiltrosCartera>(FILTROS_VACIOS);
  const [filtroAbierto, setFiltroAbierto] = useState<
    keyof FiltrosCartera | null
  >(null);

  const sociedadesDisponibles = useMemo(
    () => new Set(filasCon(filtros, "sociedades").map((l) => l.sociedad)),
    [filtros],
  );
  const provinciasDisponibles = useMemo(
    () => new Set(filasCon(filtros, "direcciones").map((l) => l.provincia)),
    [filtros],
  );
  const tiposInmuebleDisponibles = useMemo(
    () =>
      new Set(
        filasCon(filtros, "tiposDeInmueble")
          .map((l) => l.categoria)
          .filter((c): c is NonNullable<typeof c> => !!c),
      ),
    [filtros],
  );
  const tiposDisponibles = useMemo(
    () => new Set(filasCon(filtros, "tipos").flatMap((l) => l.tipos)),
    [filtros],
  );

  // El peso real de la cartera filtrada (los cuatro filtros a la vez) sobre
  // el total: así se escala el histórico de mentira. Sin filtros, esto ya
  // da 1 solo (puntos filtrados = puntos totales), así que no hace falta
  // tratar ese caso aparte.
  const puntosFiltrados = useMemo(
    () =>
      agruparCartera("ubicacion", filtros).reduce((t, g) => t + g.puntos, 0),
    [filtros],
  );
  const factor =
    puntosFiltrados > 0 ? puntosFiltrados / RESUMEN_CARTERA.puntos : 1;

  const datosCoste = CONSUMO_MENSUAL_DASHBOARD.map((m) => ({
    id: m.mes,
    etiqueta: m.mes,
    valor: Math.round(m.costeConAczo * factor),
    valorFondo: Math.round(m.costeSinAczo * factor),
    real: m.real,
  }));

  const datosConsumo = CONSUMO_MENSUAL_DASHBOARD.map((m) => ({
    id: m.mes,
    etiqueta: m.mes,
    valor: Math.round(m.consumoKwh * factor),
    real: m.real,
  }));

  // Coste y consumo medio, máximo y mínimo — calculados sobre los doce meses
  // de verdad, nunca escritos a mano, así que si cambia el histórico estas
  // cifras siguen cuadrando con él.
  const estadisticas = useMemo(() => {
    const n = CONSUMO_MENSUAL_DASHBOARD.length;
    const costeConAczoMedio =
      CONSUMO_MENSUAL_DASHBOARD.reduce((t, m) => t + m.costeConAczo, 0) / n;
    const costeSinAczoMedio =
      CONSUMO_MENSUAL_DASHBOARD.reduce((t, m) => t + m.costeSinAczo, 0) / n;
    const consumoMedio =
      CONSUMO_MENSUAL_DASHBOARD.reduce((t, m) => t + m.consumoKwh, 0) / n;
    const maximo = CONSUMO_MENSUAL_DASHBOARD.reduce((a, b) =>
      b.consumoKwh > a.consumoKwh ? b : a,
    );
    const minimo = CONSUMO_MENSUAL_DASHBOARD.reduce((a, b) =>
      b.consumoKwh < a.consumoKwh ? b : a,
    );
    return {
      ahorroMedioMensual: costeSinAczoMedio - costeConAczoMedio,
      costeConAczoMedio,
      costeSinAczoMedio,
      consumoMedio,
      maximo,
      minimo,
    };
  }, []);

  const abrir = (campo: keyof FiltrosCartera) => (abre: boolean) =>
    setFiltroAbierto(abre ? campo : null);

  return (
    <>
      {/* Cabecera */}
      <header className="flex flex-wrap items-end justify-between gap-04">
        <div className="flex flex-col gap-01">
          <Text variant="label-s-uppercase" color="low" as="p">
            Última actualización · {ACTUALIZACION_DASHBOARD}
          </Text>
          <Text variant="heading-l" as="h1">
            Consumo y ahorro
          </Text>
          <Text variant="body-s" color="mid" as="p">
            Qué consumes, qué pagas y cuánto ahorras con Aczo
          </Text>
        </div>
        <Button size="small">Añadir nuevos suministros</Button>
      </header>

      {/* Filtros — de varias respuestas y excluyentes entre ellos (ver el
          comentario de arriba). */}
      <div className="mt-06 flex flex-wrap gap-02">
        <FiltroCasillas
          nombre="Sociedad"
          abierto={filtroAbierto === "sociedades"}
          onAbrir={abrir("sociedades")}
          seleccion={filtros.sociedades}
          onChange={(sociedades) => setFiltros((f) => ({ ...f, sociedades }))}
          grupos={[
            {
              opciones: OPCIONES_FILTROS.sociedades
                .filter((s) => sociedadesDisponibles.has(s))
                .map((s) => ({ value: s, label: s })),
            },
          ]}
        />
        <FiltroCasillas
          nombre="Ubicación"
          abierto={filtroAbierto === "direcciones"}
          onAbrir={abrir("direcciones")}
          seleccion={filtros.direcciones}
          onChange={(direcciones) =>
            setFiltros((f) => ({ ...f, direcciones }))
          }
          grupos={[
            {
              opciones: OPCIONES_FILTROS.provincias
                .filter((p) => provinciasDisponibles.has(p))
                .map((p) => ({ value: p, label: p })),
            },
          ]}
        />
        <FiltroCasillas
          nombre="Tipo de inmueble"
          abierto={filtroAbierto === "tiposDeInmueble"}
          onAbrir={abrir("tiposDeInmueble")}
          seleccion={filtros.tiposDeInmueble}
          onChange={(tiposDeInmueble) =>
            setFiltros((f) => ({
              ...f,
              tiposDeInmueble: tiposDeInmueble as FiltrosCartera["tiposDeInmueble"],
            }))
          }
          grupos={[
            {
              opciones: OPCIONES_FILTROS.tiposDeInmueble.filter((o) =>
                tiposInmuebleDisponibles.has(o.value),
              ),
            },
          ]}
        />
        <FiltroCasillas
          nombre="Tipo de suministro"
          abierto={filtroAbierto === "tipos"}
          onAbrir={abrir("tipos")}
          seleccion={filtros.tipos}
          onChange={(tipos) =>
            setFiltros((f) => ({
              ...f,
              tipos: tipos as FiltrosCartera["tipos"],
            }))
          }
          grupos={[
            {
              opciones: OPCIONES_FILTROS.tipos.filter((o) =>
                tiposDisponibles.has(o.value),
              ),
            },
          ]}
        />
      </div>

      {/* Las cuatro tarjetas de resumen — mismas que el Dashboard. `flex` en
          el envoltorio (no solo en la fila) para que el `flex-1` de dentro
          de TarjetaDato tenga de verdad un padre flex del que tirar — si no,
          items-stretch estira el envoltorio pero la tarjeta de dentro se
          queda con su alto de contenido, y las cuatro no miden lo mismo. */}
      <div className="mt-04 flex flex-wrap items-stretch gap-04">
        {[
          <TarjetaDato
            key="potencial"
            rotulo="Ahorro potencial (estimado)"
            destacado
            className="border border-border-low"
          >
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={euros(AHORRO_POTENCIAL_ANUAL_DASHBOARD * factor)}
                unidad="€/año"
              />
              <Text variant="body-s" color="disabled" as="p">
                En base a tus facturas anteriores
              </Text>
            </div>
          </TarjetaDato>,
          <TarjetaDato
            key="real"
            rotulo="Ahorro real acumulado"
            destacado
            className="border border-border-low"
          >
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={euros(AHORRO_REAL_ACUMULADO_DASHBOARD * factor)}
                unidad="€"
              />
              <Text variant="body-s" color="disabled" as="p">
                Valor disponible con tu primera factura
              </Text>
            </div>
          </TarjetaDato>,
          <TarjetaDato
            key="coste"
            rotulo="Coste (último mes)"
            className="border border-border-low"
          >
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={euros(COSTE_ULTIMO_MES_DASHBOARD.valor * factor)}
                unidad="€"
              />
              <Tendencia variacion={COSTE_ULTIMO_MES_DASHBOARD.variacion} />
            </div>
          </TarjetaDato>,
          <TarjetaDato
            key="consumo"
            rotulo="Consumo (último mes)"
            className="border border-border-low"
          >
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={kwh(Math.round(CONSUMO_ULTIMO_MES_DASHBOARD.valor * factor))}
                unidad="kWh"
              />
              <Tendencia variacion={CONSUMO_ULTIMO_MES_DASHBOARD.variacion} />
            </div>
          </TarjetaDato>,
        ].map((tarjeta, i) => (
          <div
            key={tarjeta.key}
            className="anim-aparece flex min-w-[220px] flex-1"
            style={retardo(i)}
          >
            {tarjeta}
          </div>
        ))}
      </div>

      {/* Coste y ahorro — TODO el bloque va dentro de una tarjeta grande
          (título incluido), y dentro de ella las tres estadísticas y la
          gráfica van CADA UNA en su propia tarjeta con borde (Figma nodo
          797:8393). `items-stretch` + `justify-between` en la columna de
          estadísticas: así, si la gráfica sale un pelín más alta que las
          tres tarjetas juntas, ese margen se reparte entre ellas en vez de
          dejar un hueco suelto al final. */}
      <section className="mt-06 rounded-md border border-border-low bg-background-base p-06">
        <Text variant="heading-s" as="h2">
          Coste y ahorro
        </Text>

        <div className="mt-06 flex flex-col items-stretch gap-04 lg:flex-row">
          <div className="flex w-full flex-col justify-between gap-04 lg:w-[276px] lg:shrink-0">
            <TarjetaDato
              rotulo="Ahorro medio mensual (est.)"
              destacado
              className="border border-border-low"
            >
              <div className="flex flex-col gap-01">
                <ValorConUnidad
                  valor={euros(estadisticas.ahorroMedioMensual)}
                  unidad="€/mes"
                />
                <Text variant="body-s" color="disabled" as="p">
                  En base a tus facturas anteriores
                </Text>
              </div>
            </TarjetaDato>
            <TarjetaDato
              rotulo="Coste medio con Aczo (est.)"
              className="border border-border-low"
            >
              <ValorConUnidad
                valor={euros(estadisticas.costeConAczoMedio)}
                unidad="€"
              />
            </TarjetaDato>
            <TarjetaDato
              rotulo="Coste medio sin Aczo (est.)"
              className="border border-border-low"
            >
              <ValorConUnidad
                valor={euros(estadisticas.costeSinAczoMedio)}
                unidad="€"
              />
            </TarjetaDato>
          </div>

          <div className="min-w-0 flex-1 rounded-md border border-border-low bg-background-base p-06">
            <CabeceraGrafica
              titulo="Coste mensual (€)"
              tooltip="Comparamos lo que estás pagando con tu tarifa actual (estimado en los meses aún sin facturar) frente a lo que te costaría el mismo consumo con tu comercializadora anterior, antes de ser cliente Aczo."
            />
            <div className="mt-05">
              <GraficaBarras
                key={JSON.stringify(filtros)}
                datos={datosCoste}
                unidad="€"
                formatear={euros}
                etiquetaValorReal="Coste con Aczo"
                etiquetaValorEstimado="Coste con Aczo (Estimado)"
                etiquetaFondo="Coste sin Aczo (Estimado)"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Consumo — misma técnica que "Coste y ahorro". */}
      <section className="mt-06 rounded-md border border-border-low bg-background-base p-06">
        <Text variant="heading-s" as="h2">
          Consumo
        </Text>

        <div className="mt-06 flex flex-col items-stretch gap-04 lg:flex-row">
          <div className="flex w-full flex-col justify-between gap-04 lg:w-[276px] lg:shrink-0">
            <TarjetaDato
              rotulo="Consumo medio (est.)"
              className="border border-border-low"
            >
              <div className="flex flex-col gap-01">
                <ValorConUnidad
                  valor={kwh(Math.round(estadisticas.consumoMedio))}
                  unidad="kWh/mes"
                />
                <Text variant="body-s" color="disabled" as="p">
                  Últimos 12 meses
                </Text>
              </div>
            </TarjetaDato>
            <TarjetaDato
              rotulo="Consumo máximo"
              className="border border-border-low"
            >
              <div className="flex flex-col gap-01">
                <ValorConUnidad
                  valor={kwh(estadisticas.maximo.consumoKwh)}
                  unidad="kWh"
                />
                <Text variant="body-s" color="disabled" as="p">
                  Últimos 12 meses · {estadisticas.maximo.mes}
                </Text>
              </div>
            </TarjetaDato>
            <TarjetaDato
              rotulo="Consumo mínimo"
              className="border border-border-low"
            >
              <div className="flex flex-col gap-01">
                <ValorConUnidad
                  valor={kwh(estadisticas.minimo.consumoKwh)}
                  unidad="kWh"
                />
                <Text variant="body-s" color="disabled" as="p">
                  Últimos 12 meses · {estadisticas.minimo.mes}
                </Text>
              </div>
            </TarjetaDato>
          </div>

          <div className="min-w-0 flex-1 rounded-md border border-border-low bg-background-base p-06">
            <CabeceraGrafica
              titulo="Consumo mensual (kWh)"
              tooltip="Lo que consumes cada mes, con los meses aún sin facturar estimados a partir de tu histórico de consumo."
            />
            <div className="mt-05">
              <GraficaBarras
                key={JSON.stringify(filtros)}
                datos={datosConsumo}
                unidad=" kWh"
                formatear={kwh}
                etiquetaValorReal="Consumo"
                etiquetaValorEstimado="Consumo (Estimado)"
                anchoEje="w-10"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** El título de cada gráfica, con su tooltip y las flechas (desactivadas, ver arriba). */
function CabeceraGrafica({
  titulo,
  tooltip,
}: {
  titulo: string;
  tooltip: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-03">
      <span className="flex items-center gap-02">
        <Text variant="label-l" as="h3">
          {titulo}
        </Text>
        <Tooltip content={tooltip} tono="highlight">
          <Icon name="info" size={16} className="text-content-low" />
        </Tooltip>
      </span>
      <span className="flex items-center gap-01">
        <button
          type="button"
          disabled
          aria-label="Periodo anterior"
          className="flex cursor-not-allowed items-center rounded-md p-01 text-content-low opacity-40"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <button
          type="button"
          disabled
          aria-label="Periodo siguiente"
          className="flex cursor-not-allowed items-center rounded-md p-01 text-content-low opacity-40"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </span>
    </div>
  );
}
