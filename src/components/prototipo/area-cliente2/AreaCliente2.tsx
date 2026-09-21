"use client";

import { useState } from "react";
import { BarraLateralCliente } from "./BarraLateralCliente";
import { ConsumoAhorro } from "./ConsumoAhorro";
import { Dashboard } from "./Dashboard";
import { DocumentosCliente } from "./DocumentosCliente";
import { NuevoSuministroCliente } from "./NuevoSuministroCliente";
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
 * se ve al entrar), "cartera", "consumo" y "documentos". Hay una quinta
 * sección, "nuevo-suministro", que no está en el menú: se abre desde el
 * botón "Añadir nuevos suministros" de la cabecera de las otras cuatro (ver
 * `onAbrirNuevoSuministro`) y no es una ruta aparte ni un modal, solo otro
 * valor de este mismo estado — así el asistente sigue dentro de `<main>`,
 * con la barra lateral siempre visible.
 */
export function AreaCliente2() {
  const [seccion, setSeccion] = useState("dashboard");
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);

  function navegar(id: string) {
    if (
      id === "dashboard" ||
      id === "cartera" ||
      id === "consumo" ||
      id === "documentos" ||
      id === "nuevo-suministro"
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
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
          />
        ) : seccion === "cartera" ? (
          <PantallaCartera
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
          />
        ) : seccion === "consumo" ? (
          <ConsumoAhorro
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
          />
        ) : seccion === "documentos" ? (
          <DocumentosCliente
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
          />
        ) : (
          <NuevoSuministroCliente
            onVolver={() => setSeccion("dashboard")}
            onIrACartera={() => setSeccion("cartera")}
          />
        )}
      </main>

      <PanelAvisos
        abierto={avisosAbiertos}
        onCerrar={() => setAvisosAbiertos(false)}
      />
    </div>
  );
}
