"use client";

import { useState } from "react";
import { NavbarEmpresas } from "./NavbarEmpresas";
import { PantallaAhorroEmpresas } from "./PantallaAhorroEmpresas";
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
 *
 * Pendiente (siguiente tramo del Figma): al pulsar "Hacer el cambio" en
 * `ahorro`, ir a la vista de firma/apoderamiento por sociedad (paso 03).
 */

const VISTAS = ["subida", "carga", "resultado", "ahorro"] as const;
type Vista = (typeof VISTAS)[number];

const PASO_DE_VISTA: Record<Vista, number | null> = {
  subida: 0,
  carga: null,
  resultado: 0,
  ahorro: 1,
};

export function RecorridoEmpresas() {
  const [vista, setVista] = useState<Vista>("subida");

  const paso = PASO_DE_VISTA[vista];

  return (
    <div className="flex min-h-screen flex-col">
      {paso !== null && <NavbarEmpresas pasoActual={paso} />}

      <main key={vista} className="anim-entra-adelante flex flex-1 flex-col">
        {vista === "subida" && (
          <PantallaSubidaEmpresas onContinuar={() => setVista("carga")} />
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
            onContinuar={() => {}}
          />
        )}
      </main>
    </div>
  );
}
