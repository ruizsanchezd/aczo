"use client";

import { useState } from "react";
import { BarraLateralCliente } from "./BarraLateralCliente";
import { Dashboard } from "./Dashboard";
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
 * Por ahora solo hay dos secciones con contenido: "dashboard" (la que se ve
 * al entrar) y "cartera". "Consumo y ahorro" y "Documentos" ya están en el
 * menú pero todavía no tienen pantalla — al pulsarlas, de momento no pasa
 * nada, igual que ya ocurría con "Documentos" en AreaCliente.
 */
export function AreaCliente2() {
  const [seccion, setSeccion] = useState("dashboard");

  function navegar(id: string) {
    if (id === "dashboard" || id === "cartera") setSeccion(id);
  }

  return (
    <div className="min-h-screen bg-background-mid">
      {/* La barra es `fixed` (ver BarraLateralCliente): no ocupa hueco en el
          flujo, así que aquí se deja aparte con `ml-[256px]` — sus 240 px de
          ancho más los 16 px de margen con los que flota. */}
      <BarraLateralCliente activa={seccion} onNavegar={navegar} />

      <main className="ml-[256px] min-w-0 px-06 py-07">
        {seccion === "dashboard" ? (
          <Dashboard onVerCartera={() => setSeccion("cartera")} />
        ) : (
          <PantallaCartera />
        )}
      </main>
    </div>
  );
}
