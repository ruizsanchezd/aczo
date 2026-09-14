"use client";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

/**
 * OrganizaTuCartera — el bloque que sale dentro del filtro de "Inmueble"
 * cuando quedan inmuebles sin clasificar.
 *
 * Tiene dos redacciones, y la diferencia importa:
 *
 *   ninguno clasificado   "Tienes 6 inmuebles sin clasificar"     → el filtro
 *                         no puede ofrecer nada, así que el bloque ocupa el
 *                         desplegable entero
 *   algunos clasificados  "Todavía tienes 5 inmuebles sin         → el bloque
 *                         clasificar"                               va debajo
 *                         de los que ya se pueden elegir
 *
 * Ese "todavía" es lo que hace que el segundo caso se lea como "vas por la
 * mitad" y no como "esto está vacío".
 *
 * Las dos acciones:
 *   Organizar cartera     deja la lista con SOLO los inmuebles sin clasificar,
 *                         para ir poniéndoles categoría uno a uno desde la
 *                         propia fila.
 *   Filtrar por ubicación cierra este filtro y abre el de Dirección, que sí
 *                         sabe agrupar por provincia aunque no haya nombres.
 *
 * ⚠️ En el Figma "Organizar cartera" es un botón sin destino: el flujo de
 * organizar la cartera en bloque no está diseñado todavía. Aquí hace lo único
 * que se puede hacer hoy con lo que existe (dejar a la vista lo que falta por
 * clasificar). Cuando haya diseño de ese flujo, se cambia.
 */

export function OrganizaTuCartera({
  sinClasificar,
  hayClasificados,
  onOrganizar,
  onFiltrarPorUbicacion,
}: {
  sinClasificar: number;
  hayClasificados: boolean;
  onOrganizar: () => void;
  onFiltrarPorUbicacion: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-04 p-04 text-center">
      <div className="flex flex-col gap-02">
        <Text variant="label-l" as="p">
          Organiza tu cartera
        </Text>
        <Text variant="body-m" color="mid" as="p">
          {hayClasificados ? "Todavía tienes" : "Tienes"} {sinClasificar}{" "}
          {sinClasificar === 1 ? "inmueble" : "inmuebles"} sin clasificar.
          {sinClasificar === 1 ? " Identifícalo" : " Identifícalos"} para poder
          {sinClasificar === 1 ? " localizarlo" : " localizarlos"} de forma más
          ágil o {sinClasificar === 1 ? "búscalo" : "búscalos"} por ubicación
        </Text>
      </div>

      <div className="flex w-full flex-col gap-02">
        {/* El relleno gris sale del Figma. `bg-background-mid` es el token que
            le corresponde; el botón en sí es el terciario del sistema. */}
        <Button
          variant="tertiary"
          fullWidth
          onClick={onOrganizar}
          className="bg-background-mid"
        >
          Organizar cartera
        </Button>
        <Button variant="tertiary" fullWidth onClick={onFiltrarPorUbicacion}>
          Filtrar por ubicación
        </Button>
      </div>
    </div>
  );
}
