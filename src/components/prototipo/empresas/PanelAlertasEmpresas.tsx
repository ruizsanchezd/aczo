"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Alert } from "@/components/ui/Alert";
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
 * PanelAlertasEmpresas — el panel lateral de "Revisar" de la pantalla de
 * resultado (/empresas). Mismo patrón que PanelPermanencias.tsx (el panel del
 * recorrido particular): portal colgado del `<body>`, velo + panel que entra
 * deslizándose desde la derecha, pestañas con cascada propia al cambiar.
 *
 * La ficha de cada contrato SÍ cambia de forma entre pestañas (no es solo un
 * dato distinto en la misma caja, como en el particular):
 *   - Permanencia: caja gris con la fecha de fin y el coste de cancelación
 *     estimado, más el interruptor "Incluir de todos modos" y "Ver factura".
 *   - Vencidas: solo la etiqueta "Vencida" y el enlace "Subir factura
 *     reciente" — no hay caja ni interruptor, porque no hay nada que estimar.
 *
 * Reutiliza los mismos datos de mentira que el panel particular
 * (PERMANENCIAS, FACTURAS_VENCIDAS): ya tienen sociedad y CIF, pensados para
 * varias empresas a la vez.
 */

export type PestanaAlerta = "permanencia" | "vencidas";

const PESTANAS = [
  { id: "permanencia" as const, etiqueta: "Permanencia", contratos: PERMANENCIAS },
  { id: "vencidas" as const, etiqueta: "Vencidas", contratos: FACTURAS_VENCIDAS },
];

export function PanelAlertasEmpresas({
  abierto,
  pestanaInicial,
  onCerrar,
}: {
  abierto: boolean;
  pestanaInicial: PestanaAlerta | null;
  onCerrar: () => void;
}) {
  const [cerrando, setCerrando] = useState(false);
  const [pestana, setPestana] = useState<PestanaAlerta>("permanencia");

  // Se abre directamente en la pestaña desde la que se pulsó "Revisar".
  useEffect(() => {
    if (abierto && pestanaInicial) setPestana(pestanaInicial);
  }, [abierto, pestanaInicial]);

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

  if (!abierto || typeof document === "undefined") return null;

  const contratos = PESTANAS.find((p) => p.id === pestana)?.contratos ?? PERMANENCIAS;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Alertas de tus contratos"
      className="fixed inset-00 z-50 flex justify-end"
    >
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

      <aside
        className={[
          "relative flex h-full w-full max-w-[500px] flex-col",
          "border-l border-border-low bg-background-base",
          cerrando
            ? "translate-x-full opacity-00 transition-[transform,opacity] motion-micro-leave"
            : "anim-entra-lateral",
        ].join(" ")}
      >
        <header className="flex shrink-0 flex-col border-b border-border-low">
          <div className="flex items-center justify-between gap-04 px-07 py-06">
            <Text variant="title-l" as="h2">
              Alertas
            </Text>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={iniciarCierre}
              className="cursor-pointer rounded-sm p-01 text-content-high transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
            >
              <Icon name="close" />
            </button>
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

        <div className="flex flex-1 flex-col gap-06 overflow-y-auto p-07">
          <Alert tone="subtle">
            {pestana === "permanencia"
              ? "Estas facturas tienen contratos con una cláusula de permanencia vigente con su comercializadora actual. Los costes mostrados son una estimación orientativa que podría variar respecto al coste real de cancelación."
              : "Estas facturas superan los 12 meses de antigüedad, así que es probable que el análisis de ahorro pierda exactitud. Te recomendamos, si es posible, subir una factura más reciente."}
          </Alert>

          <div className="flex flex-col gap-04">
            {contratos.map((c, i) => (
              <FichaContratoEmpresas
                key={`${pestana}-${c.id}`}
                contrato={c}
                pestana={pestana}
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

function FichaContratoEmpresas({
  contrato,
  pestana,
  style,
}: {
  contrato: ContratoAlerta;
  pestana: PestanaAlerta;
  style?: React.CSSProperties;
}) {
  const [incluir, setIncluir] = useState(false);

  return (
    <article
      className="anim-aparece flex flex-col gap-05 rounded-lg border border-border-low bg-background-base p-06"
      style={style}
    >
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

      <div className="flex flex-wrap gap-04">
        <Dato etiqueta="Sociedad">{contrato.sociedad}</Dato>
        <Dato etiqueta="CIF">{contrato.cif}</Dato>
        <Dato etiqueta="CUPS">{contrato.cups}</Dato>
      </div>

      {pestana === "permanencia" ? (
        <>
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
              <Text variant="body-s" color="mid" className="italic">
                No hemos podido estimar el coste de penalización para este
                contrato
              </Text>
            )}
          </div>

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
            <EnlaceFicha>Ver factura</EnlaceFicha>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-04">
          <Tag tone="warning">Vencida</Tag>
          <EnlaceFicha>Subir factura reciente</EnlaceFicha>
        </div>
      )}
    </article>
  );
}

function EnlaceFicha({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="cursor-pointer text-label-m text-content-high underline transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
    >
      {children}
    </button>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
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
