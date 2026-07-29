"use client";

import { useEffect, useRef, useState } from "react";
import { euros, motionSafe } from "@/lib/prototipo";
import { motion } from "@/lib/motion";

/**
 * NumeroAnimado — una cifra que cuenta desde el valor anterior hasta el nuevo.
 *
 * Se usa al cambiar entre ahorro anual y mensual: si la cifra cambiara de golpe
 * costaría entender que es el mismo dato en otra unidad. Contando, se ve que
 * "baja" y el cambio se explica solo.
 *
 * Duración y curva salen del token macroLevelDown (400 ms, ease in): el mismo
 * que usa el sistema para "bajar de nivel", que es justo la sensación de pasar
 * de una cifra grande a una pequeña.
 *
 * Si la persona ha pedido menos movimiento en su sistema, la cifra cambia de
 * golpe: no se anima nada.
 */
export function NumeroAnimado({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const [mostrado, setMostrado] = useState(value);
  const anterior = useRef(value);

  useEffect(() => {
    const desde = anterior.current;
    const hasta = value;
    anterior.current = value;

    if (desde === hasta) return;

    const inicio = performance.now();
    // Si la persona ha pedido menos movimiento, la cuenta dura 1 ms: el primer
    // fotograma ya llega al valor final, así que en la práctica cambia de golpe.
    const duration = motionSafe() ? motion.macroLevelDown.duration : 1;
    let frame = 0;

    function paso(ahora: number) {
      const t = Math.min(1, (ahora - inicio) / duration);
      // Misma curva que ease-2 del sistema (ease in), en forma de función.
      const suavizado = t * t;
      setMostrado(desde + (hasta - desde) * suavizado);

      if (t < 1) frame = requestAnimationFrame(paso);
    }

    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`}>{euros(mostrado)}</span>
  );
}
