"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GraficaBarras } from "@/components/ui/GraficaBarras";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Input";
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
  OPCIONES_FILTROS,
  RESUMEN_CARTERA,
  SOCIEDADES_CARTERA,
  agruparCartera,
  euros,
  kwh,
  puntosDeSociedad,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { Tendencia, ValorConUnidad } from "./PiezasAreaCliente";

/**
 * ConsumoAhorro — "Consumo y ahorro" (Figma nodo 797:8291).
 *
 * Es la versión ampliada de la sección "Consumo y ahorro" del Dashboard: el
 * mismo gráfico de barras y las mismas cuatro tarjetas de cabecera, pero con
 * sitio para los filtros completos, un aviso mientras llega la primera
 * factura, y el coste y el consumo cada uno con su propio bloque de
 * estadísticas (medio, máximo, mínimo) al lado de su gráfica.
 *
 * REUTILIZA, tal cual, las piezas del Dashboard (mismas reglas visuales):
 *   - `GraficaBarras`: eje, barras, tramas de "estimado" y tooltips — no se
 *     toca nada de eso aquí, esta pantalla solo le da más sitio.
 *   - `ValorConUnidad` / `Tendencia`: el número grande + unidad y la línea
 *     "-6% vs julio 2025", ahora en `PiezasAreaCliente.tsx` porque las usan
 *     las dos pantallas.
 *   - El mismo truco de "datos de mentira que se mueven": los filtros no
 *     tienen con qué recortar los doce meses de verdad, así que se escala el
 *     histórico por el PESO del filtro elegido sobre el total de la cartera
 *     (ver el comentario de `factor` en Dashboard.tsx). Aquí hay CUATRO
 *     filtros en vez de dos, y los cuatro funcionan por el mismo motivo:
 *     Sociedad y Ubicación pesan por sus puntos de suministro, Tipo de
 *     inmueble por los suyos, y Tipo de suministro por el reparto fijo entre
 *     luz y gas. Si un filtro no tiene ningún punto que pesar (por ejemplo,
 *     ninguna categoría está catalogada todavía), no se aplica — antes que
 *     vaciar la gráfica, se queda como estaba. Los filtros están a nivel de
 *     PANTALLA, no de gráfica: por eso el mismo `factor` también escala las
 *     cuatro tarjetas de arriba, no solo las dos gráficas — si no, cambiar
 *     un filtro movería una cosa sí y la otra no, y se leería como roto.
 *
 * Las flechas junto al título de cada gráfica (◀ ▶) están en el Figma sin
 * decir a dónde llevan — como "Organizar cartera" en su momento (ver
 * OrganizaTuCartera.tsx): aquí no hay más años de histórico que enseñar, así
 * que de momento van desactivadas en vez de fingir una navegación que no
 * existe.
 */
export function ConsumoAhorro() {
  const [sociedad, setSociedad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [tipoInmueble, setTipoInmueble] = useState("");
  const [tipo, setTipo] = useState("");

  // El mismo peso "puntos del filtro / puntos totales" para los cuatro,
  // menos Tipo de suministro (que no tiene puntos que pesar: reparte fijo).
  const gruposUbicacion = useMemo(() => agruparCartera("ubicacion"), []);
  const gruposInmueble = useMemo(() => agruparCartera("inmueble"), []);

  const sociedadElegida = SOCIEDADES_CARTERA.find((s) => s.nombre === sociedad);
  const factorSociedad = sociedadElegida
    ? puntosDeSociedad(sociedadElegida) / RESUMEN_CARTERA.puntos
    : 1;

  const grupoProvincia = gruposUbicacion.find((g) => g.nombre === provincia);
  const factorProvincia =
    provincia && grupoProvincia
      ? grupoProvincia.puntos / RESUMEN_CARTERA.puntos
      : 1;

  const grupoInmueble = gruposInmueble.find((g) => g.nombre === tipoInmueble);
  const factorTipoInmueble =
    tipoInmueble && grupoInmueble
      ? grupoInmueble.puntos / RESUMEN_CARTERA.puntos
      : 1;

  const factorTipo = tipo === "luz" ? 0.65 : tipo === "gas" ? 0.35 : 1;

  const factor = factorSociedad * factorProvincia * factorTipoInmueble * factorTipo;

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

      {/* Filtros */}
      <div className="mt-06 flex flex-wrap gap-03">
        <Select
          aria-label="Sociedad"
          className="w-[160px]"
          placeholder="Sociedad"
          value={sociedad}
          onChange={(e) => setSociedad(e.target.value)}
          options={OPCIONES_FILTROS.sociedades.map((s) => ({
            value: s,
            label: s,
          }))}
        />
        <Select
          aria-label="Ubicación"
          className="w-[160px]"
          placeholder="Ubicación"
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
          options={OPCIONES_FILTROS.provincias.map((p) => ({
            value: p,
            label: p,
          }))}
        />
        <Select
          aria-label="Tipo de inmueble"
          className="w-[180px]"
          placeholder="Tipo de inmueble"
          value={tipoInmueble}
          onChange={(e) => setTipoInmueble(e.target.value)}
          options={OPCIONES_FILTROS.tiposDeInmueble}
        />
        <Select
          aria-label="Tipo de suministro"
          className="w-[180px]"
          placeholder="Tipo de suministro"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          options={OPCIONES_FILTROS.tipos}
        />
      </div>

      {/* Las cuatro tarjetas de resumen — mismas que el Dashboard */}
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
            className="anim-aparece min-w-[220px] flex-1"
            style={retardo(i)}
          >
            {tarjeta}
          </div>
        ))}
      </div>

      {/* Coste y ahorro — TODO el bloque va dentro de una tarjeta grande
          (título incluido), y dentro de ella las tres estadísticas y la
          gráfica van CADA UNA en su propia tarjeta con borde (Figma nodo
          797:8393): antes ni la de fuera ni las de dentro tenían caja. */}
      <section className="mt-06 rounded-md border border-border-low bg-background-base p-06">
        <Text variant="heading-s" as="h2">
          Coste y ahorro
        </Text>

        <div className="mt-06 flex flex-col items-start gap-04 lg:flex-row">
          <div className="flex w-full flex-col gap-04 lg:w-[276px] lg:shrink-0">
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
                key={`coste-${sociedad}-${provincia}-${tipoInmueble}-${tipo}`}
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

        <div className="mt-06 flex flex-col items-start gap-04 lg:flex-row">
          <div className="flex w-full flex-col gap-04 lg:w-[276px] lg:shrink-0">
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
                key={`consumo-${sociedad}-${provincia}-${tipoInmueble}-${tipo}`}
                datos={datosConsumo}
                unidad=" kWh"
                formatear={kwh}
                etiquetaValorReal="Consumo"
                etiquetaValorEstimado="Consumo (Estimado)"
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
