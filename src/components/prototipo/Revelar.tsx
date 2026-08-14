"use client";

import type { ReactNode } from "react";
import { retardo, useRevelarAlEntrar } from "@/lib/prototipo";

/**
 * Revelar — envuelve un bloque para que ENTRE cuando asoma por la pantalla,
 * con la misma animación que usan los recorridos de empresas y particulares
 * (`anim-aparece`: sube 8 px y aparece).
 *
 * La diferencia con los recorridos está solo en CUÁNDO se dispara. Allí cada
 * pantalla se ve entera de una vez, así que la cascada arranca al montarla.
 * La landing es una página larga que se recorre bajando: si todo se animara al
 * cargar, lo de abajo se habría movido sin que nadie lo viera. Aquí, entonces,
 * cada bloque espera su turno (ver `useRevelarAlEntrar` en lib/prototipo.ts).
 *
 * Mientras no le toca, el bloque se queda en `anim-espera`: el fotograma
 * inicial de la animación. Así nunca se ve aparecer de golpe y luego animarse;
 * al cambiar a `anim-aparece` la entrada arranca justo desde donde estaba.
 *
 * `orden` sirve para encadenar varios bloques de una misma sección: es el
 * mismo escalonado de 60 ms que el resto del prototipo (`retardo`).
 *
 * Va en su propio archivo con "use client" para que `Landing.tsx` pueda
 * seguir siendo un componente de servidor: solo esta pieza necesita escuchar
 * el scroll.
 */
export function Revelar({
  children,
  orden = 0,
  className = "",
}: {
  children: ReactNode;
  /** Posición dentro de la cascada de su sección (0 = el primero). */
  orden?: number;
  className?: string;
}) {
  const { ref, revelado } = useRevelarAlEntrar<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${revelado ? "anim-aparece" : "anim-espera"} ${className}`.trim()}
      style={revelado ? retardo(orden) : undefined}
    >
      {children}
    </div>
  );
}
