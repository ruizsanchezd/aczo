"use client";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { PASOS } from "@/mocks/aczo";

/**
 * Navbar — la barra superior del recorrido.
 *
 * Tiene tres piezas: el logo, el indicador de pasos y los dos botones. En la
 * última pantalla el indicador desaparece (el recorrido ya ha terminado), y se
 * consigue pasando `pasoActual = null`.
 *
 * INTERACCIÓN DEL INDICADOR:
 *   - Los pasos ya hechos son pulsables y llevan hacia atrás.
 *   - El paso actual y los que faltan no son pulsables: hacia delante solo se
 *     avanza con los botones de cada pantalla, porque hay datos que rellenar.
 *   - Al cambiar de paso, el número y la etiqueta cambian de color en 200 ms
 *     (motion-micro-states). No es un cambio brusco: acompaña a la transición
 *     de pantalla.
 *
 * La altura de 80 px del Figma sale de 20 + 40 + 20: padding vertical de la
 * escala (py-05) más la altura de un botón medium.
 */
export function Navbar({
  pasoActual,
  onIrAPaso,
}: {
  /** Índice del paso activo (0-3), o null para no mostrar el indicador. */
  pasoActual: number | null;
  /** Se llama al pulsar un paso ya completado. */
  onIrAPaso?: (paso: number) => void;
}) {
  return (
    <header className="sticky top-00 z-20 bg-background-base">
      <div className="flex items-center gap-06 px-08 py-05">
        <div className="flex shrink-0 items-center gap-03 text-content-high">
          <Logo />
          {/* El logotipo va en la fuente de marca, como en el Figma. */}
          <span className="font-heading text-heading-s">Aczo</span>
        </div>

        {pasoActual !== null && (
          <nav
            aria-label="Progreso del recorrido"
            className="hidden flex-1 items-center justify-center gap-07 lg:flex"
          >
            {PASOS.map((paso, i) => {
              const activo = i === pasoActual;
              const completado = i < pasoActual;

              const contenido = (
                <>
                  <span
                    className={[
                      "flex h-06 items-center rounded-sm px-01 text-label-m tabular-nums",
                      "transition-colors motion-micro-states",
                      activo
                        ? "bg-highlight-deep text-content-always-light"
                        : completado
                          ? "bg-background-mid text-content-mid"
                          : "bg-background-low text-content-low",
                    ].join(" ")}
                  >
                    {paso.numero}
                  </span>
                  <span
                    className={[
                      "text-label-m transition-colors motion-micro-states",
                      activo || completado
                        ? "text-content-high"
                        : "text-content-low",
                    ].join(" ")}
                  >
                    {paso.nombre}
                  </span>
                </>
              );

              // Solo los pasos ya hechos se pueden pulsar (van hacia atrás).
              return completado && onIrAPaso ? (
                <button
                  key={paso.numero}
                  type="button"
                  onClick={() => onIrAPaso(i)}
                  className="flex cursor-pointer items-center gap-02 rounded-sm outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
                >
                  {contenido}
                </button>
              ) : (
                <span
                  key={paso.numero}
                  aria-current={activo ? "step" : undefined}
                  className="flex items-center gap-02"
                >
                  {contenido}
                </span>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-02">
          <Button variant="secondary">Ver demo</Button>
          <Button>Iniciar sesión</Button>
        </div>
      </div>

      {/* En pantallas estrechas el indicador completo no cabe: se resume en
          "Paso 02 de 04" con el nombre del paso debajo del logo. */}
      {pasoActual !== null && (
        <div className="flex items-center gap-02 px-08 pb-04 lg:hidden">
          <span className="flex h-06 items-center rounded-sm bg-highlight-deep px-01 text-label-m text-content-always-light tabular-nums">
            {PASOS[pasoActual].numero}
          </span>
          <span className="text-label-m text-content-high">
            {PASOS[pasoActual].nombre}
          </span>
          <span className="text-body-s text-content-low">
            · paso {pasoActual + 1} de {PASOS.length}
          </span>
        </div>
      )}
    </header>
  );
}
