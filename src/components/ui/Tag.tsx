import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * Tag — etiqueta pequeña (DS Tag).
 *
 * Se usa por todas partes del prototipo: "Recomendado", las tarifas ("2.0TD"),
 * el tipo de suministro ("Luz"), el ahorro en verde ("€1.650/año") y el contador
 * "1/3 Completados".
 *
 * Variantes de color:
 *   outline   fondo blanco, sin borde, texto gris — la de por defecto
 *   success   fondo verde suave, texto verde — para el ahorro
 *   inverse   contorno claro sobre superficie oscura (tarjeta "Ahorro Aczo")
 *   danger    fondo rojo suave, texto rojo — avisos que no bloquean (errores)
 *   warning   fondo naranja suave, texto naranja — avisos a revisar más tarde
 */

type TagTone =
  | "outline"
  | "success"
  | "inverse"
  | "solid"
  | "always-light"
  | "danger"
  | "warning";

const tonos: Record<TagTone, string> = {
  outline: "bg-background-base text-content-mid",
  success: "bg-success-low text-success-high",
  danger: "bg-danger-low text-danger-high",
  warning: "bg-warning-low text-warning-high",
  // Sobre superficies oscuras que NO cambian entre modos (highlight-deep): el
  // borde va en un token que tampoco cambia, o en modo oscuro se volvería negro
  // sobre negro.
  inverse:
    "border border-highlight-neutral bg-transparent text-content-always-light",
  solid: "bg-background-inverse text-content-inverse",
  // Para superficies claras que no cambian entre modos (highlight-neutral).
  "always-light": "bg-content-always-light text-content-always-dark",
};

export function Tag({
  tone = "outline",
  icon,
  className = "",
  children,
}: {
  tone?: TagTone;
  icon?: IconName;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-06 shrink-0 items-center gap-01 rounded-sm px-02 text-label-s ${tonos[tone]} ${className}`}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
