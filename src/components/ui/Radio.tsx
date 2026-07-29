"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Radio — opción única (DS Radio Button).
 *
 * Misma familia que la casilla, pero redondo y en grupo: solo una opción puede
 * estar elegida. Al elegirla, el punto central crece desde el centro.
 */
export function Radio({
  checked,
  onChange,
  name,
  disabled = false,
  className = "",
  children,
}: {
  checked: boolean;
  onChange: () => void;
  /** Todas las opciones del mismo grupo comparten `name`. */
  name: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId();

  return (
    <div className={`flex items-start gap-03 ${className}`}>
      <span className="relative flex size-05 shrink-0 items-center">
        <input
          id={id}
          type="radio"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer absolute size-04 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className={[
            "flex size-04 items-center justify-center rounded-full border",
            "transition-colors motion-micro-states",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-info-high",
            disabled
              ? "border-border-state-disabled bg-background-state-disabled"
              : "border-border-high bg-background-base",
          ].join(" ")}
        >
          {/* El punto crece de 0 a su tamaño: da la sensación de "se ha elegido
              esto" mejor que aparecer de golpe. */}
          <span
            className={[
              "size-02 rounded-full transition-transform motion-micro-appear",
              disabled ? "bg-content-state-disabled" : "bg-content-high",
              checked ? "scale-100" : "scale-0",
            ].join(" ")}
          />
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
