/**
 * Tokens de motion — Aczo
 *
 * Los mismos valores que hay en la página "Motion" del Figma y en globals.css,
 * pero en JavaScript. Úsalos cuando animes desde código (Web Animations API,
 * timelines, gestos) en vez de con clases de Tailwind.
 *
 * Si animas con clases, usa mejor las utilidades: motion-micro-states,
 * motion-micro-appear, motion-micro-leave, motion-macro-levelup,
 * motion-macro-leveldown, motion-macro-structure.
 *
 * Figma es la fuente de la verdad: no cambies estos valores sin cambiarlos allí.
 */

/** Duraciones globales, en milisegundos. */
export const timing = {
  1: 200,
  2: 250,
  3: 350,
  4: 400,
  5: 500,
  6: 800,
} as const;

/** Curvas globales, como cubic-bezier de CSS. */
export const easing = {
  1: "linear",
  2: "cubic-bezier(0.42, 0, 1, 1)", // ease in
  3: "cubic-bezier(0, 0, 0.58, 1)", // ease out
  4: "cubic-bezier(0.42, 0, 0.58, 1)", // ease in out
} as const;

/** Los mismos puntos de control, para librerías que piden el array (GSAP, etc.). */
export const easingPoints = {
  1: null, // linear
  2: [0.42, 0, 1, 1],
  3: [0, 0, 0.58, 1],
  4: [0.42, 0, 0.58, 1],
} as const;

/**
 * Tokens semánticos: qué duración y qué curva toca según lo que esté pasando.
 * Es lo que deberías usar el 95% de las veces, en lugar de elegir a mano.
 *
 * Ojo: en Figma "appear" usa ease in y "leave" usa ease out. Es al revés de la
 * convención habitual, pero se respeta el Figma a propósito.
 */
export const motion = {
  /** Estados de un elemento: hover, pressed, focus, selected. */
  microStates: { duration: timing[1], easing: easing[1] },
  /** Algo desaparece: tooltip que se cierra, toast que se va. */
  microLeave: { duration: timing[2], easing: easing[3] },
  /** Algo aparece: tooltip, toast, elemento que entra. */
  microAppear: { duration: timing[3], easing: easing[2] },
  /** Subir de nivel: abrir un detalle, entrar en una pantalla hija. */
  macroLevelUp: { duration: timing[3], easing: easing[3] },
  /** Bajar de nivel: volver atrás, cerrar un detalle. */
  macroLevelDown: { duration: timing[4], easing: easing[2] },
  /** La estructura se recoloca: layout que se reorganiza, panel que empuja. */
  macroStructure: { duration: timing[5], easing: easing[4] },
} as const;

export type MotionToken = keyof typeof motion;

/**
 * Devuelve el token listo para `element.animate(...)`.
 *
 *   el.animate(
 *     [{ opacity: 0 }, { opacity: 1 }],
 *     { ...keyframeOptions("microAppear"), fill: "forwards" }
 *   );
 */
export function keyframeOptions(token: MotionToken): KeyframeAnimationOptions {
  return { duration: motion[token].duration, easing: motion[token].easing };
}

/**
 * Devuelve el token como valor de `transition` de CSS, para estilos inline.
 *
 *   <div style={{ transition: transitionValue("microStates", "opacity") }} />
 */
export function transitionValue(
  token: MotionToken,
  property = "all",
): string {
  return `${property} ${motion[token].duration}ms ${motion[token].easing}`;
}

/** true si la persona ha pedido menos movimiento en los ajustes de su sistema. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
