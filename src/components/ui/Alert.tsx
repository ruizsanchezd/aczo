import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * Alert — aviso con icono (DS Alert).
 *
 * En el prototipo aparece dos veces: el aviso de permanencias de la pantalla de
 * recomendación (variante `plain`, sobre fondo claro) y el aviso oculto de la
 * pantalla de firma.
 *
 * Variantes: plain (fondo base + borde) · subtle · info · warning · danger ·
 * success.
 */

type AlertTone = "plain" | "subtle" | "info" | "warning" | "danger" | "success";

const tonos: Record<AlertTone, { caja: string; icono: string }> = {
  plain: {
    caja: "border border-border-low bg-background-base text-content-mid",
    icono: "text-content-mid",
  },
  // Sin borde, sobre el gris más suave del sistema. Es la caja de información
  // del panel de alertas: acompaña, no avisa.
  subtle: {
    caja: "bg-background-low text-content-mid",
    icono: "text-content-mid",
  },
  info: { caja: "bg-info-low text-content-high", icono: "text-info-high" },
  warning: {
    caja: "bg-warning-low text-content-high",
    icono: "text-warning-high",
  },
  danger: { caja: "bg-danger-low text-content-high", icono: "text-danger-high" },
  success: {
    caja: "bg-success-low text-content-high",
    icono: "text-success-high",
  },
};

export function Alert({
  tone = "plain",
  icon = "info",
  className = "",
  children,
}: {
  tone?: AlertTone;
  icon?: IconName;
  className?: string;
  children: ReactNode;
}) {
  const { caja, icono } = tonos[tone];

  return (
    <div
      role="status"
      className={`flex items-start gap-03 rounded-lg p-04 text-body-m ${caja} ${className}`}
    >
      <span className={`mt-[2px] shrink-0 ${icono}`}>
        <Icon name={icon} />
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
