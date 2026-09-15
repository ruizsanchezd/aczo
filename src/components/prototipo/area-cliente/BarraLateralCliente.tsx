"use client";

import { Logo } from "@/components/brand/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/**
 * BarraLateralCliente — la navegación del área de cliente.
 *
 * SUPERFICIE OSCURA, no modo oscuro: la barra es oscura SIEMPRE, también con
 * la interfaz en claro. Por eso va con `bg-highlight-deep` y los textos con
 * `content-always-light` en vez de `content-high` (ver CLAUDE.md).
 *
 * INTERACCIÓN
 *   La sección donde estás se marca en amarillo de marca (highlight-vivid) y
 *   con una barrita a la izquierda que se estira desde el centro al entrar.
 *   El resto de secciones se aclaran al pasar por encima con la misma opacidad
 *   de hover que usan los botones del sistema (opacity-60), para que el gesto
 *   se sienta igual en toda la interfaz. Duración: motion-micro-states.
 */

type Seccion = { id: string; rotulo: string; icono: IconName };

const SECCIONES: Seccion[] = [
  { id: "dashboard", rotulo: "Dashboard", icono: "dashboard" },
  { id: "cartera", rotulo: "Mi cartera", icono: "wallet" },
  { id: "consumo", rotulo: "Consumo y ahorro", icono: "chart-line" },
  { id: "documentos", rotulo: "Documentos", icono: "folder" },
];

export function BarraLateralCliente({
  activa = "cartera",
  onNavegar,
  persona = "Ainhoa Martínez",
}: {
  activa?: string;
  onNavegar?: (id: string) => void;
  persona?: string;
}) {
  const inicial = persona.trim().charAt(0).toUpperCase();

  return (
    <nav
      aria-label="Secciones del área de cliente"
      className="flex w-[240px] shrink-0 flex-col gap-10 bg-highlight-deep px-04 py-06"
    >
      <span className="flex items-center gap-02 text-content-always-light">
        <Logo size={30.6} />
        <Text variant="heading-s" as="span">
          Aczo
        </Text>
      </span>

      <div className="flex flex-1 flex-col justify-between">
        <ul className="flex flex-col">
          {SECCIONES.map((seccion) => {
            const esActiva = seccion.id === activa;
            return (
              <li key={seccion.id}>
                <button
                  type="button"
                  aria-current={esActiva ? "page" : undefined}
                  onClick={() => onNavegar?.(seccion.id)}
                  className={`relative flex w-full cursor-pointer items-center gap-02 rounded-md py-03 transition-opacity motion-micro-states ${
                    esActiva
                      ? "text-highlight-vivid"
                      : "text-content-always-light hover:opacity-60"
                  }`}
                >
                  {/* La barrita de la sección activa: crece desde el centro. */}
                  {esActiva && (
                    <span
                      aria-hidden
                      className="anim-marca-activa absolute top-1/2 -left-04 h-05 w-[var(--style-border-width-l)] -translate-y-1/2 rounded-full bg-highlight-vivid"
                    />
                  )}
                  <Icon name={seccion.icono} />
                  <Text variant="body-m" as="span">
                    {seccion.rotulo}
                  </Text>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between pr-03">
          <span className="flex items-center gap-03">
            <span className="flex size-07 items-center justify-center rounded-full bg-highlight-neutral">
              <Text
                variant="label-m"
                as="span"
                className="text-highlight-muted"
              >
                {inicial}
              </Text>
            </span>
            <Text variant="label-s" as="span" color="always-light">
              {persona}
            </Text>
          </span>
          <button
            type="button"
            aria-label="Avisos"
            className="cursor-pointer text-content-always-light transition-opacity motion-micro-states hover:opacity-60"
          >
            <Icon name="bell" />
          </button>
        </div>
      </div>
    </nav>
  );
}
