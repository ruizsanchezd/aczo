"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ALERTAS_CLIENTE,
  ERRORES_LECTURA_CLIENTE,
  NOTIFICACIONES_CLIENTE,
  type AlertaCliente,
  type NotificacionCliente,
} from "@/mocks/aczo";

/**
 * PanelAvisos — "Notificaciones y alertas" (Figma nodo 797:35061).
 *
 * Se abre desde la campana de la barra lateral. No es un diálogo centrado
 * como ModalSuministrosGrandes: es un panel que flota a media pantalla,
 * pegado a la izquierda justo donde termina la barra lateral — por eso mide
 * lo mismo de alto que ella (todo el alto de la ventana menos 32 px) y
 * comparte su margen de 16 px. Ancho 531 px, como en el Figma (nodo 797:38845).
 *
 * DOS PESTAÑAS, dos cosas distintas:
 *   Alertas         pide una acción (Completar, Revisar…) y se puede
 *                   descartar. Lleva delante el aviso "Resuelve las
 *                   incidencias y maximiza tu ahorro" mientras quede alguna.
 *   Notificaciones  solo informa de algo que ya ha pasado (una alta
 *                   ejecutada…). No se descarta, se lee.
 *
 * Las dos comparten el mismo estado vacío ("Todo en orden") cuando no queda
 * nada, y el mismo pie "Marcar todo como leído" cuando sí queda algo.
 *
 * UN NIVEL DE DETALLE: pulsar "Revisar" en "Errores de lectura" entra en la
 * lista de facturas que fallaron al leerse, con la flecha de vuelta en la
 * cabecera — MISMA técnica que el resto del prototipo (ver FilaInmueble).
 * "Completar" en "Sociedades pendientes" no tiene destino en el Figma
 * todavía (como "Organizar cartera" en su momento, ver
 * OrganizaTuCartera.tsx): de momento no navega a ningún sitio.
 *
 * MISMO PATRÓN DE VENTANA QUE ModalSuministrosGrandes.tsx (ahí está
 * explicado con más detalle): portal, velo, cerrar con la X/Escape/fuera,
 * crecer/salir con las animaciones del sistema.
 */
