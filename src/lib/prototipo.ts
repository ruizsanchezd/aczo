/**
 * Utilidades pequeñas del prototipo.
 *
 * Nada de lógica de negocio: solo cosas de presentación que se repiten en varias
 * pantallas.
 */

import { useEffect, useRef, useState } from "react";

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
 * true en cuanto el bloque asoma por la pantalla, para que las secciones de la
 * landing entren a medida que se baja en vez de estar ya puestas.
 *
 * En los recorridos (empresas y particulares) la entrada en cascada se dispara
 * al montar cada pantalla, porque se ven de una en una. La landing es una
 * página larga: si se animara todo al cargar, lo de abajo se habría "animado"
 * sin que nadie lo viera. Por eso aquí se mira cuándo entra cada bloque.
 *
 * Se revela UNA sola vez: al volver a subir no se repite: sería mareante en una
 * página que se recorre arriba y abajo.
 *
 * `parteVisible` (0 a 1) es cuánto del bloque tiene que verse para que entre.
 * Sirve para que no se dispare con el primer píxel que asoma por abajo, que se
 * vería a medias en el borde. Se hace así, y NO recortando la pantalla con un
 * margen negativo, porque un margen deja una franja muerta abajo del todo: lo
 * que cae ahí al final de la página (la línea legal del pie, sin ir más lejos)
 * no puede salir de ella por mucho que se baje, y se quedaría invisible.
 */
export function useRevelarAlEntrar<T extends HTMLElement>(parteVisible = 0.15) {
  const ref = useRef<T>(null);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    function revelar() {
      setRevelado(true);
    }

    // Sin IntersectionObserver no nos jugamos que el contenido se quede
    // escondido: se enseña sin más.
    if (typeof IntersectionObserver === "undefined") {
      revelar();
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        const asoma = entradas.some((e) => {
          // Lo normal: ya se ve la parte que pedíamos.
          if (e.intersectionRatio >= parteVisible) return true;
          // Ya ha quedado ARRIBA del todo, por encima de la pantalla. Pasa al
          // saltar de golpe (un enlace que baja a una sección, recargar
          // habiendo bajado, un scroll muy rápido): el bloque se salta sin
          // llegar a asomar y, sin esto, quedaría invisible para siempre.
          if (e.boundingClientRect.bottom <= 0) return true;
          // Un bloque más alto que la pantalla nunca puede enseñar su 15%.
          // Con que llene media pantalla, ya está más que entrado.
          return !!e.rootBounds && e.intersectionRect.height >= e.rootBounds.height / 2;
        });
        if (asoma) {
          revelar();
          observador.disconnect();
        }
      },
      { threshold: parteVisible },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [parteVisible]);

  return { ref, revelado };
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
