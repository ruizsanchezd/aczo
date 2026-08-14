"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { ALTERNATIVAS_COMPARAR, euros, type AlternativaComparar } from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { LogoComercializadora, tieneLogoComercializadora } from "../TarjetaPlan";

/**
 * PanelCompararEmpresas — el panel lateral que se abre con "Comparar" en cada
 * comercializadora de "Tu ahorro potencial" (Figma nodes 4096:19503 y
 * 4181:44479).
 *
 * OJO, NO ES `ModalComparar.tsx`: aquel es la ventana centrada del recorrido
 * particular clásico, que se queda como está. Este Figma pide otra cosa —un
 * panel que entra por la derecha— y, sobre todo, otra mecánica: allí solo se
 * miran ofertas, y aquí se ELIGE una para sustituir a la comercializadora
 * desde la que se abrió el panel.
 *
 * Mismo patrón de panel que `PanelAlertasEmpresas.tsx` (portal colgado del
 * `<body>`, velo + panel deslizándose desde la derecha, cierre con la X, con
 * Escape y pulsando fuera), con dos diferencias propias de este Figma:
 *
 *   - **Cada tarjeta se despliega** (misma rejilla 0fr → 1fr que el resto del
 *     prototipo) para enseñar la ficha de la oferta y sus condiciones.
 *     Desplegar NO es elegir: son dos gestos distintos.
 *   - **Pie fijo con dos botones**: "Descartar" cierra sin tocar nada, y
 *     "Seleccionar compañía" está desactivado hasta que hay una elegida.
 *
 * La tarjeta elegida se marca subiendo su borde de `border-low` a
 * `border-mid`, la misma señal de "esta es" que usan las filas de "Todas las
 * ofertas" en particulares — sin cambiar el fondo.
 */