export function PanelAvisos({
  abierto,
  onCerrar,
  onCambiarSinLeer,
}: {
  abierto: boolean;
  onCerrar: () => void;
  /** Avisa hacia arriba cada vez que cambia si queda algo sin leer, para que
   * la campana de la barra lateral pueda pintar su puntito rojo sin tener
   * que duplicar aquí el estado de lectura. */
  onCambiarSinLeer?: (hay: boolean) => void;
}) {
  const [cerrando, setCerrando] = useState(false);
  const [pestaña, setPestaña] = useState<"alertas" | "notificaciones">(
    "alertas",
  );
  const [vista, setVista] = useState<"lista" | "errores-lectura">("lista");
  const [alertas, setAlertas] = useState(ALERTAS_CLIENTE);
  const [alertasLeidas, setAlertasLeidas] = useState(false);
  const [notificacionesLeidas, setNotificacionesLeidas] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    function alPulsarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") iniciarCierre();
    }

    document.addEventListener("keydown", alPulsarTecla);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPulsarTecla);
      document.body.style.overflow = overflowAnterior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  function iniciarCierre() {
    setCerrando(true);
    setTimeout(() => {
      setCerrando(false);
      onCerrar();
    }, 250);
  }

  function descartarAlerta(id: string) {
    setAlertas((a) => a.filter((alerta) => alerta.id !== id));
  }

  const hayAlertasSinLeer = alertas.length > 0 && !alertasLeidas;
  const hayNotificacionesSinLeer =
    NOTIFICACIONES_CLIENTE.length > 0 && !notificacionesLeidas;

  // Independiente de `abierto`: la campana necesita saberlo también con el
  // panel cerrado, así que se avisa cada vez que cambia (no solo al abrir).
  useEffect(() => {
    onCambiarSinLeer?.(hayAlertasSinLeer || hayNotificacionesSinLeer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayAlertasSinLeer, hayNotificacionesSinLeer]);

  if (!abierto || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-00 z-50">
      {/* Velo */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => iniciarCierre()}
        className={`fixed inset-00 cursor-default bg-background-overlay ${
          cerrando
            ? "opacity-00 transition-opacity motion-micro-leave"
            : "anim-aparece-simple"
        }`}
      />

      {/* Panel — a media pantalla, pegado a la izquierda del contenido
          (mismo top-04/left que la barra lateral más sus 240 px de ancho). */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notificaciones y alertas"
        className={[
          "fixed top-04 left-[256px] flex h-[calc(100vh-2*var(--spacing-04))] w-[531px] max-w-[calc(100vw-256px-var(--spacing-04))] flex-col overflow-hidden rounded-md bg-background-base shadow-md",
          cerrando
            ? "-translate-x-02 opacity-00 transition-[transform,opacity] motion-micro-leave"
            : "anim-aparece",
        ].join(" ")}
      >
        <header className="flex items-center justify-between gap-04 border-t border-border-low p-04">
          <span className="flex items-center gap-02">
            {vista === "errores-lectura" && (
              <button
                type="button"
                aria-label="Volver"
                onClick={() => setVista("lista")}
                className="flex cursor-pointer items-center rounded-full bg-background-low p-02 text-content-high transition-opacity motion-micro-states hover:opacity-60"
              >
                <Icon name="chevron-left" size={16} />
              </button>
            )}
            <Text variant="heading-s" as="h2">
              {vista === "errores-lectura"
                ? "Errores de lectura"
                : "Notificaciones y alertas"}
            </Text>
          </span>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => iniciarCierre()}
            className="flex size-07 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-background-low text-content-high transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        {vista === "lista" && (
          <div
            role="tablist"
            aria-label="Ver por"
            className="flex items-center p-03"
          >
            {(
              [
                { id: "alertas", rotulo: "Alertas", sinLeer: hayAlertasSinLeer },
                {
                  id: "notificaciones",
                  rotulo: "Notificaciones",
                  sinLeer: hayNotificacionesSinLeer,
                },
              ] as const
            ).map((p) => {
              const activa = p.id === pestaña;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => setPestaña(p.id)}
                  className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-02 border-b-2 py-02 transition-colors motion-micro-states ${
                    activa
                      ? "border-border-high"
                      : "border-transparent hover:opacity-60"
                  }`}
                >
                  {p.sinLeer && (
                    <span
                      aria-hidden
                      className="size-02 shrink-0 rounded-full bg-highlight-muted"
                    />
                  )}
                  <Text
                    variant="label-m"
                    as="span"
                    color={activa ? "high" : "low"}
                  >
                    {p.rotulo}
                  </Text>
                </button>
              );
            })}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {vista === "errores-lectura" ? (
            <div className="flex flex-col gap-04 p-05">
              {ERRORES_LECTURA_CLIENTE.map((f) => (
                <div
                  key={f.id}
                  className="rounded-md bg-background-low p-04"
                >
                  <div className="flex items-start justify-between gap-04">
                    <span className="flex items-start gap-03">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-highlight-deep text-highlight-soft">
                        <Icon name="document" />
                      </span>
                      <span className="flex flex-col">
                        <Text variant="label-l" as="span">
                          {f.comercializadora}
                        </Text>
                        <Text variant="body-s" color="low" as="span">
                          {f.archivo}
                        </Text>
                      </span>
                    </span>
                    <Tag tone="outline" className="border border-border-low shrink-0">
                      {f.tarifa}
                    </Tag>
                  </div>

                  <div className="mt-04 grid grid-cols-3 gap-03">
                    <span className="flex flex-col gap-01">
                      <Text variant="label-s-uppercase" color="low" as="span">
                        Sociedad
                      </Text>
                      <Text variant="label-m" as="span">
                        {f.sociedad}
                      </Text>
                    </span>
                    <span className="flex flex-col gap-01">
                      <Text variant="label-s-uppercase" color="low" as="span">
                        CIF
                      </Text>
                      <Text variant="label-m" as="span">
                        {f.cif}
                      </Text>
                    </span>
                    <span className="flex flex-col gap-01">
                      <Text variant="label-s-uppercase" color="low" as="span">
                        CUPS
                      </Text>
                      <Text variant="label-m" as="span">
                        *******************
                      </Text>
                    </span>
                  </div>

                  <div className="mt-04 flex flex-wrap items-center justify-between gap-03">
                    <Tag tone="warning">Lectura del CUPS incorrecta</Tag>
                    <Button size="small">Subir factura de nuevo</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : pestaña === "alertas" ? (
            alertas.length === 0 ? (
              <EstadoVacio mensaje="No tienes alertas actualmente. Tu panel está actualizado y no hay incidencias pendientes." />
            ) : (
              <div className="flex flex-col">
                <div className="p-03">
                  <Alert tone="highlight" icon="info">
                    <div className="flex flex-col gap-01">
                      <Text variant="body-m" color="always-dark" as="p" className="font-bold">
                        Resuelve las incidencias y maximiza tu ahorro
                      </Text>
                      <Text variant="body-m" color="always-dark" as="p">
                        Recuerda que tienes incidencias pendientes de resolver.
                        Resuélvelas para maximizar tu ahorro
                      </Text>
                    </div>
                  </Alert>
                </div>

                <ul className="flex flex-col">
                  {alertas.map((alerta) => (
                    <FilaAlerta
                      key={alerta.id}
                      alerta={alerta}
                      onAccion={() => {
                        if (alerta.id === "errores-lectura")
                          setVista("errores-lectura");
                      }}
                      onDescartar={() => descartarAlerta(alerta.id)}
                      sinLeer={!alertasLeidas}
                    />
                  ))}
                </ul>
              </div>
            )
          ) : NOTIFICACIONES_CLIENTE.length === 0 ? (
            <EstadoVacio mensaje="No tienes notificaciones pendientes. Tu panel está actualizado." />
          ) : (
            <ul className="flex flex-col">
              {NOTIFICACIONES_CLIENTE.map((n) => (
                <FilaNotificacion key={n.id} notificacion={n} sinLeer={!notificacionesLeidas} />
              ))}
            </ul>
          )}
        </div>

        {vista === "lista" &&
          ((pestaña === "alertas" && alertas.length > 0) ||
            (pestaña === "notificaciones" &&
              NOTIFICACIONES_CLIENTE.length > 0)) && (
            <footer className="flex h-[57px] shrink-0 items-center justify-center border-t border-border-low px-04">
              <button
                type="button"
                onClick={() =>
                  pestaña === "alertas"
                    ? setAlertasLeidas(true)
                    : setNotificacionesLeidas(true)
                }
                className="cursor-pointer text-label-m text-highlight-muted transition-opacity motion-micro-states hover:opacity-60"
              >
                Marcar todo como leído
              </button>
            </footer>
          )}
      </div>
    </div>,
    document.body,
  );
}

/** El cuadrado del icono de cada fila. 34 px es la medida del Figma (nodo
 * 797:38861: 20 de icono + 7 de aire por cada lado) y no hay token para ella. */
const CAJA_ICONO = "flex size-[34px] shrink-0 items-center justify-center rounded-md";

/** El puntito de "sin leer" de cada fila — 6 px en el Figma, sin token. */
function PuntoSinLeer() {
  return (
    <span
      aria-hidden
      className="size-[6px] shrink-0 rounded-full bg-highlight-muted"
    />
  );
}

/** Una alerta: icono, título (+ "Urgente" si toca), descripción, acciones y fecha. */
function FilaAlerta({
  alerta,
  onAccion,
  onDescartar,
  sinLeer,
}: {
  alerta: AlertaCliente;
  onAccion: () => void;
  onDescartar: () => void;
  sinLeer: boolean;
}) {
  return (
    <li className="flex items-start gap-03 p-04">
      <span className={`${CAJA_ICONO} bg-warning-low text-warning-high`}>
        <Icon name="warning" size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-02">
        <div className="flex flex-col gap-01">
          <span className="flex flex-wrap items-center gap-01">
            <Text variant="label-m" as="span">
              {alerta.titulo}
            </Text>
            {alerta.urgente && <Tag tone="warning">Urgente</Tag>}
          </span>
          <Text variant="body-s" color="mid" as="p">
            {alerta.descripcion}
          </Text>
        </div>
        <div className="flex items-center gap-02">
          <Button size="small" onClick={onAccion}>
            {alerta.accion}
          </Button>
          <Button size="small" variant="secondary" onClick={onDescartar}>
            Descartar
          </Button>
        </div>
        <Text variant="body-s" color="low" as="p">
          {alerta.fecha}
        </Text>
      </div>
      {sinLeer && <PuntoSinLeer />}
    </li>
  );
}

/** Una notificación: icono, título, detalle y fecha. Sin botones: solo informa. */
function FilaNotificacion({
  notificacion,
  sinLeer,
}: {
  notificacion: NotificacionCliente;
  sinLeer: boolean;
}) {
  return (
    <li className="flex items-start gap-03 p-04">
      <span className={`${CAJA_ICONO} bg-success-low text-success-high`}>
        <Icon name="check-circle" size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-01">
        <Text variant="label-m" as="span">
          {notificacion.titulo}
        </Text>
        <Text variant="body-s" color="mid" as="p">
          {notificacion.detalle}
        </Text>
        <Text variant="body-s" color="low" as="p">
          {notificacion.fecha}
        </Text>
      </div>
      {sinLeer && <PuntoSinLeer />}
    </li>
  );
}

/** El estado "Todo en orden", compartido por las dos pestañas cuando no queda nada. */
function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-04 p-06 text-center">
      <span className="text-highlight-muted">
        <Icon name="spark" size={40} />
      </span>
      <div className="flex flex-col gap-01">
        <Text variant="label-l" as="p">
          Todo en orden
        </Text>
        <Text variant="body-s" color="mid" as="p" className="max-w-[32ch]">
          {mensaje}
        </Text>
      </div>
    </div>
  );
}
