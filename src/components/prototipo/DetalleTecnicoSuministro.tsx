import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Tooltip } from "@/components/ui/Tooltip";
import { euros, kwh, type Suministro } from "@/mocks/aczo";

/**
 * DetalleTecnicoSuministro — la ficha técnica que se ve al desplegar una fila
 * de punto de suministro dentro de una tabla: CUPS, tarifa contratada, consumo
 * anual, potencia (solo si la hay: el gas no la tiene), el nuevo perfil de
 * consumo y la compañía actual.
 *
 * Vive aquí, fuera de una pantalla concreta, porque lo usan tal cual las dos
 * tablas del prototipo —la de empresas y la de particulares— y el Figma las
 * dibuja idénticas. Si cambia un dato o un estilo, cambia en los dos sitios a
 * la vez.
 *
 * Cada fila es etiqueta en mayúsculas a la izquierda y valor a la derecha, sin
 * líneas entre medias: la separación la da el espaciado, como en el Figma.
 */
export function DetalleTecnicoSuministro({ suministro }: { suministro: Suministro }) {
  const { detalle } = suministro;

  return (
    <div className="flex flex-col gap-04 border-t border-border-low bg-background-base px-07 py-06">
      <FilaDatoSuministro etiqueta="CUPS">{detalle.cups}</FilaDatoSuministro>
      <FilaDatoSuministro etiqueta="Tarifa contratada">
        {suministro.tarifa} ({suministro.tipo})
      </FilaDatoSuministro>
      <FilaDatoSuministro etiqueta="Consumo anual">
        {kwh(detalle.consumoAnual)} kWh/año
      </FilaDatoSuministro>
      {detalle.potencia > 0 && (
        <FilaDatoSuministro etiqueta="Nueva potencia contratada">
          {detalle.potencia.toLocaleString("es-ES")} kW
        </FilaDatoSuministro>
      )}
      <FilaDatoSuministro etiqueta="Nuevo perfil de consumo">
        <span className="flex flex-wrap justify-end gap-02">
          {(
            [
              ["Punta", detalle.perfil.punta],
              ["Llano", detalle.perfil.llano],
              ["Valle", detalle.perfil.valle],
            ] as const
          ).map(([franja, porcentaje]) => (
            <Tag key={franja} tone="outline">
              <span className="font-medium">{franja}</span>
              <span className="text-content-mid">
                {kwh(Math.round((detalle.consumoAnual * porcentaje) / 100))} kWh (
                {porcentaje}%)
              </span>
            </Tag>
          ))}
        </span>
      </FilaDatoSuministro>
      <FilaDatoSuministro etiqueta="Compañía actual">
        <span className="flex items-center gap-01">
          {detalle.companiaActual}
          <Tooltip
            content={
              detalle.permanencia
                ? `Tienes permanencia con ${detalle.companiaActual} hasta ${detalle.permanencia.hasta}. Si cambias ahora, la penalización estimada sería de ${euros(detalle.permanencia.penalizacion.min)}-${euros(detalle.permanencia.penalizacion.max)} €.`
                : `Sin permanencia con ${detalle.companiaActual}: se puede cambiar cuando quieras, sin penalización.`
            }
          >
            <span className="text-content-mid">
              <Icon name="info" size={16} />
            </span>
          </Tooltip>
        </span>
      </FilaDatoSuministro>
    </div>
  );
}

/** Una fila del detalle: etiqueta en mayúsculas a la izquierda, valor a la
 * derecha — igual que FilaDato en TablaAhorro.tsx (no está exportado ahí). */
function FilaDatoSuministro({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-04">
      <span className="text-label-s tracking-wide text-content-mid uppercase">
        {etiqueta}
      </span>
      <span className="text-body-m text-content-high">{children}</span>
    </div>
  );
}
