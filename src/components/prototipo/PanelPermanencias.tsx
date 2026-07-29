"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  euros,
  FACTURAS_VENCIDAS,
  PERMANENCIAS,
  type ContratoAlerta,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";

/**
 * PanelPermanencias — el panel lateral de alertas.
 *
 * Se abre desde el enlace "Revisar permanencias" del aviso de la pantalla de
 * recomendación. Tiene dos pestañas: los contratos con permanencia vigente y las
 * facturas vencidas.
 *
 * ANIMACIONES:
 *   - El velo aparece (anim-aparece-simple, 350 ms) y el panel entra deslizándose
 *     desde el borde derecho (anim-entra-lateral, macro-levelup: 350 ms, ease
 *     out). Es "entrar en un detalle", el mismo token que los desplegables de la
 *     tabla.
 *   - Las fichas entran en cascada de 60 en 60 ms, ya con el panel dentro.
 *   - Al cerrar, el panel se va hacia la derecha y el velo se apaga con
 *     motion-micro-leave (250 ms): salir siempre es más rápido que entrar.
 *   - Al cambiar de pestaña, las fichas de la nueva pestaña vuelven a entrar en
 *     cascada. Es lo que hace que se lea "esto es otra lista", no "ha cambiado
 *     una palabra".
 *
 * Se cierra con la X, con Escape y pulsando fuera.
 *
 * Igual que la ventana de comparación, se pinta con un portal colgado del
 * <body>: dentro del contenedor de la pantalla, el transform de la animación de
 * entrada rompería el position: fixed (ver el aviso en ModalComparar.tsx).
 *
 * OJO: en el Figma esta pantalla está a nivel de wireframe (fuentes y grises
 * genéricos). Aquí se le han aplicado los tokens del sistema. La pestaña de
 * facturas vencidas no está dibujada: reutiliza la misma ficha cambiando el dato
 * de la caja gris (fecha de la factura en vez de fin de la permanencia).
 */

const PESTANAS = [
  { id: "permanencia", etiqueta: "Permanencia", contratos: PERMANENCIAS },
  { id: "vencidas", etiqueta: "Vencidas", contratos: FACTURAS_VENCIDAS },
] as const;

