import { Logo } from "@/components/brand/Logo";
import { PASOS_PARTICULARES } from "@/mocks/aczo";

/**
 * NavbarParticulares — cabecera del flujo de particulares (/particulares).
 *
 * Copia exacta de `NavbarEmpresas.tsx` (mismos tokens, mismo layout, misma
 * píldora de paso), solo que con los rótulos de `PASOS_PARTICULARES`. Se
 * duplica en vez de generalizar una sola Navbar con los pasos por prop,
 * siguiendo el mismo criterio que el resto del flujo de empresas: cada
 * recorrido es independiente y se puede tocar sin afectar al otro.
 */
export function NavbarParticulares({
  pasoActual,
  etiquetaPasoActual,
}: {
  pasoActual: number;
  etiquetaPasoActual?: string;
}) {
  return (
    <header className="flex h-[80px] w-full items-center justify-between bg-background-base px-10 py-05">
      <div className="flex shrink-0 items-center gap-03 text-content-high">
        <Logo />
        <span className="font-heading text-heading-xs">Aczo</span>
      </div>

      <nav aria-label="Progreso del flujo de particulares" className="flex items-start gap-07">
        {PASOS_PARTICULARES.map((paso, i) => {
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
