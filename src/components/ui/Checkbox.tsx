"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Checkbox — casilla de verificación (DS Checkbox).
 *
 * Estados del Figma: sin marcar · marcada · indeterminada, cada uno con su
 * versión desactivada. Medidas: 16 × 16, radio 4, borde 1 px, y 12 px de hueco
 * hasta el texto.
 *
 * INTERACCIÓN: la casilla se rellena al marcarla (200 ms) y el foco de teclado
 * pinta el anillo azul.
 */
export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = "",
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId();
  const activa = checked || indeterminate;

  return (
    <div className={`flex items-start gap-03 ${className}`}>
      <span className="relative flex size-05 shrink-0 items-center">
        {/* La casilla real, invisible pero funcional: así funciona el teclado,
            el clic en la etiqueta y los lectores de pantalla. */}
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate;
          }}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute size-04 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className={[
            "flex size-04 items-center justify-center rounded-sm border",
            "transition-colors motion-micro-states",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-info-high",
            disabled
              ? "border-border-state-disabled bg-background-state-disabled text-content-state-disabled"
              : activa
                ? "border-border-high bg-background-inverse text-content-inverse"
                : "border-border-high bg-background-base",
          ].join(" ")}
        >
          {indeterminate ? (
            <span className="h-[1.5px] w-02 rounded-full bg-current" />
          ) : (
            checked && <Icon name="check" size={12} />
          )}
        </span>
      </span>

      {children && (
        <label
          htmlFor={id}
          className={`text-body-m ${
            disabled
              ? "cursor-not-allowed text-content-state-disabled"
              : "cursor-pointer text-content-high"
          }`}
        >
          {children}
        </label>
      )}
    </div>
  );
}
