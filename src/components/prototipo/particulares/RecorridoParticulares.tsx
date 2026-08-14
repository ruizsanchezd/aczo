"use client";

import { useState } from "react";
import { PantallaCargaEmpresas } from "../empresas/PantallaCargaEmpresas";
import { NavbarParticulares } from "./NavbarParticulares";
import {
  PantallaAhorroParticulares,
  type ResumenCambioParticulares,
} from "./PantallaAhorroParticulares";
import { PantallaCambioCompaniaParticulares } from "./PantallaCambioCompaniaParticulares";
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
 *   cambio       03          "Cambio de compañía", tras "Hacer el cambio"
 *
 * QUÉ SE ARRASTRA DE UNA PANTALLA A OTRA: el nombre y el email que se
 * escriben en `subida` llegan hasta `cambio`, donde salen ya rellenos (junto
 * con lo "leído de la factura"); y `ahorro` le pasa a `cambio` una foto de la
 * oferta elegida para la columna del resumen.
 *
 * Pendiente: "Alta en tramitación" (paso 04) y lo que venga después.
 */

const VISTAS = ["subida", "carga", "resultado", "ahorro", "cambio"] as const;
type Vista = (typeof VISTAS)[number];

const PASO_DE_VISTA: Record<Vista, number | null> = {
  subida: 0,
  carga: null,
  resultado: 0,
  ahorro: 1,
  cambio: 2,
};

export function RecorridoParticulares() {
  const [vista, setVista] = useState<Vista>("subida");
  // Lo que se escribió al subir la factura, para no volver a pedirlo en el
  // paso 3.
  const [datosContratante, setDatosContratante] = useState({
    nombre: "",
    email: "",
  });
  const [resumen, setResumen] = useState<ResumenCambioParticulares | null>(null);

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
          <PantallaSubidaParticulares
            onContinuar={(datos) => {
              setDatosContratante(datos);
              ir("carga");
            }}
          />
        )}
        {vista === "carga" && (
          <PantallaCargaEmpresas onTerminar={() => ir("resultado")} />
        )}
        {vista === "resultado" && (
          <PantallaResultadoParticulares onContinuar={() => ir("ahorro")} />
        )}
        {vista === "ahorro" && (
          <PantallaAhorroParticulares
            onAtras={() => ir("resultado")}
            onContinuar={(nuevoResumen) => {
              setResumen(nuevoResumen);
              ir("cambio");
            }}
          />
        )}
        {vista === "cambio" && resumen && (
          <PantallaCambioCompaniaParticulares
            datosContratante={datosContratante}
            resumen={resumen}
            onAtras={() => ir("ahorro")}
            // El paso 04 ("Alta en tramitación") todavía no existe: de
            // momento el botón no lleva a ningún sitio.
            onContinuar={() => {}}
          />
        )}
      </main>
    </div>
  );
}
