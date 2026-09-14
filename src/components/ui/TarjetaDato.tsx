import type { ReactNode } from "react";
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
 * La altura NO está fijada: las tarjetas se estiran a la más alta de la fila
 * (por eso la fila las coloca con `items-stretch`). Así la de "Estado", que
 * lleva tres líneas, marca la altura de todas sin escribir ningún valor.
 */
export function TarjetaDato({
  rotulo,
  valor,
  children,
  className = "",
}: {
  rotulo: string;
  /** El número grande. Si se pasa `children`, sobra. */
  valor?: ReactNode;
  /** Contenido a medida en lugar del número. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-1 flex-col justify-between gap-04 rounded-md bg-background-base p-04 ${className}`}
    >
      <Text variant="label-s-uppercase" color="low" as="p">
        {rotulo}
      </Text>
      {children ?? (
        <Text variant="heading-m" as="p">
          {valor}
        </Text>
      )}
    </div>
  );
}
