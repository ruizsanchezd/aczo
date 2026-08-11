import { Logo } from "@/components/brand/Logo";
import { PASOS_EMPRESA } from "@/mocks/aczo";

/**
 * NavbarEmpresas — cabecera del flujo de empresas (/empresas).
 *
 * Es distinta de la <Navbar> del recorrido particular: aquí no hay botones de
 * "Ver demo" / "Iniciar sesión" (ya se ha entrado al flujo), y el indicador de
 * paso es una píldora que se ajusta al texto, no un número de ancho fijo.
 *
 * El paso activo no es pulsable todavía (no hay pasos anteriores a los que
 * volver desde la subida); se deja preparado para cuando existan más pantallas.
 */
export function NavbarEmpresas({ pasoActual }: { pasoActual: number }) {
  return (
    <header className="flex h-[80px] w-full items-center justify-between bg-background-base px-10 py-05">
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
                {paso.nombre}
              </span>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
