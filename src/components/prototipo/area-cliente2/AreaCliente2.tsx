"use client";

import { useState } from "react";
import { ERRORES_LECTURA_CLIENTE, type FacturaConError } from "@/mocks/aczo";
import { AhorroDetectadoCliente } from "./AhorroDetectadoCliente";
import { BarraLateralCliente } from "./BarraLateralCliente";
import { ConsumoAhorro } from "./ConsumoAhorro";
import { Dashboard } from "./Dashboard";
import { DocumentosCliente } from "./DocumentosCliente";
import { MiPerfilCliente } from "./MiPerfilCliente";
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
 *   - "perfil" — se abre pulsando el nombre/avatar del pie de la barra
 *     lateral (`onAbrirPerfil`), no una de las cuatro secciones del menú.
 *

 * "nuevo-suministro" tiene una segunda puerta de entrada: "Subir factura de
 * nuevo", en una factura con error de lectura dentro de "Notificaciones y
 * alertas" (ver PanelAvisos.tsx). Por eso `erroresLectura` y
 * `facturaAResolver` viven aquí, no en PanelAvisos ni en
 * NuevoSuministroCliente: son el único sitio por el que pasan los dos.
 */
export function AreaCliente2() {
  const [seccion, setSeccion] = useState("dashboard");
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);
  // Lo mantiene PanelAvisos (sabe si queda alguna alerta/notificación sin
  // leer) y lo lee la campana de la barra lateral, para pintar su puntito
  // rojo también con el panel cerrado.
  const [avisosSinLeer, setAvisosSinLeer] = useState(false);
  // Las facturas con error de lectura pendientes de PanelAvisos — aquí, no
  // ahí, porque quien las resuelve (NuevoSuministroCliente) vive fuera de
  // ese panel (ver la nota de cabecera).
  const [erroresLectura, setErroresLectura] = useState(ERRORES_LECTURA_CLIENTE);
  // Qué factura se está resolviendo ahora mismo dentro del asistente, o null
  // si se ha abierto para dar de alta un suministro nuevo desde cero.
  const [facturaAResolver, setFacturaAResolver] = useState<FacturaConError | null>(
    null,
  );

  // Cambia de sección y, salvo que se vaya AL asistente, olvida qué factura
  // se estaba resolviendo — si no, salir de él sin terminarlo (la flecha de
  // "volver" del paso 01, o pulsando otra sección de la barra lateral a
  // media resolución) dejaría el aviso y el archivo precargado puestos la
  // próxima vez que se abra para dar de alta un suministro normal.
  function ir(id: string) {
    if (id !== "nuevo-suministro") setFacturaAResolver(null);
    setSeccion(id);
  }

  function navegar(id: string) {
    if (
      id === "dashboard" ||
      id === "cartera" ||
      id === "consumo" ||
      id === "documentos" ||
      id === "nuevo-suministro" ||
      id === "ahorro-detectado"
    )
      ir(id);
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
        onAbrirPerfil={() => ir("perfil")}
      />

      <main className="ml-[256px] min-w-0 px-06 py-07">
        {seccion === "dashboard" ? (
          <Dashboard
            onVerCartera={() => ir("cartera")}
            onVerConsumo={() => ir("consumo")}
            onAbrirNuevoSuministro={() => ir("nuevo-suministro")}
            onVerAhorro={() => ir("ahorro-detectado")}
          />
        ) : seccion === "cartera" ? (
          <PantallaCartera
            onAbrirNuevoSuministro={() => ir("nuevo-suministro")}
            onVerAhorro={() => ir("ahorro-detectado")}
          />
        ) : seccion === "consumo" ? (
          <ConsumoAhorro
            onAbrirNuevoSuministro={() => ir("nuevo-suministro")}
            onVerAhorro={() => ir("ahorro-detectado")}
          />
        ) : seccion === "documentos" ? (
          <DocumentosCliente
            onAbrirNuevoSuministro={() => ir("nuevo-suministro")}
          />
        ) : seccion === "nuevo-suministro" ? (
          <NuevoSuministroCliente
            // El asistente no se desmonta al pulsar la campana (el panel de
            // avisos flota por encima, no cambia `seccion`): sin esta `key`
            // reutilizaría su estado interno (`vista`, en qué paso se había
            // quedado) al resolver una SEGUNDA factura seguida, en vez de
            // volver a arrancar en "Sube tu factura".
            key={facturaAResolver?.id ?? "nuevo-suministro"}
            onVolver={() => ir("dashboard")}
            onIrACartera={() => ir("cartera")}
            facturaAResolver={facturaAResolver}
            onResueltoErrorLectura={() => {
              if (!facturaAResolver) return;
              setErroresLectura((es) =>
                es.filter((e) => e.id !== facturaAResolver.id),
              );
            }}
          />
        ) : seccion === "perfil" ? (
          <MiPerfilCliente />
        ) : (
          <AhorroDetectadoCliente
            onVolver={() => ir("dashboard")}
            onIrACartera={() => ir("cartera")}
          />
        )}
      </main>

      <PanelAvisos
        abierto={avisosAbiertos}
        onCerrar={() => setAvisosAbiertos(false)}
        onCambiarSinLeer={setAvisosSinLeer}
        errores={erroresLectura}
        onSubirFacturaDeNuevo={(factura) => {
          setFacturaAResolver(factura);
          setAvisosAbiertos(false);
          ir("nuevo-suministro");
        }}
      />
    </div>
  );
}
