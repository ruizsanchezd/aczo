"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GraficaAnillo } from "@/components/ui/GraficaAnillo";
import { GraficaBarras } from "@/components/ui/GraficaBarras";
import { Icon } from "@/components/ui/Icon";
import { PuntoEstado } from "@/components/ui/PuntoEstado";
import { TarjetaDato } from "@/components/ui/TarjetaDato";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  ACTUALIZACION_DASHBOARD,
  AHORRO_POTENCIAL_ANUAL_DASHBOARD,
  AHORRO_REAL_ACUMULADO_DASHBOARD,
  COSTE_ULTIMO_MES_DASHBOARD,
  CONSUMO_MENSUAL_DASHBOARD,
  CONSUMO_ULTIMO_MES_DASHBOARD,
  ESTADOS_CARTERA,
  OPCIONES_FILTROS,
  RESUMEN_CARTERA,
  SOCIEDADES_CARTERA,
  agruparCartera,
  euros,
  kwh,
  puntosDeSociedad,
  type ModoAgrupacion,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { SelectorCompacto, Tendencia, ValorConUnidad } from "./PiezasAreaCliente";

/**
 * Dashboard — la primera pantalla que se ve al entrar en el área de cliente.
 *
 * Es el resumen: cuánto se puede ahorrar, cómo va el consumo mes a mes y en
 * qué punto está la cartera. El detalle de cada cosa vive en su propia
 * sección del menú lateral (`onVerCartera` lleva a "Mi cartera"); aquí solo
 * se cuenta lo justo para saber si hace falta entrar a mirar algo.
 *
 * ESCENARIO: casi un año de cliente (Figma, nodo 788:11027). Ya hay ocho
 * meses de factura real (Enero-Agosto) y cuatro que siguen siendo estimación
 * (Septiembre-Diciembre) — a diferencia del primer momento como cliente, en
 * el que TODO era una estimación y "Ahorro real acumulado", "Coste" y
 * "Consumo del último mes" estaban en "--" (ver el aviso que llevaba
 * entonces la gráfica, que aquí ya no hace falta).
 *
 * ANIMACIÓN DE ENTRADA
 *   Las cuatro tarjetas de arriba entran en cascada (PASO_CASCADA, 60 ms),
 *   igual que en "Mi cartera": es el mismo gesto en toda el área de cliente.
 *   La gráfica de barras crece desde abajo (ver GraficaBarras) y vuelve a
 *   crecer cada vez que cambia la pestaña (Coste€/Consumo kWh) o la sociedad,
 *   porque su `key` cambia con ellas. El anillo de "Detalle cartera" se
 *   dibuja igual que en "Mi cartera" (ver GraficaAnillo).
 */

const PESTAÑAS_GRAFICA = [
  { id: "coste-luz-gas", rotulo: "Coste luz y gas" },
  { id: "consumo-luz", rotulo: "Consumo Luz" },
  { id: "consumo-gas", rotulo: "Consumo Gas" },
] as const;
type PestañaGrafica = (typeof PESTAÑAS_GRAFICA)[number]["id"];

const PESTAÑAS_CARTERA = [
  { id: "estado", rotulo: "Estado cartera" },
  { id: "detalle", rotulo: "Detalle cartera" },
] as const;
type PestañaCartera = (typeof PESTAÑAS_CARTERA)[number]["id"];

/** Las tres formas de agrupar "Detalle cartera". A diferencia de "Mi
 * cartera" no hay "Inmueble": aquí el sitio es pequeño y estas tres son las
 * que pide el Figma (nodo 788:11195, "DS Tabs"). */
const PESTAÑAS_DETALLE: { id: ModoAgrupacion; rotulo: string }[] = [
  { id: "sociedad", rotulo: "Sociedades" },
  { id: "comercializadora", rotulo: "Comercializadoras" },
  { id: "ubicacion", rotulo: "Ubicación" },
];

/** El filtro "Tipo de suministro" de la gráfica: a diferencia del de "Mi
 * cartera" (casillas, sin elegir ninguna = todas), aquí "Luz y Gas" es una
 * opción más, explícita y elegida por defecto — así lo pide el Figma. */
const OPCIONES_TIPO_SUMINISTRO = [
  { value: "", label: "Luz y Gas" },
  { value: "luz", label: "Luz" },
  { value: "gas", label: "Gas" },
] as const;

