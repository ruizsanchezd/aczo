"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { Radio } from "./Radio";
import { Text } from "./Text";

/**
 * FiltroRadio — un filtro de la barra de filtros, pero de UNA sola
 * respuesta (a diferencia de `FiltroCasillas`, donde se puede marcar más de
 * una cosa y no marcar ninguna quiere decir "todas"). Aquí siempre hay una
 * opción elegida: no existe el estado "nada seleccionado", así que tampoco
 * puede pasar que el filtro se quede sin nada que enseñar por culpa de
 * cómo se hayan combinado los demás filtros.
 *
 * Lo usa "Tipo de suministro" en Consumo y ahorro (Luz / Gas / Luz y gas):
 * antes era un `FiltroCasillas` de varias respuestas, y con los otros
 * filtros puestos podía quedarse sin ninguna opción disponible — algo que
 * no tiene sentido para un dato que SIEMPRE existe (todo suministro es luz o
 * gas). Mismo patrón visual que `FiltroCasillas` (botón + desplegable), solo
 * que con `Radio` en vez de `Checkbox` y sin sus estados de "algunas
 * marcadas" o "sin opciones".
 */

export type OpcionRadio = { value: string; label: string };

export function FiltroRadio({
  nombre,
  opciones,
  valor,
  onChange,
  abierto,
  onAbrir,
}: {
  nombre: string;
  opciones: OpcionRadio[];
  valor: string;
  onChange: (valor: string) => void;
  abierto: boolean;
  /** Avisa de que hay que abrir este filtro (true) o cerrarlo (false). */
  onAbrir: (abrir: boolean) => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  // Cerrar al pulsar fuera o con Escape — mismo comportamiento que FiltroCasillas.
  useEffect(() => {
    if (!abierto) return;

    function fuera(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) onAbrir(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") onAbrir(false);
    }

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto, onAbrir]);

  const etiquetaElegida = opciones.find((o) => o.value === valor)?.label ?? valor;

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => onAbrir(!abierto)}
        className="flex h-07 cursor-pointer items-center gap-02 rounded-md border border-border-high bg-background-base px-03 text-content-high transition-colors motion-micro-states"
      >
        <Text variant="body-s" as="span" color="high">
          {nombre}: {etiquetaElegida}
        </Text>
        <Icon
          name="chevron-down"
          size={16}
          className={`transition-transform motion-micro-states ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div
          style={{ width: 220 }}
          className="anim-aparece absolute top-[calc(100%+var(--spacing-02))] right-0 z-20 overflow-hidden rounded-lg border border-border-low bg-background-base py-02 shadow-md"
        >
          {opciones.map((opcion) => (
            <div key={opcion.value} className="px-04 py-02">
              <Radio
                name={`filtro-radio-${nombre}`}
                checked={valor === opcion.value}
                onChange={() => {
                  onChange(opcion.value);
                  onAbrir(false);
                }}
              >
                {opcion.label}
              </Radio>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
