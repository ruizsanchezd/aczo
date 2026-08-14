/**
 * Utilidades pequeñas del prototipo.
 *
 * Nada de lógica de negocio: solo cosas de presentación que se repiten en varias
 * pantallas.
 */

import { useEffect, useState } from "react";

export { euros, kwh } from "@/mocks/aczo";

/** true si SÍ se puede animar (la persona no ha pedido menos movimiento). */
export function motionSafe(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Retardo de la entrada en cascada, en milisegundos.
 * 60 ms es suficiente para que se lea como "van entrando" sin que la última
 * pieza se haga esperar.
 */
export const PASO_CASCADA = 60;

/** Devuelve el estilo de retardo para el elemento nº i de una cascada. */
export function retardo(i: number, paso = PASO_CASCADA) {
  return { animationDelay: `${i * paso}ms` };
}

/**
 * true en cuanto la página deja de estar arriba del todo.
 *
 * La usa la cabecera de los dos flujos para encogerse mientras se navega y
 * recuperar su altura completa solo al volver arriba. El umbral de 8 px evita
 * que parpadee con el rebote del scroll en macOS o con un roce del trackpad:
 * hace falta bajar de verdad para que se note.
 */
export function useDesplazado(umbral = 8): boolean {
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    function comprobar() {
      setDesplazado(window.scrollY > umbral);
    }
    comprobar();
    window.addEventListener("scroll", comprobar, { passive: true });
    return () => window.removeEventListener("scroll", comprobar);
  }, [umbral]);

  return desplazado;
}

/**
 * true en cuanto se ha bajado más de `umbral` (0 a 1) del recorrido de scroll
 * de la página. Para no mostrar algo (p. ej. la barra de CTAs al final de una
 * pantalla larga) hasta que la persona empieza a moverse — así se nota que
 * hay más contenido debajo en vez de dar la sensación de que ya se ve todo.
 *
 * Si la pantalla no tiene ni para hacer scroll, no hay nada que insinuar:
 * devuelve `true` directamente.
 */
export function useVisibleAlDesplazar(umbral = 0.08): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function comprobar() {
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      const proporcion = recorrido > 0 ? window.scrollY / recorrido : 1;
      setVisible(proporcion > umbral);
    }
    comprobar();
    window.addEventListener("scroll", comprobar, { passive: true });
    window.addEventListener("resize", comprobar);
    return () => {
      window.removeEventListener("scroll", comprobar);
      window.removeEventListener("resize", comprobar);
    };
  }, [umbral]);

  return visible;
}
