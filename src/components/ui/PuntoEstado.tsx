import { Text } from "./Text";

/**
 * PuntoEstado — un puntito de color, su rótulo y (si toca) una cifra.
 *
 * Se usa en dos sitios de "Mi cartera": en la tarjeta "Estado" de la cabecera
 * ("Activas 86") y al final de cada fila de sociedad ("En trámite 3"). Es la
 * misma pieza con dos comportamientos:
 *
 *   estirado  el rótulo a la izquierda y la cifra pegada a la derecha
 *             (la tarjeta "Estado", que es una columna de tres)
 *   compacto  todo junto, sin separación (las filas de la lista)
 *
 * El color del punto llega como clase de fondo desde fuera (`bg-success-high`,
 * `bg-info-high`…) para que nunca haya un color escrito a pelo aquí dentro.
 */
export function PuntoEstado({
  color,
  rotulo,
  cantidad,
  estirado = true,
}: {
  /** Clase de color de fondo del punto. Siempre un token: `bg-info-high`… */
  color: string;
  rotulo: string;
  cantidad?: number;
  /** true: rótulo y cifra se separan a los extremos. false: van juntos. */
  estirado?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-02 ${estirado ? "w-full justify-between" : ""}`}
    >
      <span className="flex items-center gap-02">
        <span className={`size-02 shrink-0 rounded-full ${color}`} />
        <Text variant="body-s" color="low" as="span">
          {rotulo}
        </Text>
      </span>
      {cantidad !== undefined && (
        <Text variant="label-s" as="span">
          {cantidad}
        </Text>
      )}
    </div>
  );
}
