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
 *   Organizar cartera     deja la pantalla con SOLO los inmuebles sin
 *                         clasificar, para ir poniéndoles categoría uno a uno
 *                         desde su propia fila. NO toca el filtro de Inmueble:
 *                         ese solo puede contener inmuebles catalogados, que
 *                         son los únicos que ofrece. Es un modo aparte, y
 *                         mientras dura lo explica un aviso encima de la lista.
 *   Filtrar por ubicación lleva a mirar la cartera por sitios, que es donde un
 *                         inmueble sin nombre sí se puede encontrar. Qué hace
 *                         exactamente depende de dónde salga el bloque: en el
 *                         filtro abre el de Dirección; al final de la lista
 *                         cambia la agrupación a "Ubicación".
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
    // El ancho máximo no es un token: es una medida de lectura. El bloque sale
    // en dos sitios de anchos muy distintos (el desplegable del filtro y el
    // final de la lista) y sin tope, en el ancho grande, el texto se estiraría
    // en una sola línea larguísima y los botones cruzarían la pantalla.
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-04 p-04 text-center">
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
        <Button variant="secondary" fullWidth onClick={onOrganizar}>
          Organizar cartera
        </Button>
        <Button variant="tertiary" fullWidth onClick={onFiltrarPorUbicacion}>
          Filtrar por ubicación
        </Button>
      </div>
    </div>
  );
}
