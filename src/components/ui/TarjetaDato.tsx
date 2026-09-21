import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Text } from "./Text";

/**
 * TarjetaDato — la tarjeta blanca de un número grande con su rótulo encima.
 *
 * Es la fila de cinco tarjetas de la cabecera de "Mi cartera" (SOCIEDADES,
 * INMUEBLES, PTOS. DE SUMINISTRO...). El rótulo va siempre en mayúsculas y el
 * número con la tipografía de marca.
 *
 *   <TarjetaDato rotulo="Sociedades" valor={4} />
 *
 * Si el dato no es un número suelto (logos, una lista de estados...), se pasa
 * por `children` en lugar de por `valor` y la tarjeta solo pone el marco:
 *
 *   <TarjetaDato rotulo="Estado">…</TarjetaDato>
 *
 * `destacado` añade el distintivo de marca (la rejilla de Aczo, en una caja
 * oscura) delante del rótulo — en "Consumo y ahorro" (Figma nodo 797:8291)
 * es lo que distingue las cifras que Aczo calcula por su cuenta (el ahorro)
 * de las que solo se leen de la factura (coste, consumo).
 *
 * La altura NO está fijada: las tarjetas se estiran a la más alta de la fila
 * (por eso la fila las coloca con `items-stretch`). Así la de "Estado", que
 * lleva tres líneas, marca la altura de todas sin escribir ningún valor.
 */
export function TarjetaDato({
  rotulo,
  valor,
  children,
  destacado = false,
  className = "",
}: {
  rotulo: string;
  /** El número grande. Si se pasa `children`, sobra. */
  valor?: ReactNode;
  /** Contenido a medida en lugar del número. */
  children?: ReactNode;
  /** Añade el distintivo de marca delante del rótulo. */
  destacado?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-1 flex-col justify-between gap-04 rounded-md bg-background-base p-04 ${className}`}
    >
      <span className="flex items-center gap-02">
        {destacado && (
          <span
            aria-hidden
            className="flex size-06 shrink-0 items-center justify-center rounded-sm bg-highlight-deep text-highlight-soft"
          >
            <Logo size={14} />
          </span>
        )}
        <Text variant="label-s-uppercase" color="low" as="p">
          {rotulo}
        </Text>
      </span>
      {children ?? (
        <Text variant="heading-m" as="p">
          {valor}
        </Text>
      )}
    </div>
  );
}