export function Dashboard({
  onVerCartera,
  onVerConsumo,
  onAbrirNuevoSuministro,
}: {
  onVerCartera?: () => void;
  onVerConsumo?: () => void;
  /** Abre el asistente "Añadir nuevos suministros" (ver
   * NuevoSuministroCliente.tsx), otra sección del mismo `seccion` state de
   * AreaCliente2.tsx. */
  onAbrirNuevoSuministro?: () => void;
}) {
  const [pestañaGrafica, setPestañaGrafica] =
    useState<PestañaGrafica>("coste-luz-gas");
  // "" es "todas las sociedades" / "Luz y Gas": los dos desplegables son de
  // elección única, con esa opción combinada siempre la primera de la lista
  // (así sale en el Figma, nodo 797:6176: "Sociedades" y "Tipo de
  // suministro" son campos sencillos, no las casillas de "Mi cartera").
  const [sociedad, setSociedad] = useState("");
  const [tipo, setTipo] = useState("");
  const [pestañaCartera, setPestañaCartera] =
    useState<PestañaCartera>("detalle");
  const [detalleCarteraPor, setDetalleCarteraPor] =
    useState<ModoAgrupacion>("sociedad");
  const [grupoMarcado, setGrupoMarcado] = useState<string | null>(null);

  const esCoste = pestañaGrafica === "coste-luz-gas";

  // Los datos de mentira no tienen histórico mensual por sociedad ni por
  // luz/gas por separado, así que al elegir un filtro no hay con qué
  // recortar los doce meses de verdad. En vez de dejar la gráfica quieta
  // (que se lee como "esto no ha hecho nada"), se escala por un factor
  // creíble: el peso de la sociedad elegida sobre el total de puntos de
  // suministro, y un reparto fijo entre luz y gas. No es el dato real de esa
  // sociedad — sigue siendo un cálculo de mentira, pero se MUEVE, que es lo
  // que hace que el filtro se sienta vivo.
  const sociedadElegida = SOCIEDADES_CARTERA.find((s) => s.nombre === sociedad);
  const factorSociedad = sociedadElegida
    ? puntosDeSociedad(sociedadElegida) / RESUMEN_CARTERA.puntos
    : 1;
  const factorTipo = tipo === "luz" ? 0.65 : tipo === "gas" ? 0.35 : 1;
  const factor = factorSociedad * factorTipo;

  const datosGrafica = CONSUMO_MENSUAL_DASHBOARD.map((m) => ({
    id: m.mes,
    etiqueta: m.mes,
    valor: Math.round((esCoste ? m.costeConAczo : m.consumoKwh) * factor),
    valorFondo: esCoste
      ? Math.round(m.costeSinAczo * factor)
      : undefined,
    real: m.real,
  }));

  const totalPuntos = RESUMEN_CARTERA.puntos;
  const activos = RESUMEN_CARTERA.estados.activa;
  const porcentajeCompletado = totalPuntos
    ? Math.round((activos / totalPuntos) * 100)
    : 0;

  // "Detalle cartera": los mismos grupos que "Mi cartera" agrupando por
  // sociedad o comercializadora ya traen su color (el de la sociedad que
  // manda en el grupo — ver `GrupoCartera.color`), así que no hace falta
  // recalcular ninguna paleta aquí.
  const gruposDetalle = useMemo(
    () => agruparCartera(detalleCarteraPor),
    [detalleCarteraPor],
  );
  const puntosDetalle = gruposDetalle.reduce((t, g) => t + g.puntos, 0);

  return (
    <>
      {/* Cabecera */}
      <header className="flex flex-wrap items-end justify-between gap-04">
        <div className="flex flex-col gap-01">
          <Text variant="label-s-uppercase" color="low" as="p">
            Última actualización · {ACTUALIZACION_DASHBOARD}
          </Text>
          <Text variant="heading-l" as="h1">
            Dashboard
          </Text>
        </div>
        <Button size="small" onClick={onAbrirNuevoSuministro}>
          Añadir nuevos suministros
        </Button>
      </header>

      {/* Las cuatro tarjetas de resumen */}
      <div className="mt-06 flex flex-wrap items-stretch gap-05">
        {[
          <TarjetaDato key="potencial" rotulo="Ahorro potencial (estimado)">
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={euros(AHORRO_POTENCIAL_ANUAL_DASHBOARD)}
                unidad="€/año"
              />
              <Text variant="body-s" color="disabled" as="p">
                En base a tus facturas anteriores
              </Text>
            </div>
          </TarjetaDato>,
          <TarjetaDato key="real" rotulo="Ahorro real acumulado">
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={euros(AHORRO_REAL_ACUMULADO_DASHBOARD)}
                unidad="€"
              />
              <Text variant="body-s" color="disabled" as="p">
                Valor disponible con tu primera factura
              </Text>
            </div>
          </TarjetaDato>,
          <TarjetaDato key="coste" rotulo="Coste (último mes)">
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={euros(COSTE_ULTIMO_MES_DASHBOARD.valor)}
                unidad="€"
              />
              <Tendencia variacion={COSTE_ULTIMO_MES_DASHBOARD.variacion} />
            </div>
          </TarjetaDato>,
          <TarjetaDato key="consumo" rotulo="Consumo (último mes)">
            <div className="flex flex-col gap-01">
              <ValorConUnidad
                valor={kwh(CONSUMO_ULTIMO_MES_DASHBOARD.valor)}
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

      {/* Consumo y ahorro + Cartera, lado a lado. `items-start`: cada tarjeta
          se queda con SU alto, del contenido que tiene dentro — no con el de
          la más alta de la fila. Si no, cambiar de pestaña dentro de
          "Cartera" (Estado ↔ Detalle, que no miden lo mismo) estiraría o
          encogería también la tarjeta de "Consumo y ahorro", que no tiene
          nada que ver con ese cambio. */}
      <div className="mt-06 flex flex-col items-start gap-04 lg:flex-row">
        {/* Consumo y ahorro */}
        <section className="min-w-0 flex-1 rounded-md bg-background-base p-06">
          <div className="flex flex-wrap items-center justify-between gap-04">
            <span className="flex items-center gap-02">
              <Text variant="heading-s" as="h2">
                Consumo y ahorro
              </Text>
              <Tooltip
                content="Comparamos lo que estás pagando con tu tarifa actual (estimado en los meses aún sin facturar) frente a lo que te costaría el mismo consumo con tu comercializadora anterior, antes de ser cliente Aczo."
                tono="highlight"
              >
                <Icon name="info" size={16} className="text-content-low" />
              </Tooltip>
            </span>
            {/* "DS Button" tipo enlace: texto en highlight-muted y
                subrayado. No es el `Button` terciario del sistema (ese va en
                content-high, sin subrayar) ni pasa por `<Text>` — `<Text>`
                pintaría su propio negro por defecto y tapa el color de aquí,
                el mismo problema que tuvo el rótulo de la barra lateral. */}
            <button
              type="button"
              onClick={onVerConsumo}
              className="flex items-center gap-01 text-highlight-muted underline transition-opacity motion-micro-states hover:opacity-60"
            >
              <span className="text-label-s">Ver consumo y ahorro</span>
              <Icon name="chevron-right" size={16} />
            </button>
          </div>

          <div className="mt-03 flex flex-wrap items-center justify-between gap-03">
            <Toggle
              etiqueta="Ver por"
              opciones={PESTAÑAS_GRAFICA}
              valor={pestañaGrafica}
              onChange={setPestañaGrafica}
            />
            <div className="flex items-center gap-02">
              <SelectorCompacto
                etiqueta="Sociedades"
                valor={sociedad}
                onChange={setSociedad}
                opciones={[
                  { value: "", label: "Sociedades" },
                  ...OPCIONES_FILTROS.sociedades.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
              <SelectorCompacto
                etiqueta="Tipo de suministro"
                valor={tipo}
                onChange={setTipo}
                opciones={OPCIONES_TIPO_SUMINISTRO}
              />
            </div>
          </div>

          <div className="mt-05">
            {/* La `key` hace que la gráfica vuelva a crecer al cambiar de
                pestaña — el mismo truco que la lista de "Mi cartera" al
                cambiar de agrupación. */}
            <GraficaBarras
              key={`${pestañaGrafica}-${sociedad}-${tipo}`}
              datos={datosGrafica}
              unidad={esCoste ? "€" : " kWh"}
              formatear={esCoste ? euros : kwh}
              etiquetaValorReal={esCoste ? "Coste con Aczo" : "Consumo"}
              etiquetaValorEstimado={
                esCoste ? "Coste con Aczo (Estimado)" : "Consumo (Estimado)"
              }
              etiquetaFondo={esCoste ? "Coste sin Aczo (Estimado)" : undefined}
            />
          </div>
        </section>

        {/* Cartera */}
        <section className="flex w-full flex-col gap-04 rounded-md bg-background-base p-06 lg:w-[364px] lg:shrink-0">
          <div className="flex flex-col gap-03">
            <div className="flex items-center justify-between gap-04">
              <Text variant="heading-s" as="h2">
                Cartera
              </Text>
              <button
                type="button"
                onClick={onVerCartera}
                className="flex items-center gap-01 text-highlight-muted underline transition-opacity motion-micro-states hover:opacity-60"
              >
                <span className="text-label-s">Ver cartera</span>
              </button>
            </div>
            <Text variant="label-s" color="low" as="p">
              {RESUMEN_CARTERA.puntos} ptos de suministro ·{" "}
              {RESUMEN_CARTERA.inmuebles} inmuebles ·{" "}
              {RESUMEN_CARTERA.sociedades} sociedades
            </Text>

            <Toggle
              etiqueta="Ver cartera por"
              opciones={PESTAÑAS_CARTERA}
              valor={pestañaCartera}
              onChange={setPestañaCartera}
            />
          </div>

          {pestañaCartera === "estado" ? (
            <div className="flex flex-col gap-05">
              <div className="flex flex-col gap-02">
                {/* "84" en la tipografía de marca, y "% completado" en una
                    etiqueta gris más pequeña al lado — son DOS estilos
                    distintos en el mismo renglón, no un único texto grande. */}
                <p className="flex items-baseline gap-01">
                  <Text variant="heading-s" as="span">
                    {porcentajeCompletado}
                  </Text>
                  <Text variant="label-s" color="low" as="span">
                    % completado
                  </Text>
                </p>
                <Text variant="label-s" color="low" as="p">
                  {activos} de {totalPuntos} puntos ya activos con Aczo
                </Text>
              </div>

              {/* La barra de estados: cada tramo pesa lo que pesa su estado
                  sobre el total, con el mismo color que su puntito de abajo.
                  Va sin animación de entrada propia porque no se dibuja como
                  el anillo de "Detalle cartera" — aquí lo que importa es
                  leerla de un vistazo al llegar a la pantalla, y una barra
                  que crece desde 0 % tardaría en decir lo único que hace
                  falta decir. */}
              <div className="flex h-06 w-full overflow-hidden rounded-sm bg-background-low">
                {ESTADOS_CARTERA.map((estado) => {
                  const cantidad = RESUMEN_CARTERA.estados[estado.id];
                  const ancho = totalPuntos ? (cantidad / totalPuntos) * 100 : 0;
                  if (ancho <= 0) return null;
                  return (
                    <span
                      key={estado.id}
                      className={`${estado.color} h-full`}
                      style={{ width: `${ancho}%` }}
                    />
                  );
                })}
              </div>

              <ul className="flex flex-col gap-01">
                {ESTADOS_CARTERA.map((estado) => (
                  <li key={estado.id}>
                    <PuntoEstado
                      tamano="m"
                      color={estado.color}
                      rotulo={estado.rotulo}
                      cantidad={RESUMEN_CARTERA.estados[estado.id]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-04">
              {/* Las tres pestañas subrayadas (DS Tabs): sociedad, quién la
                  comercializa, o dónde está. Cambiar de una a otra reinicia
                  lo marcado, igual que cambiar de "Agrupar por" en "Mi
                  cartera" — un grupo marcado en "Sociedades" no significa
                  nada en "Ubicación". */}
              <div
                role="tablist"
                aria-label="Ver detalle de cartera por"
                className="flex gap-04 border-b border-border-low"
              >
                {PESTAÑAS_DETALLE.map((p) => {
                  const activa = p.id === detalleCarteraPor;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={activa}
                      onClick={() => {
                        setDetalleCarteraPor(p.id);
                        setGrupoMarcado(null);
                      }}
                      className={`cursor-pointer border-b-2 py-02 transition-colors motion-micro-states ${
                        activa
                          ? "border-content-high"
                          : "border-transparent hover:opacity-60"
                      }`}
                    >
                      <Text
                        variant="label-m"
                        as="span"
                        color={activa ? "high" : "low"}
                      >
                        {p.rotulo}
                      </Text>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                {/* El Figma pide 178px, pero a ese tamaño "Ptos de
                    suministro" roza el aro — más ancho le da aire sin que
                    dejen de caber sus 316px la tarjeta. */}
                <div className="w-[220px]">
                  <GraficaAnillo
                    key={detalleCarteraPor}
                    unidad="Ptos de suministro"
                    seleccionado={grupoMarcado}
                    onSeleccionar={(id) =>
                      setGrupoMarcado(grupoMarcado === id ? null : id)
                    }
                    segmentos={gruposDetalle.map((g) => ({
                      id: g.id,
                      etiqueta: g.nombre,
                      valor: g.puntos,
                      color: g.color,
                    }))}
                  />
                </div>
              </div>

              <ul className="flex flex-col gap-02">
                {gruposDetalle.map((grupo) => {
                  const porcentaje = puntosDetalle
                    ? Math.round((grupo.puntos / puntosDetalle) * 100)
                    : 0;
                  const marcado = grupoMarcado === grupo.id;
                  return (
                    <li key={grupo.id}>
                      <button
                        type="button"
                        aria-pressed={marcado}
                        onClick={() =>
                          setGrupoMarcado(marcado ? null : grupo.id)
                        }
                        className={`flex w-full cursor-pointer items-center justify-between gap-02 rounded-sm text-left transition-opacity motion-micro-states hover:opacity-60 ${
                          grupoMarcado && !marcado ? "opacity-40" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-02">
                          <span
                            className="size-03 shrink-0 rounded-sm"
                            style={{ backgroundColor: grupo.color }}
                          />
                          <Text
                            variant="body-s"
                            color="low"
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
                          <Text variant="label-s" color="low" as="span">
                            {porcentaje}%
                          </Text>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

