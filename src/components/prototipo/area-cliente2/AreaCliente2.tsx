"use client";

import { useState } from "react";
import { BarraLateralCliente } from "./BarraLateralCliente";
import { ConsumoAhorro } from "./ConsumoAhorro";
import { Dashboard } from "./Dashboard";
import { DocumentosCliente } from "./DocumentosCliente";
import { PanelAvisos } from "./PanelAvisos";
import { PantallaCartera } from "./PantallaCartera";

/**
 * AreaCliente2 — el área de cliente completa, con su menú lateral y las
 * pantallas que cuelgan de él.
 *
 * Es una copia independiente de AreaCliente (que solo tenía "Mi cartera")
 * para poder construir el Dashboard sin tocarla. Vive en su propia carpeta
 * con sus propios componentes, así que las dos áreas pueden evolucionar en
 * paralelo sin pisarse.
 *
 * Las cuatro secciones del menú tienen ya su pantalla: "dashboard" (la que
 * se ve al entrar), "cartera", "consumo" y "documentos".
 */
export function AreaCliente2() {
  const [seccion, setSeccion] = useState("dashboard");
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);

  function navegar(id: string) {
    if (
      id === "dashboard" ||
      id === "cartera" ||
      id === "consumo" ||
      id === "documentos"
    )
      setSeccion(id);
  }

  return (
    <div className="min-h-screen bg-background-mid">
      {/* La barra es `fixed` (ver BarraLateralCliente): no ocupa hueco en el
          flujo, así que aquí se deja aparte con `ml-[256px]` — sus 240 px de
          ancho más los 16 px de margen con los que flota. */}
      <BarraLateralCliente
        activa={seccion}
        onNavegar={navegar}
        onAbrirAvisos={() => setAvisosAbiertos(true)}
      />

      <main className="ml-[256px] min-w-0 px-06 py-07">
        {seccion === "dashboard" ? (
          <Dashboard
            onVerCartera={() => setSeccion("cartera")}
            onVerConsumo={() => setSeccion("consumo")}
          />
        ) : seccion === "cartera" ? (
          <PantallaCartera />
        ) : seccion === "consumo" ? (
          <ConsumoAhorro />
        ) : (
          <DocumentosCliente />
        )}
      </main>

      <PanelAvisos
        abierto={avisosAbiertos}
        onCerrar={() => setAvisosAbiertos(false)}
      />
    </div>
  );
}
