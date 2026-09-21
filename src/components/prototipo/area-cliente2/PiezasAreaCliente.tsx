"use client";

import { Text } from "@/components/ui/Text";
import { MES_COMPARACION_DASHBOARD } from "@/mocks/aczo";

/**
 * PiezasAreaCliente — piezas pequeñas que comparte más de una pantalla del
 * área de cliente (Dashboard y "Consumo y ahorro", que es su versión
 * ampliada). Viven aparte para no duplicarlas entre las dos.
 */

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
