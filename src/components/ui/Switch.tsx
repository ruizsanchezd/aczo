"use client";

/**
 * Switch — interruptor (DS Switch).
 *
 * Medidas del Figma (Library → Switch): carril 40 × 24 con radio completo y
 * bolita de 20. La bolita se desliza de un lado al otro.
 *
 *   Apagado     carril background-mid  · bolita content-inverse
 *   Encendido   carril background-inverse · bolita content-inverse
 *   Desactivado carril background-state-disabled · bolita content-state-disabled
 *
 * Ojo: apagado NO es un carril negro, y encendido NO es oliva. El único cambio
 * de color entre apagado y encendido es el carril: gris claro → negro. La bolita
 * es la misma en los dos estados (content-inverse), y por eso contrasta en los
 * dos modos: gira con el fondo igual que el carril.
 *
 * INTERACCIÓN: el color del carril y la posición de la bolita se animan juntos
 * en 200 ms (motion-micro-states). Es un cambio de estado, no una entrada, así
 * que va con la curva lineal del token — sin rebote.
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Texto para lectores de pantalla cuando el interruptor va suelto. */
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        // p-[2px] va a pelo a propósito: es el hueco que queda entre la bolita
        // (20) y el carril (24), y la escala de espaciado del sistema no tiene
        // un valor de 2 px. Es geometría del componente, no una decisión visual.
        "relative inline-flex h-06 w-08 shrink-0 items-center rounded-full p-[2px]",
        "transition-colors motion-micro-states",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        disabled
          ? "cursor-not-allowed bg-background-state-disabled"
          : checked
            ? "cursor-pointer bg-background-inverse"
            : "cursor-pointer bg-background-mid",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "size-05 rounded-full transition-transform motion-micro-states",
          disabled ? "bg-content-state-disabled" : "bg-content-inverse",
          // 16 px de recorrido: 40 (ancho) − 2 − 2 (padding) − 20 (bolita).
          checked ? "translate-x-04" : "translate-x-00",
        ].join(" ")}
      />
    </button>
  );
}
