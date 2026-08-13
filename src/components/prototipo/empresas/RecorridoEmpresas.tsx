"use client";

import { useState } from "react";
import { NavbarEmpresas } from "./NavbarEmpresas";
import { PantallaAhorroEmpresas, type ResumenCambioEmpresas } from "./PantallaAhorroEmpresas";
import { PantallaAltaEmpresas } from "./PantallaAltaEmpresas";
import { PantallaCambioCompaniaEmpresas } from "./PantallaCambioCompaniaEmpresas";
import { PantallaCargaEmpresas } from "./PantallaCargaEmpresas";
import { PantallaResultadoEmpresas } from "./PantallaResultadoEmpresas";
import { PantallaSubidaEmpresas } from "./PantallaSubidaEmpresas";

/**
 * RecorridoEmpresas — el flujo de empresas, en construcción paso a paso.
 * Mismo patrón que Recorrido.tsx (el recorrido particular): cada vista entra
 * desplazándose y apareciendo (anim-entra-adelante), y la `key` del
 * contenedor es la vista, para que la animación se dispare sola al montar.
 *
 * VISTAS Y A QUÉ PASO DEL INDICADOR CORRESPONDEN:
 *
 *   vista        indicador   qué es
 *   ---------------------------------------------------------------------
 *   subida       01          arrastrar las facturas de las sociedades
 *   carga        (ninguno)   pantalla de carga a pantalla completa
 *   resultado    01          errores y alertas del análisis (sigue en el paso 1)
 *   ahorro       02          "Tu ahorro potencial", tras "Calcular ahorro"
 *   cambio       03          "Cambio de compañía", tras "Hacer el cambio"
 *   alta         03          "Alta completada"/"Alta en tramitación", tras "Activar cambio"
 *
 * DATOS QUE VIAJAN DE UNA VISTA A OTRA (por eso se guardan aquí, no dentro de
 * cada pantalla):
 *   - `datosContratante`: nombre y email de la pantalla de subida, para
 *     pre-rellenar "Datos de quien tramita" en `cambio`.
 *   - `resumenCambio`: la foto del plan elegido en `ahorro` en el momento de
 *     pulsar "Hacer el cambio" (sociedades, puntos, ahorro, comercializadoras),
 *     para el resumen de `cambio`.
 *   - `pendienteAprobacion`: si en `cambio` se eligió "enviar solicitud de
 *     firma" (todavía falta que la persona representante confirme), para que
 *     `alta` muestre "Alta en tramitación" en vez de "Alta completada".
 */

const VISTAS = ["subida", "carga", "resultado", "ahorro", "cambio", "alta"] as const;
type Vista = (typeof VISTAS)[number];

const PASO_DE_VISTA: Record<Vista, number | null> = {
  subida: 0,
  carga: null,
  resultado: 0,
  ahorro: 1,
  cambio: 2,
  alta: 3,
};

export function RecorridoEmpresas() {
  const [vista, setVista] = useState<Vista>("subida");
  const [datosContratante, setDatosContratante] = useState({ nombre: "", email: "" });
  const [resumenCambio, setResumenCambio] = useState<ResumenCambioEmpresas | null>(null);
  const [pendienteAprobacion, setPendienteAprobacion] = useState(false);

  const paso = PASO_DE_VISTA[vista];
  const etiquetaPasoActual =
    vista === "alta"
      ? pendienteAprobacion
        ? "Alta en tramitación"
        : "Alta completada"
      : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      {paso !== null && (
        <NavbarEmpresas pasoActual={paso} etiquetaPasoActual={etiquetaPasoActual} />
      )}

      <main key={vista} className="anim-entra-adelante flex flex-1 flex-col">
        {vista === "subida" && (
          <PantallaSubidaEmpresas
            onContinuar={(datos) => {
              setDatosContratante(datos);
              setVista("carga");
            }}
          />
        )}
        {vista === "carga" && (
          <PantallaCargaEmpresas onTerminar={() => setVista("resultado")} />
        )}
        {vista === "resultado" && (
          <PantallaResultadoEmpresas onContinuar={() => setVista("ahorro")} />
        )}
        {vista === "ahorro" && (
          <PantallaAhorroEmpresas
            onAtras={() => setVista("resultado")}
            onContinuar={(resumen) => {
              setResumenCambio(resumen);
              setVista("cambio");
            }}
          />
        )}
        {vista === "cambio" && resumenCambio && (
          <PantallaCambioCompaniaEmpresas
            datosContratante={datosContratante}
            resumen={resumenCambio}
            onAtras={() => setVista("ahorro")}
            onContinuar={(datos) => {
              setPendienteAprobacion(datos.pendienteAprobacion);
              setVista("alta");
            }}
          />
        )}
        {vista === "alta" && (
          <PantallaAltaEmpresas pendienteAprobacion={pendienteAprobacion} />
        )}
      </main>
    </div>
  );
}
