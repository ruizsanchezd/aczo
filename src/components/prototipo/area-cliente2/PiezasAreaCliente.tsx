"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { AHORRO_EXTRA_DASHBOARD, euros, MES_COMPARACION_DASHBOARD } from "@/mocks/aczo";

/**
 * PiezasAreaCliente — piezas pequeñas que comparte más de una pantalla del
 * área de cliente (Dashboard, "Mi cartera" y "Consumo y ahorro"). Viven
 * aparte para no duplicarlas entre las tres.
 */

/**
 * BannerAhorroExtra — "Hemos detectado una oportunidad de ahorro extra"
 * (Figma nodo 878:13973): la misma banda, en las tres pantallas donde
 * aparece (Dashboard, Mi cartera, Consumo y ahorro), justo debajo de la
 * cabecera. Es una superficie oscura fija (`highlight-deep`, igual que la
 * barra lateral), así que el texto va con los `content-always-*` en vez de
 * `content-high`/`content-mid` — si no, se volvería invisible el día que se
 * active el modo oscuro (ver CLAUDE.md, "superficie oscura").
 *
 * "Ver ahorro" no tiene destino en el Figma todavía: es un botón visual,
 * igual que "Comparar comercializadoras" en el asistente de nuevo
 * suministro — deja el gesto a la vista sin inventar una pantalla que no
 * está diseñada.
 */
export function BannerAhorroExtra() {
  return (
    <div className="mt-06 flex flex-wrap items-center gap-03 rounded-md bg-highlight-deep px-04 py-03">
      <Icon
        name="piggy-bank"
        className="shrink-0 text-highlight-vivid"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-01">
        {/* `font-bold` a pelo: el Figma de este aviso concreto (nodo
            878:13973) pone esta línea en negrita de verdad (peso 700), y
            ningún variant de Text la trae — body-m es peso 400 siempre. No
            hay una utilidad de peso en el sistema para esto todavía. El
            tamaño SÍ es el de `body-m` (14/20), no `label-s` (12/16): las dos
            líneas del aviso miden igual en el Figma, la de arriba solo
            cambia en el peso. */}
        <p>
          <Text
            variant="body-m"
            as="span"
            color="always-light"
            className="font-bold"
          >
            Hemos detectado una oportunidad de ahorro extra.
          </Text>{" "}
          <Text
            variant="body-m"
            as="span"
            className="font-bold text-highlight-vivid"
          >
            Oferta válida durante 48h.
          </Text>
        </p>
        <Text variant="body-m" as="p" color="always-light">
          Podrías ahorrar {euros(AHORRO_EXTRA_DASHBOARD)} € extra al año
          cambiando de comercializadora.
        </Text>
      </div>
      <Button variant="primary" feedback="highlight" size="small">
        Ver ahorro
      </Button>
    </div>
  );
}

/**
 * ValorConUnidad — el número grande de una tarjeta seguido de su unidad
 * ("8.300 €/año", "7.234 €"). Son DOS tipografías, no una: el número va en
 * la de marca (`heading-m`, 24 px) y la unidad en una etiqueta gris pequeña
 * al lado (`label-s`/`content-low`) — igual que "84 % completado" en el
 * panel de Cartera del Dashboard. Por eso no es un único `<Text>` con las
 * dos palabras dentro.
 */
export function ValorConUnidad({
  valor,
  unidad,
}: {
  valor: string;
  unidad: string;
}) {
  return (
    <p className="flex items-baseline gap-01">
      <Text variant="heading-m" as="span">
        {valor}
      </Text>
      <Text variant="label-s" color="low" as="span">
        {unidad}
      </Text>
    </p>
  );
}

/**
 * Tendencia — la línea "- 6% vs julio 2025" bajo un coste o un consumo. El
 * signo decide el color: bajar de coste (o de consumo) es la buena noticia
 * (`success-high`) y subir es la que conviene mirar (`warning-high`) — no
 * "positivo o negativo" en abstracto, que aquí significaría lo contrario de
 * lo que se lee a simple vista.
 */
export function Tendencia({ variacion }: { variacion: number }) {
  const sube = variacion > 0;
  return (
    <Text
      variant="label-s"
      as="p"
      className={sube ? "text-warning-high" : "text-success-high"}
    >
      {sube ? "+" : "-"} {Math.abs(variacion)}% vs {MES_COMPARACION_DASHBOARD}
    </Text>
  );
}

/**
 * SelectorCompacto — el desplegable sencillo de una barra de filtros
 * ("Sociedades", "Luz y Gas"...). No es el `Select` del sistema
 * (`ui/Input.tsx`): ese es un campo de formulario de 40 px con etiqueta, y
 * este es un filtro de barra de herramientas de 32 px, como el de la Figma
 * (nodos 797:6195/6197 en el Dashboard y 797:44769 en "Documentos"): mismo
 * radio y tipografía que el resto de campos, pero más bajo y sin etiqueta
 * encima. El propio botón enseña la opción elegida, así que no hace falta un
 * rótulo aparte.
 */
export function SelectorCompacto({
  etiqueta,
  valor,
  onChange,
  opciones,
  ancho = "w-[180px]",
}: {
  /** Nombre accesible del campo, para quien use lector de pantalla. */
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  opciones: readonly { value: string; label: string }[];
  /** Clase de ancho de Tailwind. Cada pantalla trae sus propias medidas. */
  ancho?: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={etiqueta}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={`h-07 ${ancho} cursor-pointer appearance-none rounded-md border border-border-low bg-background-base px-03 text-body-s text-content-mid outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high`}
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-03 -translate-y-1/2 text-content-mid">
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
}
