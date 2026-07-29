/**
 * Utilidades pequeñas del prototipo.
 *
 * Nada de lógica de negocio: solo cosas de presentación que se repiten en varias
 * pantallas.
 */

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
