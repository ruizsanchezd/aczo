"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { PantallaAnalizando } from "./PantallaAnalizando";
import { PantallaDatos } from "./PantallaDatos";
import { PantallaFirma } from "./PantallaFirma";
import { PantallaPropuesta } from "./PantallaPropuesta";
import { PantallaSubida } from "./PantallaSubida";
import { PantallaTramitacion } from "./PantallaTramitacion";

/**
 * Recorrido — el prototipo completo, de la primera pantalla a la última.
 *
 * LAS SEIS VISTAS Y A QUÉ PASO DEL INDICADOR CORRESPONDEN:
 *
 *   vista          indicador   qué es
 *   ------------------------------------------------------------------------
 *   subida         01          arrastrar las facturas
 *   datos          01          nombre, email y consentimiento
 *   analizando     (ninguno)   pantalla de carga a pantalla completa
 *   propuesta      02          los tres planes y el detalle por comercializadora
 *   firma          03          apoderado, IBANes y forma de autorizar
 *   tramitacion    (ninguno)   confirmación; el recorrido ha terminado
 *
 * TRANSICIÓN ENTRE PANTALLAS:
 *
 * Cada vista entra desplazándose 24 px y apareciendo. La dirección depende de
 * hacia dónde se va:
 *   - hacia delante: entra desde la derecha, motion-macro-levelup (350 ms)
 *   - hacia atrás:   entra desde la izquierda, motion-macro-leveldown (400 ms)
 *
 * Volver atrás es un poco más lento a propósito: es el token que el sistema usa
 * para "bajar de nivel", y esos 50 ms de más se leen como "estás deshaciendo",
 * no como "estás avanzando".
 *
 * La `key` del contenedor es la vista: al cambiar, React monta un elemento nuevo
 * y la animación de entrada se dispara sola, sin necesidad de librería.
 *
 * NAVEGACIÓN: hacia delante solo con los botones de cada pantalla (hay datos que
 * rellenar). Hacia atrás, además, pulsando un paso ya hecho en el indicador.
 */

const VISTAS = [
  "subida",
  "datos",
  "analizando",
  "propuesta",
  "firma",
  "tramitacion",
] as const;

type Vista = (typeof VISTAS)[number];

/** A qué paso del indicador corresponde cada vista (null = sin indicador). */
const PASO_DE_VISTA: Record<Vista, number | null> = {
  subida: 0,
  datos: 0,
  analizando: null,
  propuesta: 1,
  firma: 2,
  tramitacion: null,
};

/** A qué vista se vuelve al pulsar cada paso del indicador. */
const VISTA_DE_PASO: Record<number, Vista> = {
  0: "subida",
  1: "propuesta",
  2: "firma",
};

export function Recorrido() {
  const [vista, setVista] = useState<Vista>("subida");
  const [haciaAtras, setHaciaAtras] = useState(false);

  function ir(destino: Vista) {
    setHaciaAtras(VISTAS.indexOf(destino) < VISTAS.indexOf(vista));
    setVista(destino);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const paso = PASO_DE_VISTA[vista];
  const animacion = haciaAtras ? "anim-entra-atras" : "anim-entra-adelante";

  return (
    <div className="flex min-h-screen flex-col bg-background-low">
      {/* La pantalla de carga va a pantalla completa, sin barra superior. */}
      {vista !== "analizando" && (
        <Navbar
          pasoActual={paso}
          onIrAPaso={(p) => {
            const destino = VISTA_DE_PASO[p];
            if (destino) ir(destino);
          }}
        />
      )}

      <main key={vista} className={`flex flex-1 flex-col ${animacion}`}>
        {vista === "subida" && (
          <PantallaSubida onContinuar={() => ir("datos")} />
        )}

        {vista === "datos" && (
          <PantallaDatos onContinuar={() => ir("analizando")} />
        )}

        {vista === "analizando" && (
          <PantallaAnalizando onTerminar={() => ir("propuesta")} />
        )}

        {vista === "propuesta" && (
          <PantallaPropuesta onContinuar={() => ir("firma")} />
        )}

        {vista === "firma" && (
          <PantallaFirma
            onContinuar={() => ir("tramitacion")}
            onAtras={() => ir("propuesta")}
          />
        )}

        {vista === "tramitacion" && <PantallaTramitacion />}
      </main>
    </div>
  );
}
