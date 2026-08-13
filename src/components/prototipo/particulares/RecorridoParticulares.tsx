"use client";

import { useState } from "react";
import { PantallaCargaEmpresas } from "../empresas/PantallaCargaEmpresas";
import { NavbarParticulares } from "./NavbarParticulares";
import { PantallaAhorroParticulares } from "./PantallaAhorroParticulares";
import { PantallaResultadoParticulares } from "./PantallaResultadoParticulares";
import { PantallaSubidaParticulares } from "./PantallaSubidaParticulares";

/**
 * RecorridoParticulares — el flujo de particulares (/particulares), en
 * construcción paso a paso con la MISMA estructura que RecorridoEmpresas.tsx:
 * subida → carga → resultado (errores y alertas, sigue en el paso 1) →
 * ahorro y recomendación (paso 2) → ...
 *
 * Es un recorrido nuevo, independiente del recorrido particular clásico
 * (`Recorrido.tsx`, en /recorrido): ese no se toca. Este vive en su propia
 * ruta y reutiliza deliberadamente el mismo patrón de animación (entra en
 * `anim-entra-adelante`, `key={vista}` para que se dispare sola al montar) y
 * el mismo truco de "ir()" para que cada paso entre por el principio de la
 * página, sin quedarse anclado donde estaba el scroll del paso anterior.
 *
 * ESTE FLUJO ES IGUAL QUE EL DE EMPRESAS EN LAS PARTES QUE COMPARTEN
 * ESTRUCTURA: la pantalla de carga reutiliza `PantallaCargaEmpresas.tsx` tal
 * cual (logo, barra de progreso, aviso de conexión segura — ya es genérica,
 * no habla de sociedades en ningún sitio), y la pantalla de resultado abre el
 * mismo panel de "Revisar" que empresas (`PanelAlertasParticulares.tsx`, un
 * calco de `PanelAlertasEmpresas.tsx` sin sociedad ni CIF). No es una versión
 * simplificada: es la misma mecánica, con datos a la escala de una vivienda.
 *
 * VISTAS Y A QUÉ PASO DEL INDICADOR CORRESPONDEN (de momento, hasta donde
 * está construido — se amplía en los próximos pasos):
 *
 *   vista        indicador   qué es
 *   ---------------------------------------------------------------------
 *   subida       01          sube tu factura (con nombre, email y consentimiento)
 *   carga        (ninguno)   pantalla de carga a pantalla completa
 *   resultado    01          errores y alertas del análisis (sigue en el paso 1)
 *   ahorro       02          "Recomendado para ti", tras "Calcular ahorro"
 *
 * Pendiente: "Cambio de compañía" (paso 03) y lo que venga después. El botón
 * "Hacer el cambio" de `ahorro` está listo para conectarse en cuanto exista
 * esa pantalla.
 */

const VISTAS = ["subida", "carga", "resultado", "ahorro"] as const;
type Vista = (typeof VISTAS)[number];

const PASO_DE_VISTA: Record<Vista, number | null> = {
  subida: 0,
  carga: null,
  resultado: 0,
  ahorro: 1,
};

export function RecorridoParticulares() {
  const [vista, setVista] = useState<Vista>("subida");

  // Cada cambio de paso entra por el inicio de la página — mismo patrón que
  // RecorridoEmpresas.tsx.
  function ir(destino: Vista) {
    setVista(destino);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const paso = PASO_DE_VISTA[vista];

  return (
    <div className="flex min-h-screen flex-col">
      {paso !== null && <NavbarParticulares pasoActual={paso} />}

      <main key={vista} className="anim-entra-adelante flex flex-1 flex-col">
        {vista === "subida" && (
          // El nombre y el email todavía no viajan a ningún sitio: la
          // siguiente pantalla que los necesitará ("ahorro y recomendación")
          // aún no existe. Se recogerán en cuanto haga falta pasarlos.
          <PantallaSubidaParticulares onContinuar={() => ir("carga")} />
        )}
        {vista === "carga" && (
          <PantallaCargaEmpresas onTerminar={() => ir("resultado")} />
        )}
        {vista === "resultado" && (
          <PantallaResultadoParticulares onContinuar={() => ir("ahorro")} />
        )}
        {vista === "ahorro" && <PantallaAhorroParticulares onAtras={() => ir("resultado")} />}
      </main>
    </div>
  );
}
