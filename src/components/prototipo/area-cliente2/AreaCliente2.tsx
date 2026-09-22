"use client";

import { useState } from "react";
import { AhorroDetectadoCliente } from "./AhorroDetectadoCliente";
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
 * se ve al entrar), "cartera", "consumo" y "documentos". Hay dos secciones
 * más que no están en el menú, solo otro valor de este mismo estado (así el
 * asistente que abren sigue dentro de `<main>`, con la barra lateral siempre
 * visible, y no es ni una ruta aparte ni un modal):
 *
 *   - "nuevo-suministro" — se abre desde el botón "Añadir nuevos
 *     suministros" de la cabecera de las otras cuatro (ver
 *     `onAbrirNuevoSuministro`).
 *   - "ahorro-detectado" — se abre desde el botón "Ver ahorro" de
 *     `BannerAhorroExtra`, el banner "Hemos detectado una oportunidad de
 *     ahorro extra" de Dashboard, Mi cartera y Consumo y ahorro (ver
 *     `onVerAhorro`).
 */
export function AreaCliente2() {
  const [seccion, setSeccion] = useState("dashboard");
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);
  // Lo mantiene PanelAvisos (sabe si queda alguna alerta/notificación sin
  // leer) y lo lee la campana de la barra lateral, para pintar su puntito
  // rojo también con el panel cerrado.
  const [avisosSinLeer, setAvisosSinLeer] = useState(false);

  function navegar(id: string) {
    if (
      id === "dashboard" ||
      id === "cartera" ||
      id === "consumo" ||
      id === "documentos" ||
      id === "nuevo-suministro" ||
      id === "ahorro-detectado"
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
        avisosSinLeer={avisosSinLeer}
      />

      <main className="ml-[256px] min-w-0 px-06 py-07">
        {seccion === "dashboard" ? (
          <Dashboard
            onVerCartera={() => setSeccion("cartera")}
            onVerConsumo={() => setSeccion("consumo")}
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
            onVerAhorro={() => setSeccion("ahorro-detectado")}
          />
        ) : seccion === "cartera" ? (
          <PantallaCartera
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
            onVerAhorro={() => setSeccion("ahorro-detectado")}
          />
        ) : seccion === "consumo" ? (
          <ConsumoAhorro
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
            onVerAhorro={() => setSeccion("ahorro-detectado")}
          />
        ) : seccion === "documentos" ? (
          <DocumentosCliente
            onAbrirNuevoSuministro={() => setSeccion("nuevo-suministro")}
          />
        ) : seccion === "nuevo-suministro" ? (
          <NuevoSuministroCliente
            onVolver={() => setSeccion("dashboard")}
            onIrACartera={() => setSeccion("cartera")}
          />
        ) : (
          <AhorroDetectadoCliente
            onVolver={() => setSeccion("dashboard")}
            onIrACartera={() => setSeccion("cartera")}
          />
        )}
      </main>

      <PanelAvisos
        abierto={avisosAbiertos}
        onCerrar={() => setAvisosAbiertos(false)}
        onCambiarSinLeer={setAvisosSinLeer}
      />
    </div>
  );
}