export function PanelPermanencias({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) {
  const [cerrando, setCerrando] = useState(false);
  const [pestana, setPestana] = useState<(typeof PESTANAS)[number]["id"]>(
    "permanencia",
  );

  // Cerrar con Escape, y no dejar que la página de detrás haga scroll.
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
    // Se espera a que termine la animación de salida antes de desmontar.
    setTimeout(() => {
      setCerrando(false);
      onCerrar();
    }, 250);
  }

  if (!abierto || typeof document === "undefined") return null;

  const contratos =
    PESTANAS.find((p) => p.id === pestana)?.contratos ?? PERMANENCIAS;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Alertas de tus contratos"
      className="fixed inset-00 z-50 flex justify-end"
    >
      {/* Velo */}
      <button
        type="button"
        aria-label="Cerrar el panel de alertas"
        onClick={iniciarCierre}
        className={`fixed inset-00 cursor-default bg-background-overlay ${
          cerrando
            ? "opacity-00 transition-opacity motion-micro-leave"
            : "anim-aparece-simple"
        }`}
      />

      {/* Panel. 500 px es el ancho del Figma; en móvil ocupa todo el ancho. */}
      <aside
        className={[
          "relative flex h-full w-full max-w-[500px] flex-col",
          "border-l border-border-low bg-background-base",
          cerrando
            ? "translate-x-full opacity-00 transition-[transform,opacity] motion-micro-leave"
            : "anim-entra-lateral",
        ].join(" ")}
      >
        {/* Cabecera y pestañas ------------------------------------------- */}
        <header className="flex shrink-0 flex-col border-b border-border-low">
          <div className="flex items-center justify-between gap-04 px-07 py-06">
            <Text variant="title-l" as="h2">
              Alertas
            </Text>
            <Button
              variant="tertiary"
              iconOnly="close"
              aria-label="Cerrar"
              onClick={iniciarCierre}
            />
          </div>

          <div role="tablist" aria-label="Tipo de alerta" className="flex gap-06 px-07">
            {PESTANAS.map((p) => {
              const activa = p.id === pestana;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => setPestana(p.id)}
                  className={[
                    "cursor-pointer border-b-2 pb-03 text-label-m",
                    "transition-colors motion-micro-states",
                    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
                    activa
                      ? "border-border-high text-content-high"
                      : "border-transparent text-content-mid hover:text-content-high",
                  ].join(" ")}
                >
                  {p.etiqueta} ({p.contratos.length})
                </button>
              );
            })}
          </div>
        </header>

        {/* Contenido ------------------------------------------------------ */}
        <div className="flex flex-1 flex-col gap-06 overflow-y-auto p-07">
          <Alert tone="subtle">
            {pestana === "permanencia"
              ? "Estas facturas tienen contratos con una cláusula de permanencia vigente con su comercializadora actual. Los costes mostrados son una estimación orientativa que podría variar respecto al coste real de cancelación."
              : "Estas facturas son de hace más de un año. Se pueden usar para estimar, pero el cálculo será menos exacto que con una factura reciente."}
          </Alert>

          <div className="flex flex-col gap-04">
            {contratos.map((c, i) => (
              // La key lleva la pestaña delante para que al cambiar de pestaña
              // React monte fichas nuevas y la cascada de entrada se repita.
              <FichaContrato
                key={`${pestana}-${c.id}`}
                contrato={c}
                style={retardo(i + 1)}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/** Una ficha del panel: un contrato con su alerta. */
function FichaContrato({
  contrato,
  style,
}: {
  contrato: ContratoAlerta;
  style?: React.CSSProperties;
}) {
  const [incluir, setIncluir] = useState(false);

  return (
    <article
      className="anim-aparece flex flex-col gap-05 rounded-lg border border-border-low bg-background-base p-06"
      style={style}
    >
      {/* Comercializadora y archivo del que salió el dato */}
      <header className="flex items-center gap-03">
        <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-background-low text-content-mid">
          <Icon name="document" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center justify-between gap-03">
            <Text variant="title-s" as="h3" className="truncate">
              {contrato.comercializadora}
            </Text>
            <Tag>{contrato.tarifa}</Tag>
          </span>
          <Text variant="body-s" color="mid" className="truncate">
            {contrato.archivo}
          </Text>
        </span>
      </header>

      {/* Sociedad, CIF y CUPS */}
      <div className="flex flex-wrap gap-04">
        <Dato etiqueta="Sociedad">{contrato.sociedad}</Dato>
        <Dato etiqueta="CIF">{contrato.cif}</Dato>
        <Dato etiqueta="CUPS">{contrato.cups}</Dato>
      </div>

      {/* La caja gris: fecha y, si se ha podido estimar, el importe */}
      <div className="flex flex-wrap items-center justify-between gap-04 rounded-md bg-background-low p-04">
        <span className="flex flex-col gap-01">
          <Text variant="label-s" color="mid" as="span">
            {contrato.etiquetaFecha}
          </Text>
          <Text variant="label-s" as="span">
            {contrato.fecha}
          </Text>
        </span>

        {contrato.importe ? (
          <span className="flex items-center gap-02">
            <span className="text-warning-high">
              <Icon name="info" size={16} />
            </span>
            <span className="text-title-m whitespace-nowrap text-content-high">
              {euros(contrato.importe.min)} – {euros(contrato.importe.max)} €
            </span>
          </span>
        ) : (
          // En cursiva, como en el Figma: se lee como una nota, no como un dato.
          <Text variant="body-s" color="mid" className="italic">
            No hemos podido estimar el coste de penalización para este contrato
          </Text>
        )}
      </div>

      {/* Incluirlo de todos modos, y ver la factura de origen */}
      <div className="flex flex-wrap items-center justify-between gap-04">
        <span className="flex items-center gap-03">
          <Switch
            checked={incluir}
            onChange={setIncluir}
            label={`Incluir de todos modos el contrato de ${contrato.comercializadora}`}
          />
          <Text variant="label-m" as="span">
            Incluir de todos modos
          </Text>
        </span>
        <button
          type="button"
          className="cursor-pointer text-label-m text-content-high underline transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
        >
          Ver factura
        </button>
      </div>
    </article>
  );
}

/** Etiqueta pequeña arriba y valor debajo. */
function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 flex-col gap-01">
      <Text variant="label-s" color="mid" as="span">
        {etiqueta}
      </Text>
      <Text variant="label-m" as="span" className="truncate">
        {children}
      </Text>
    </span>
  );
}
