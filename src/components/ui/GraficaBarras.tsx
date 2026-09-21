"use client";

import { Text } from "./Text";
import { Tooltip } from "./Tooltip";

/**
 * GraficaBarras — el histórico mensual de "Consumo y ahorro" del Dashboard.
 *
 * Es UNA sola columna por mes, no dos barras lado a lado: por detrás, una
 * caja gris lisa con borde discontinuo marca la serie de referencia (el
 * coste sin Aczo); por delante, pegada a su base, la caja de la serie
 * principal (el coste con Aczo) — SÓLIDA si el mes ya está facturado, con
 * trama a rayas si todavía es una estimación. La trama es la forma en la que
 * este sistema marca "esto es un cálculo, no un dato cerrado"; en cuanto
 * llega la factura real, la columna se rellena entera y deja de necesitarla.
 * El fondo gris liso, en cambio, siempre es solo una referencia con la que
 * comparar, así que nunca la lleva.
 *
 * La gráfica entera ocupa el ancho de la tarjeta (Figma, nodo 797:6176: el
 * contenedor de barras es `flex-1`). Las columnas miden siempre 26 px — no
 * se estiran — pero el HUECO entre ellas sí, repartiendo el ancho sobrante
 * con `justify-between`: por eso hay que dejarlas con `flex-1` + `max-width`
 * y no con un ancho fijo suelto, que las dejaría todas apelotonadas a la
 * izquierda en una tarjeta ancha.
 *
 * INTERACCIÓN Y ANIMACIÓN — esto es lo que hay que replicar en producto:
 *
 *   Las dos cajas de una misma columna CRECEN juntas al entrar, desde abajo,
 *   con un escalonado entre meses (anim-barra-crece, macro-structure: 500 ms,
 *   ease in out, 40 ms entre columna y columna). Una gráfica que aparece
 *   entera de golpe es un dibujo; una que crece se lee como "esto se está
 *   calculando", que es justo lo que pasa al cambiar de pestaña o de filtro —
 *   por eso vuelve a crecer cada vez que cambian esos datos (la `key` de
 *   fuera debe cambiar con ellos, igual que en la lista de "Mi cartera").
 *
 *   Al pasar el ratón por una columna sale el `Tooltip` del sistema con el
 *   mes, el valor exacto y, si hay serie de fondo, el ahorro de ese mes (la
 *   diferencia entre las dos series) — el dato que la barra solo insinúa con
 *   su altura.
 */

/** Cuánto espera cada columna respecto a la anterior al crecer. */
const ESCALONADO_MS = 40;
/** Alto del área de dibujo, en píxeles: no es un token, es la geometría del
 * propio gráfico (como el lienzo de GraficaAnillo). Se usa en píxeles y no en
 * porcentaje para que la altura de cada barra no dependa de que todos los
 * envoltorios de alrededor (incluido el del Tooltip) tengan su propio alto
 * explícito. */
const ALTO_DIBUJO = 200;

export type PuntoBarras = {
  id: string;
  etiqueta: string;
  valor: number;
  /** El valor de referencia con el que se compara (p. ej. "sin Aczo"). */
  valorFondo?: number;
  /** true: ya hay factura real de este mes (barra sólida). false u omitido:
   * todavía es una estimación (barra con trama). */
  real?: boolean;
};

/**
 * La trama a rayas de la serie principal cuando el mes es una estimación. Se
 * define aquí, en JS, y no como clase de Tailwind: es un patrón, no un color
 * de fondo suelto, y no hay ninguna utilidad del sistema para dibujarlo. El
 * color de las rayas sí es un token (`--color-highlight-deep`, el mismo
 * verde oscuro de marca que usa la barra lateral), nunca un valor a pelo.
 */
const TRAMA: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(-45deg, var(--color-highlight-deep) 0, var(--color-highlight-deep) 1px, transparent 1px, transparent 6px)",
};

