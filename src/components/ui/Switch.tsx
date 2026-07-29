"use client";

/**
 * Switch — interruptor (DS Switch).
 *
 * Medidas del Figma: 40 × 24, radio completo, bolita blanca de 16.
 * Apagado: carril negro (background-inverse). Encendido: carril oliva
 * (highlight-muted). La bolita se desliza de un lado al otro.
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
        "relative inline-flex h-06 w-08 shrink-0 items-center rounded-full px-01",
        "transition-colors motion-micro-states",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        disabled
          ? "cursor-not-allowed bg-background-state-disabled"
          : checked
            ? "cursor-pointer bg-highlight-muted"
            : "cursor-pointer bg-background-inverse",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "size-04 rounded-full transition-transform motion-micro-states",
          // La bolita tiene que contrastar con SU carril, y el carril cambia:
          //   apagado   carril background-inverse (negro en claro, blanco en
          //             oscuro) → bolita content-inverse, que gira con él.
          //   encendido carril highlight-muted (oliva, igual en los dos modos)
          //             → bolita always-light, que tampoco cambia.
          // Si la bolita fuera siempre blanca, en modo oscuro desaparecería.
          disabled
            ? "bg-content-state-disabled"
            : checked
              ? "bg-content-always-light"
              : "bg-content-inverse",
          // 16 px de recorrido: 40 (ancho) − 4 − 4 (padding) − 16 (bolita).
          checked ? "translate-x-04" : "translate-x-00",
        ].join(" ")}
      />
    </button>
  );
}
