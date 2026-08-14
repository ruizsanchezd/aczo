"use client";

import { Logo } from "@/components/brand/Logo";
import { PASOS_EMPRESA } from "@/mocks/aczo";
import { useDesplazado } from "@/lib/prototipo";

/**
 * NavbarEmpresas — cabecera del flujo de empresas (/empresas).
 *
 * Es distinta de la <Navbar> del recorrido particular: aquí no hay botones de
 * "Ver demo" / "Iniciar sesión" (ya se ha entrado al flujo), y el indicador de
 * paso es una píldora que se ajusta al texto, no un número de ancho fijo.
 *
 * El paso activo no es pulsable todavía (no hay pasos anteriores a los que
 * volver desde la subida); se deja preparado para cuando existan más pantallas.
 *
 * `etiquetaPasoActual` sustituye el nombre del paso 04: en el Figma no dice
 * siempre "Seguimiento" — cambia a "Alta completada" o "Alta en tramitación"
 * según cómo haya terminado el cambio de compañía.
 *
 * SE QUEDA PEGADA ARRIBA Y SE ENCOGE AL BAJAR: la cabecera acompaña siempre
 * (`sticky`), pero en cuanto la página deja de estar arriba del todo pasa de
 * 20 px de aire arriba y abajo a 16 px. Se gana pantalla para el contenido sin
 * perder de vista en qué paso se está, y el cambio de altura se anima
 * (`motion-micro-states`) para que no dé un salto seco. Al volver arriba
 * recupera su altura completa.
 *
 * Al bajar ABRAZA SU CONTENIDO: no se le fija ninguna altura, así que mide lo
 * que ocupa por dentro (32 px) más los 16 px de arriba y abajo del token
 * `py-04` — unos 64 px. Arriba del todo sí lleva una altura MÍNIMA de 80 px,
 * que es la medida de la cabecera en el Figma; va a pelo porque es eso, una
 * medida del diseño. Se usa `min-height` y no `height` por dos motivos: deja
 * que la cabecera crezca sola si algún día el contenido no cupiera, y permite
 * animar el encogimiento (de una altura a "auto" el navegador no sabe
 * interpolar, pero de 80 px a 0 sí).
 */
export function NavbarEmpresas({
  pasoActual,
  etiquetaPasoActual,
}: {
  pasoActual: number;
  etiquetaPasoActual?: string;
}) {
  const desplazado = useDesplazado();

  return (
    <header
      className={[
        "sticky top-00 z-20 flex w-full items-center justify-between bg-background-base px-10",
        "transition-[min-height,padding] motion-micro-states",
        desplazado ? "min-h-00 py-04" : "min-h-[80px] py-05",
      ].join(" ")}
    >
      <div className="flex shrink-0 items-center gap-03 text-content-high">
        <Logo />
        <span className="font-heading text-heading-xs">Aczo</span>
      </div>

      <nav aria-label="Progreso del flujo de empresas" className="flex items-start gap-07">
        {PASOS_EMPRESA.map((paso, i) => {
          const activo = i === pasoActual;

          return (
            <div key={paso.numero} className="flex items-center gap-02">
              <span
                className={[
                  "flex items-center justify-center rounded-sm px-01 py-[2px] text-label-m tabular-nums",
                  "transition-colors motion-micro-states",
                  activo
                    ? "bg-highlight-deep text-content-always-light"
                    : "bg-highlight-soft text-content-mid",
                ].join(" ")}
              >
                {paso.numero}
              </span>
              <span
                aria-current={activo ? "step" : undefined}
                className={[
                  "text-body-m",
                  activo ? "text-content-high" : "text-content-mid",
                ].join(" ")}
              >
                {activo && etiquetaPasoActual ? etiquetaPasoActual : paso.nombre}
              </span>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