export function GraficaBarras({
  datos,
  unidad,
  etiquetaValorReal,
  etiquetaValorEstimado,
  etiquetaFondo,
  formatear = (v: number) => String(v),
  anchoEje = "w-08",
}: {
  datos: PuntoBarras[];
  /** Sufijo del eje Y ("€", "kWh"). */
  unidad: string;
  /** Leyenda de la serie principal en los meses ya facturados. */
  etiquetaValorReal: string;
  /** Leyenda de la serie principal en los meses todavía estimados. */
  etiquetaValorEstimado: string;
  /** Leyenda de la serie de fondo, si la hay. */
  etiquetaFondo?: string;
  /** Cómo se escribe un valor del eje Y (p. ej. con punto de millar). */
  formatear?: (valor: number) => string;
  /**
   * Ancho del eje Y. Por defecto `w-08` (40 px), el que mide en el Dashboard
   * (ver el comentario de más abajo, "axis width fix"). Con números de más
   * cifras ("1.900 kWh") esos 40 px no bastan y la marca se parte en dos
   * líneas, lo que además estira toda la tarjeta — para esos casos hay que
   * pasar un ancho mayor, como `w-10`.
   */
  anchoEje?: "w-08" | "w-09" | "w-10";
}) {
  const mayor = Math.max(
    1,
    ...datos.map((d) => Math.max(d.valor, d.valorFondo ?? 0)),
  );
  // El eje sube en cuatro tramos iguales, redondeados a un número que se lea
  // bien (el múltiplo de 100 más próximo por encima del mayor valor) — así el
  // Dashboard marca "100€, 200€…" en vez de cortes a medias.
  const techo = Math.ceil(mayor / 100) * 100 || 100;
  const marcas = [techo, techo * 0.75, techo * 0.5, techo * 0.25, 0];

  // La leyenda solo enseña lo que de verdad aparece en los datos: si todos
  // los meses son ya reales (o todos estimados), sobra hablar del otro caso.
  const hayReales = datos.some((d) => d.real);
  const hayEstimados = datos.some((d) => !d.real);

  return (
    <div className="flex flex-col items-center gap-04">
      <div className="flex w-full gap-03">
        {/* El eje Y. Ancho fijo para que las marcas de todas las gráficas del
            Dashboard midan lo mismo y las barras arranquen siempre en la
            misma columna. */}
        <ul className={`flex ${anchoEje} flex-col justify-between pb-05 text-right`}>
          {marcas.map((marca) => (
            <li key={marca}>
              <Text variant="body-s" color="low" as="span">
                {formatear(marca)}
                {unidad}
              </Text>
            </li>
          ))}
        </ul>

        {/* Las columnas y sus meses van en la MISMA columna flex, con el
            mismo hueco entre ellos los dos: así quedan siempre alineados. El
            bloque ocupa TODO el ancho que queda (Figma: `flex-[1_0_0]`), y
            dentro las columnas se reparten ese ancho con `justify-between` —
            no se estiran, es el HUECO entre ellas el que crece o se
            encoge. */}
        <div className="flex min-w-0 flex-1 flex-col gap-02">
          <div className="flex h-[200px] items-end justify-between border-b border-border-low">
            {datos.map((punto, i) => {
              const alturaValor = (punto.valor / techo) * ALTO_DIBUJO;
              const retardo = { animationDelay: `${i * ESCALONADO_MS}ms` };
              const ahorro =
                punto.valorFondo !== undefined
                  ? punto.valorFondo - punto.valor
                  : undefined;
              const etiquetaSerie = punto.real
                ? etiquetaValorReal
                : etiquetaValorEstimado;
              // Sólida si ya hay factura; con trama si todavía es una
              // estimación — nunca las dos cosas a la vez.
              const estiloValor: React.CSSProperties = punto.real
                ? { backgroundColor: "var(--color-highlight-deep)" }
                : TRAMA;

              // Los mismos rótulos que la leyenda de debajo de la gráfica,
              // más el ahorro — que la barra sola no puede decir, porque es
              // la resta de dos series y no un dato con su propia altura.
              const contenidoTooltip = (
                <div className="flex flex-col gap-01">
                  <Text variant="label-s" color="always-light" as="p">
                    {punto.etiqueta}
                  </Text>
                  <Text variant="body-s" color="always-light" as="p">
                    {etiquetaSerie}: {formatear(punto.valor)}
                    {unidad}
                  </Text>
                  {punto.valorFondo !== undefined && etiquetaFondo && (
                    <Text variant="body-s" color="always-light" as="p">
                      {etiquetaFondo}: {formatear(punto.valorFondo)}
                      {unidad}
                    </Text>
                  )}
                  {ahorro !== undefined && (
                    <Text variant="body-s" color="always-light" as="p">
                      Ahorro del mes: {formatear(ahorro)}
                      {unidad}
                    </Text>
                  )}
                </div>
              );

              // Sin serie de fondo (p. ej. la pestaña de solo consumo): una
              // única caja, sin nada detrás con lo que compararla.
              if (punto.valorFondo === undefined) {
                return (
                  <Tooltip
                    key={punto.id}
                    content={contenidoTooltip}
                    tono="highlight"
                    bloque
                    className="w-full max-w-[26px] flex-1"
                  >
                    <div
                      className="anim-barra-crece w-full rounded-t-sm border border-highlight-deep"
                      style={{
                        height: `${alturaValor}px`,
                        ...retardo,
                        ...estiloValor,
                      }}
                    />
                  </Tooltip>
                );
              }

              const alturaFondo = (punto.valorFondo / techo) * ALTO_DIBUJO;
              return (
                <Tooltip
                  key={punto.id}
                  content={contenidoTooltip}
                  tono="highlight"
                  bloque
                  className="w-full max-w-[26px] flex-1"
                >
                  {/* Una sola columna: el fondo gris marca el techo de
                      referencia (sin Aczo), y la caja de la serie principal
                      se apoya en su base — NO son dos barras una junto a
                      otra. */}
                  <div
                    className="anim-barra-crece relative w-full rounded-t-sm border border-dashed border-border-mid bg-background-mid"
                    style={{ height: `${alturaFondo}px`, ...retardo }}
                  >
                    {/* `left`/`right` en -1px, no en 0: un elemento absoluto
                        se coloca por dentro del borde de su contenedor (la
                        "caja de relleno"), así que con `inset-0` esta caja
                        quedaría 2 px más estrecha que la de fuera (1 px de
                        border a cada lado) — se notaba en que la trama
                        quedaba más estrecha que el recuadro punteado de
                        detrás. Retrocediendo esos mismos 1 px, el borde
                        exterior de las dos cajas queda exactamente igual. */}
                    <div
                      className="absolute bottom-0 rounded-t-sm border border-highlight-deep"
                      style={{
                        left: -1,
                        right: -1,
                        height: `${alturaValor}px`,
                        ...estiloValor,
                      }}
                    />
                  </div>
                </Tooltip>
              );
            })}
          </div>

          {/* Los meses: el mismo `justify-between` que las barras de arriba
              y el mismo ancho por columna, así que cada uno queda centrado
              bajo la suya sea cual sea el ancho de la tarjeta. */}
          <div className="flex justify-between">
            {datos.map((punto) => (
              <div
                key={punto.id}
                className="w-full max-w-[26px] flex-1 text-center"
              >
                <Text variant="body-s" color="low" as="span">
                  {punto.etiqueta}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* La leyenda: centrada en la tarjeta (no bajo las columnas): así la
          pinta el Figma, como un bloque más dentro de la tarjeta con
          `items-center`. El fondo gris no lleva trama, así que su cuadrito
          ya se distingue solo. */}
      <ul className="flex flex-wrap justify-center gap-x-04 gap-y-01">
        {hayReales && (
          <li className="flex items-center gap-02">
            <span className="size-03 shrink-0 rounded-sm border border-highlight-deep bg-highlight-deep" />
            <Text variant="body-s" color="mid" as="span">
              {etiquetaValorReal}
            </Text>
          </li>
        )}
        {hayEstimados && (
          <li className="flex items-center gap-02">
            <span
              className="size-03 shrink-0 rounded-sm border border-highlight-deep"
              style={TRAMA}
            />
            <Text variant="body-s" color="mid" as="span">
              {etiquetaValorEstimado}
            </Text>
          </li>
        )}
        {etiquetaFondo && (
          <li className="flex items-center gap-02">
            <span className="size-03 shrink-0 rounded-sm border border-dashed border-border-mid bg-background-mid" />
            <Text variant="body-s" color="mid" as="span">
              {etiquetaFondo}
            </Text>
          </li>
        )}
      </ul>
    </div>
  );
}
