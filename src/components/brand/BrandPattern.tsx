import { retardo } from "@/lib/prototipo";

/**
 * BrandPattern — el fondo de cruces de la marca.
 *
 * Aparece en tres sitios, con los colores invertidos entre los dos primeros:
 *   - Pantalla "Analizando documentación": fondo oscuro, cruces claras.
 *   - Pantalla "Alta en tramitación" (recorrido particular): fondo claro,
 *     cruces oscuras, y las cruces mucho más grandes.
 *   - Pantalla "Alta completada"/"Alta en tramitación" del flujo de
 *     empresas: mismo fondo y densidad que la de "Analizando", pero con
 *     `animado` para que el patrón se vea nacer poco a poco en vez de
 *     aparecer ya puesto — es la pantalla que CIERRA el recorrido, así que
 *     tiene sentido que el fondo se "construya" en vez de solo aparecer.
 *
 * Las posiciones NO son aleatorias: están transcritas de las dos composiciones
 * del Figma, celda a celda. Cada fila del mapa es una fila de la rejilla; una
 * "x" es una cruz y un "." es un hueco. Si hay que retocar el patrón, se edita
 * el mapa aquí y se ve al momento — no hace falta tocar nada más.
 *
 * En el Figma estos dos colores están puestos a pelo (no tienen variable
 * vinculada), pero son exactamente `highlight-deep` y `highlight-neutral`, así
 * que se usan esos tokens.
 */

/** Pantalla de carga: rejilla de 59 px, 26 columnas × 18 filas. */
const MAPA_DENSO = [
  "xxx.x.....................",
  "..xx.x....................",
  ".xx.x.xxxx.xxxx........xxx",
  "...x.....xx.x........xx.x.",
  "x.x.x...xxxxxx......xx.xxx",
  ".xxxx....xxx.x.......xxx.x",
  "......xx.x.xx......x.x.x..",
  ".....x..xxxx........xxxx..",
  ".........x.x.x......xx.x.x",
  "........x...x.......x...x.",
  ".........x.xxxxxx.xxx.....",
  ".........xx.x...xx.x......",
  ".........xxxxx.x.xx.......",
  ".........xxx.x..xxx.......",
  ".......x.x.xx.x.x.x.......",
  "........xxxx...xxxx.......",
  ".........x.x.x..x.x.x.....",
  "........x...x..x...x......",
];

/** Pantalla final: rejilla de 133 px, 6 columnas × 5 filas. */
const MAPA_GRANDE = ["x..x..", "xxx...", ".xx..x", "x.xxx.", "...xxx"];

/** El path de la cruz, tal cual sale del Figma (dibujado en una rejilla de 20). */
const CRUZ =
  "M10.8511 5.31915C10.8511 7.43428 12.5657 9.14894 14.6809 9.14894H20V10.8511H14.6809C12.5657 10.8511 10.8511 12.5657 10.8511 14.6809V20H9.14894V14.6809C9.14894 12.5657 7.43428 10.8511 5.31915 10.8511H0V9.14894H5.31915C7.43428 9.14894 9.14894 7.43428 9.14894 5.31915V0H10.8511V5.31915Z";

type BrandPatternProps = {
  /** "densa" = pantalla de carga · "grande" = pantalla final */
  variant?: "densa" | "grande";
  /** Solo tiene efecto en "densa" (en "grande" las cruces siempre son
   * `highlight-deep`, no cambian de estado): "vivid" para cuando el fondo
   * anuncia que queda una acción pendiente — mismo lenguaje que el resto
   * del sistema (el "Recomendado" de las tarjetas de plan también es
   * vivid). */
  tono?: "neutral" | "vivid";
  /** Las cruces entran en cascada (solo opacidad, sin moverse) en vez de
   * aparecer ya puestas — "poco a poco". No se usa en la pantalla de
   * carga, que necesita el fondo listo desde el primer fotograma. */
  animado?: boolean;
  className?: string;
};

export function BrandPattern({
  variant = "densa",
  tono = "neutral",
  animado = false,
  className = "",
}: BrandPatternProps) {
  const denso = variant === "densa";
  const mapa = denso ? MAPA_DENSO : MAPA_GRANDE;
  const celda = denso ? 59 : 133;

  const columnas = mapa[0].length;
  const filas = mapa.length;

  // Fondo y cruces intercambian papeles entre las dos variantes.
  const fondo = denso ? "bg-highlight-deep" : "bg-highlight-neutral";
  const cruces = denso
    ? tono === "vivid"
      ? "text-highlight-vivid"
      : "text-highlight-neutral"
    : "text-highlight-deep";

  let indice = -1;

  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden ${fondo} ${className}`}
    >
      <svg
        width={columnas * celda}
        height={filas * celda}
        viewBox={`0 0 ${columnas * celda} ${filas * celda}`}
        className={`${cruces} max-w-none`}
      >
        {mapa.flatMap((fila, y) =>
          [...fila].map((c, x) => {
            if (c !== "x") return null;
            indice++;
            return (
              <g
                key={`${x}-${y}`}
                transform={`translate(${x * celda} ${y * celda}) scale(${celda / 20})`}
                className={animado ? "anim-aparece-simple" : undefined}
                style={animado ? retardo(indice, 15) : undefined}
              >
                <path d={CRUZ} fill="currentColor" />
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
