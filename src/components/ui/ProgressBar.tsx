/**
 * ProgressBar — barra de progreso (DS Progress Bar).
 *
 * Como en el Figma: etiqueta a la izquierda, porcentaje a la derecha y el carril
 * debajo. El relleno es oliva (highlight-muted) sobre carril gris.
 *
 * INTERACCIÓN: el relleno crece con `motion-macro-structure` (500 ms, ease in
 * out). Es a propósito la duración más larga de las que animan tamaño: una barra
 * de carga tiene que sentirse continua, no a tirones. Quien la usa solo cambia
 * `value` y la animación sale sola.
 */
export function ProgressBar({
  value,
  label,
  showValue = true,
  className = "",
}: {
  /** De 0 a 100. */
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}) {
  const porcentaje = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={`flex flex-col gap-02 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-02">
          {label && (
            <span className="text-label-s text-content-mid">{label}</span>
          )}
          {showValue && (
            <span className="text-label-s text-content-mid tabular-nums">
              {porcentaje}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-01 w-full overflow-hidden rounded-full bg-background-mid"
      >
        <div
          className="h-full rounded-full bg-highlight-muted transition-[width] motion-macro-structure"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

/**
 * SegmentedProgress — la barra por tramos de la última pantalla.
 *
 * Cuatro tramos con su nombre debajo (Solicitado · En tramitación · Aceptado ·
 * Activado). Los tramos ya pasados se pintan enteros en oliva; el actual se
 * queda a medias y su nombre va en verde; los que faltan, en gris.
 */
export function SegmentedProgress({
  steps,
  current,
  className = "",
}: {
  steps: readonly string[];
  /** Índice del tramo en curso (empieza en 0). */
  current: number;
  className?: string;
}) {
  return (
    <div className={`flex gap-02 ${className}`}>
      {steps.map((step, i) => {
        const completado = i < current;
        const enCurso = i === current;

        return (
          <div key={step} className="flex flex-1 flex-col gap-02">
            <div className="h-01 overflow-hidden rounded-full bg-background-mid">
              <div
                className="h-full rounded-full bg-highlight-muted transition-[width] motion-macro-structure"
                style={{
                  width: completado ? "100%" : enCurso ? "35%" : "0%",
                }}
              />
            </div>
            <span
              className={`text-body-s ${
                enCurso
                  ? "text-success-high"
                  : completado
                    ? "text-content-high"
                    : "text-content-low"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
