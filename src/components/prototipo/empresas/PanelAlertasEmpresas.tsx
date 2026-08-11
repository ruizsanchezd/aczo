"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
 * PanelAlertasEmpresas — el panel lateral de "Revisar" de la pantalla de
 * resultado (/empresas). Mismo patrón que PanelPermanencias.tsx (el panel del
 * recorrido particular): portal colgado del `<body>`, velo + panel que entra
 * deslizándose desde la derecha, pestañas con cascada propia al cambiar.
 *
 * Ojo: aunque el patrón de interacción es el mismo que el panel particular,
 * el aspecto de la ficha es propio de este Figma y no coincide con
 * FichaContrato del particular en varios detalles: el nombre de la
 * comercializadora y el título "Alertas" van en la tipografía de marca
 * (heading, no title), el icono de la ficha es un cuadrado grande en
 * highlight-deep (no un cuadrado gris pequeño), y el aviso interno es azul
 * (`info`, no `subtle`).
 *
 * El título "Alertas" y el nombre de la comercializadora van fijos a 24 px
 * (heading/m del Figma), NO con el token `heading-m` normal: ese token crece
 * a 32 px en escritorio (pensado para secciones de la landing), pero este
 * panel es una pieza de interfaz de ancho fijo que no debe seguir esa escala
 * responsive. Por eso van con el tamaño a pelo en vez del token — es la
 * excepción que contempla el principio 2 de CLAUDE.md.
 *
 * La ficha SÍ cambia de forma entre pestañas, no solo de dato:
 *   - Permanencia: caja BLANCA (sobre la ficha gris) con la fecha de fin y el
 *     coste de cancelación estimado, más el interruptor "Incluir de todos
 *     modos" (sin botón: no hay acción de continuar en esta pestaña).
 *   - Vencidas: la etiqueta "Vencida" y el botón PRIMARIO "Subir factura
 *     reciente" — es la acción que sí queremos que se haga, así que lleva el
 *     botón con más peso visual del sistema, no el terciario.
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

  // Como muestra, solo 2 fichas por pestaña (no las 5/3 completas de los datos
  // de mentira): es lo que hace falta para ver el patrón, no un listado real.
  const contratos = (
    PESTANAS.find((p) => p.id === pestana)?.contratos ?? PERMANENCIAS
  ).slice(0, 2);

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
            <h2 className="font-heading text-[24px] leading-[32px] tracking-[-2px] text-content-high">
              Alertas
            </h2>
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
                    "cursor-pointer border-b pb-03 text-label-m",
                    "transition-colors motion-micro-states",
                    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
                    activa
                      ? "border-border-high text-content-high"
                      : "border-border-mid text-content-mid hover:text-content-high",
                  ].join(" ")}
                >
                  {p.etiqueta}
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-06 overflow-y-auto p-07">
          <Alert tone="info">
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

/** "2.0TD"/"3.0TD" son tarifas de luz; el resto (3.1, 3.2…) son de gas. */
function tipoSuministro(tarifa: string): "Luz" | "Gas" {
  return tarifa.includes("TD") ? "Luz" : "Gas";
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
      className="anim-aparece flex flex-col gap-05 rounded-md border border-border-low bg-background-low p-06"
      style={style}
    >
      <header className="flex items-center gap-03">
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-md bg-highlight-deep text-content-always-light">
          <Icon name="document" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center justify-between gap-03">
            <h3 className="truncate font-heading text-[24px] leading-[32px] tracking-[-2px] text-content-high">
              {contrato.comercializadora}
            </h3>
            <Tag>Tarifa {tipoSuministro(contrato.tarifa)}</Tag>
          </span>
          <Text variant="body-m" color="low" className="truncate">
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
          <div className="flex flex-wrap items-end justify-between gap-04 rounded-[12px] bg-background-base p-04">
            <span className="flex flex-col gap-01">
              <Text variant="body-s" color="low" as="span">
                {contrato.etiquetaFecha}
              </Text>
              <Text variant="body-m" as="span">
                {contrato.fecha}
              </Text>
            </span>

            {contrato.importe ? (
              <span className="flex items-center gap-02">
                <span className="text-content-mid">
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

          <div className="flex items-center gap-03">
            <Switch
              checked={incluir}
              onChange={setIncluir}
              label={`Incluir de todos modos el contrato de ${contrato.comercializadora}`}
            />
            <Text variant="label-m" as="span">
              Incluir de todos modos
            </Text>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-04">
          <Tag tone="warning">Vencida</Tag>
          <Button>Subir factura reciente</Button>
        </div>
      )}
    </article>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col gap-01">
      <Text variant="body-s" color="low" as="span">
        {etiqueta}
      </Text>
      <Text variant="body-m" as="span" className="truncate">
        {children}
      </Text>
    </span>
  );
}