export function PanelCompararEmpresas({
  abierto,
  nombreComercializadora,
  onCerrar,
  onSeleccionar,
}: {
  abierto: boolean;
  /** Desde qué comercializadora se abrió: da título al panel. */
  nombreComercializadora?: string;
  onCerrar: () => void;
  /** Confirmar el cambio: la fila de origen pasa a ser esta compañía. */
  onSeleccionar: (alternativa: AlternativaComparar) => void;
}) {
  const [cerrando, setCerrando] = useState(false);
  const [elegida, setElegida] = useState<string | null>(null);
  const [abiertaId, setAbiertaId] = useState<string | null>(null);

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

  function iniciarCierre(alTerminar?: () => void) {
    setCerrando(true);
    setTimeout(() => {
      setCerrando(false);
      // Se limpia la elección para que al reabrir el panel se empiece de cero.
      setElegida(null);
      setAbiertaId(null);
      (alTerminar ?? onCerrar)();
    }, 250);
  }

  if (!abierto || typeof document === "undefined") return null;

  const alternativa = ALTERNATIVAS_COMPARAR.find((a) => a.id === elegida);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Comparar con ${nombreComercializadora ?? "otras compañías"}`}
      className="fixed inset-00 z-50 flex justify-end"
    >
      <button
        type="button"
        aria-label="Cerrar la comparación"
        onClick={() => iniciarCierre()}
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
        <header className="flex shrink-0 items-center justify-between gap-04 border-b border-border-low px-07 py-06">
          {/* 24 px a pelo, no el token heading-m: ese crece a 32 px en
              escritorio y este panel es de ancho fijo — mismo criterio que
              PanelAlertasEmpresas.tsx. */}
          <h2 className="font-heading text-[24px] leading-[32px] tracking-[-2px] text-content-high">
            Comparar con {nombreComercializadora}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => iniciarCierre()}
            className="cursor-pointer rounded-sm p-01 text-content-high transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
          >
            <Icon name="close" />
          </button>
        </header>

        <div
          role="radiogroup"
          aria-label="Compañías alternativas"
          className="flex flex-1 flex-col gap-04 overflow-y-auto p-06"
        >
          {ALTERNATIVAS_COMPARAR.map((a, i) => (
            <TarjetaAlternativa
              key={a.id}
              alternativa={a}
              elegida={elegida === a.id}
              onElegir={() => setElegida(a.id)}
              abierta={abiertaId === a.id}
              onAbrir={() => setAbiertaId(abiertaId === a.id ? null : a.id)}
              style={retardo(i + 1)}
            />
          ))}
        </div>

        {/* flex-1 en vez de `fullWidth`: dos botones a ancho completo dentro
            de la misma fila se pisarían — así se reparten el sitio. */}
        <div className="flex shrink-0 gap-03 border-t border-border-low px-06 py-05">
          <Button
            variant="secondary"
            onClick={() => iniciarCierre()}
            className="flex-1"
          >
            Descartar
          </Button>
          <Button
            disabled={!alternativa}
            onClick={() => {
              if (alternativa) iniciarCierre(() => onSeleccionar(alternativa));
            }}
            className="flex-1 transition-colors motion-micro-states"
          >
            Seleccionar compañía
          </Button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Piezas de este panel                                                       */
/* -------------------------------------------------------------------------- */

/** Una compañía alternativa. Toda la cabecera es la superficie de selección
 * (`role="radio"`); la flecha de desplegar corta la propagación del clic para
 * poder mirar la letra pequeña sin elegirla sin querer. */
function TarjetaAlternativa({
  alternativa,
  elegida,
  onElegir,
  abierta,
  onAbrir,
  style,
}: {
  alternativa: AlternativaComparar;
  elegida: boolean;
  onElegir: () => void;
  abierta: boolean;
  onAbrir: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={[
        "anim-aparece overflow-hidden rounded-md border bg-background-low",
        "transition-colors motion-micro-states",
        elegida ? "border-border-mid" : "border-border-low",
      ].join(" ")}
      style={style}
    >
      <div
        role="radio"
        aria-checked={elegida}
        aria-label={`Elegir ${alternativa.nombre}`}
        tabIndex={0}
        onClick={onElegir}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onElegir();
          }
        }}
        className="flex w-full cursor-pointer items-center gap-04 p-04 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-info-high"
      >
        {/* Caja cuadrada, no el hueco ancho con el nombre: aquí el Figma pone
            la marca en un cuadrado del tamaño de la fila. Octopus todavía no
            tiene archivo de logo (es una marca real, no se inventa), así que
            de momento enseña su inicial en la misma caja para no romper el
            ritmo de la lista. */}
        {tieneLogoComercializadora(alternativa.nombre) ? (
          <LogoComercializadora nombre={alternativa.nombre} className="size-09" />
        ) : (
          <span
            title={alternativa.nombre}
            className="flex size-09 shrink-0 items-center justify-center rounded-md border border-border-low bg-background-base text-label-l text-content-mid"
          >
            {alternativa.nombre.slice(0, 1)}
          </span>
        )}

        <span className="flex min-w-0 flex-1 flex-col gap-01">
          <span className="flex flex-wrap items-center gap-02">
            <Text variant="label-m" as="span">
              {alternativa.nombre}
            </Text>
            <Tag icon={alternativa.tipo === "Luz" ? "lightbulb" : "fire"}>
              {alternativa.tipo}
            </Tag>
          </span>
          <Text variant="body-m" color="mid" as="span">
            {alternativa.suministros} suministros
          </Text>
        </span>

        <span className="flex shrink-0 flex-col items-end">
          <Text variant="label-s" color="low" as="span">
            Ahorro potencial
          </Text>
          <span className="font-heading text-heading-s whitespace-nowrap text-content-high">
            {euros(alternativa.ahorroAnual)} €/año
          </span>
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAbrir();
          }}
          aria-expanded={abierta}
          aria-label={`${abierta ? "Cerrar" : "Ver"} el detalle de ${alternativa.nombre}`}
          className="shrink-0 cursor-pointer rounded-md text-content-mid outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
        >
          <span
            className={[
              "flex size-07 items-center justify-center",
              "transition-transform motion-micro-states",
              abierta ? "rotate-180" : "rotate-0",
            ].join(" ")}
          >
            <Icon name="chevron-down" />
          </span>
        </button>
      </div>

      {/* Rejilla 0fr → 1fr: el mismo plegable que el resto del prototipo. */}
      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierta ? "1fr" : "0fr" }}
        aria-hidden={!abierta}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-04 border-t border-border-low px-04 pt-04 pb-04">
            <div className="flex flex-col gap-03">
              <Text variant="label-s-uppercase" as="span">
                Detalles de la oferta
              </Text>
              <dl className="flex flex-col gap-02">
                <FilaDetalle etiqueta="Precio energía">
                  {alternativa.detalles.precioEnergia}
                </FilaDetalle>
                <FilaDetalle etiqueta="Precio potencia">
                  {alternativa.detalles.precioPotencia}
                </FilaDetalle>
                <FilaDetalle etiqueta="Tipo de tarifa">
                  {alternativa.detalles.tipoTarifa}
                </FilaDetalle>
                <FilaDetalle etiqueta="Permanencia">
                  {alternativa.detalles.permanencia}
                </FilaDetalle>
                <FilaDetalle etiqueta="Penalización">
                  {alternativa.detalles.penalizacion}
                </FilaDetalle>
              </dl>
            </div>

            <div className="flex flex-col gap-03 border-t border-border-low pt-04">
              <Text variant="label-s-uppercase" as="span">
                Condiciones
              </Text>
              <ul className="flex flex-col gap-02">
                {alternativa.condiciones.map((c) => (
                  <li key={c} className="flex items-start gap-03">
                    <span className="shrink-0 text-highlight-muted">
                      <Icon name="check-circle-outline" />
                    </span>
                    <Text variant="body-m" color="mid" as="span">
                      {c}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Una fila de la ficha: etiqueta en mayúsculas a la izquierda, valor a la
 * derecha — mismo patrón que el resto de fichas del prototipo. */
function FilaDetalle({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-04">
      <dt className="text-label-s tracking-wide text-content-low uppercase">
        {etiqueta}
      </dt>
      <dd className="text-label-m text-content-high">{children}</dd>
    </div>
  );
}
