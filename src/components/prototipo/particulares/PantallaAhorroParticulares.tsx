"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  conMantenimientoMixto,
  kwh,
  OFERTAS_PARTICULARES,
  RECOMENDACIONES_PARTICULARES,
  SUMINISTROS_PARTICULARES,
  type OfertaParticular,
  type RecomendacionParticular,
  type Suministro,
} from "@/mocks/aczo";
import { retardo, useVisibleAlDesplazar } from "@/lib/prototipo";
import { NumeroAnimado } from "../NumeroAnimado";
import { HuecoLogo, LogoComercializadora, tieneLogoComercializadora } from "../TarjetaPlan";

/**
 * PantallaAhorroParticulares — pantalla "Ahorro y recomendación" (paso 02)
 * del flujo de particulares. Del Figma "Recomendado para ti"
 * (node 4100:25860 / 4105:31221 — el de "Detalles" abierto en una tarjeta).
 *
 * DIFERENCIAS DE FONDO CON `PantallaAhorroEmpresas.tsx` — no es un calco,
 * el Figma pide otra forma de enseñar los resultados porque aquí hay muy
 * pocos puntos de suministro (los de esta vivienda: uno de luz, uno de gas),
 * no una cartera de sociedades:
 *
 *   - **Tres tarjetas destacadas por MOTIVOS distintos** ("Ahorro Aczo" /
 *     "La más completa" / "La más flexible"), no tres niveles de ahorro como
 *     en empresas. Cada una es una comercializadora distinta, con su propia
 *     lista de ventajas — no cambian según lo que se elija arriba, porque
 *     aquí no hay nada más que combinar.
 *   - **Cada tarjeta lleva su propio interruptor "Condiciones"/"Detalles"**:
 *     Condiciones enseña la lista de ventajas (como en empresas);
 *     Detalles sustituye esa lista por la ficha técnica de los dos puntos de
 *     la vivienda (CUPS, tarifa, consumo, compañía actual — los mismos
 *     campos que `DetalleSuministro` en mocks/aczo.ts). Ese interruptor NO
 *     activa la tarjeta: por eso corta la propagación del clic.
 *   - **Debajo, "Todas las ofertas"**: el resto de compañías, con menos
 *     ahorro y que no siempre cubren los dos puntos (`OfertaParticular.tipos`
 *     dice cuáles). Cada fila se puede desplegar para ver su ficha técnica,
 *     igual patrón de rejilla 0fr → 1fr que el resto del prototipo.
 *   - **Selección única entre las tres tarjetas Y las de "todas las
 *     ofertas"**: es un solo `radiogroup` repartido en dos bloques visuales.
 *     Elegir una tarjeta de arriba desselecciona cualquier oferta de abajo, y
 *     viceversa — nunca hay dos elegidas a la vez.
 *   - **El selector empieza en "Ver ahorro mensual"** (al revés que en
 *     empresas, que empieza en anual) — así lo marca este Figma.
 *   - **El mantenimiento se activa por tipo** (un interruptor para Luz, otro
 *     para Gas — como en empresas, pero con dos interruptores en vez de
 *     "punto por punto" porque solo hay un punto de cada tipo) y descuenta
 *     su cuota de CUALQUIER tarjeta u oferta que cubra ese tipo.
 */

type Eleccion = { tipo: "recomendacion" | "oferta"; id: string };

export function PantallaAhorroParticulares({
  onAtras,
  onContinuar,
}: {
  onAtras: () => void;
  onContinuar?: () => void;
}) {
  const [mensual, setMensual] = useState(true);
  const [mantenimientoLuz, setMantenimientoLuz] = useState(false);
  const [mantenimientoGas, setMantenimientoGas] = useState(true);
  const [eleccion, setEleccion] = useState<Eleccion>(() => {
    const recomendada = RECOMENDACIONES_PARTICULARES.find((r) => r.recomendado);
    return {
      tipo: "recomendacion",
      id: recomendada?.id ?? RECOMENDACIONES_PARTICULARES[0].id,
    };
  });
  const mostrarBarra = useVisibleAlDesplazar();

  const suministroLuz = SUMINISTROS_PARTICULARES.find((s) => s.tipo === "Luz")!;
  const suministroGas = SUMINISTROS_PARTICULARES.find((s) => s.tipo === "Gas")!;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
        <div className="flex w-full flex-col rounded-md bg-background-low">
          <div className="layout-section flex flex-col gap-08 py-09">
            <div className="anim-aparece flex flex-col items-center gap-04" style={retardo(0)}>
              <Text variant="heading-l" className="text-center">
                Recomendado para ti
              </Text>
              <SelectorPeriodo mensual={mensual} onChange={setMensual} />
            </div>

            <div role="radiogroup" aria-label="Elige una recomendación" className="grid gap-04 lg:grid-cols-3">
              {RECOMENDACIONES_PARTICULARES.map((r, i) => (
                <div key={r.id} className="anim-aparece" style={retardo(i + 1)}>
                  <TarjetaRecomendacion
                    recomendacion={r}
                    mensual={mensual}
                    mantenimientoLuz={mantenimientoLuz}
                    mantenimientoGas={mantenimientoGas}
                    seleccionada={eleccion.tipo === "recomendacion" && eleccion.id === r.id}
                    onSeleccionar={() => setEleccion({ tipo: "recomendacion", id: r.id })}
                    suministroLuz={suministroLuz}
                    suministroGas={suministroGas}
                  />
                </div>
              ))}
            </div>

            <div
              className="anim-aparece flex flex-col gap-08 rounded-md bg-background-base p-06"
              style={retardo(4)}
            >
              <div className="flex flex-wrap items-start justify-between gap-04">
                <div className="flex flex-col gap-01">
                  <Text variant="heading-m" as="h2">
                    Todas las ofertas
                  </Text>
                  <Text variant="body-m" color="low">
                    El ahorro que te ofrece cada compañía
                  </Text>
                </div>

                <div className="flex flex-wrap items-center gap-04">
                  <InterruptorMantenimiento
                    etiqueta="Luz"
                    icono="lightbulb"
                    activo={mantenimientoLuz}
                    onCambiar={setMantenimientoLuz}
                  />
                  <Text variant="label-m" color="mid" as="span">
                    ·
                  </Text>
                  <InterruptorMantenimiento
                    etiqueta="Gas"
                    icono="fire"
                    activo={mantenimientoGas}
                    onCambiar={setMantenimientoGas}
                  />
                </div>
              </div>

              <div role="radiogroup" aria-label="Elige otra oferta" className="flex flex-col gap-04">
                {OFERTAS_PARTICULARES.map((o) => (
                  <FilaOferta
                    key={o.id}
                    oferta={o}
                    mensual={mensual}
                    mantenimientoLuz={mantenimientoLuz}
                    mantenimientoGas={mantenimientoGas}
                    seleccionada={eleccion.tipo === "oferta" && eleccion.id === o.id}
                    onSeleccionar={() => setEleccion({ tipo: "oferta", id: o.id })}
                    suministroLuz={suministroLuz}
                    suministroGas={suministroGas}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior: mismo patrón que PantallaAhorroEmpresas.tsx — no
          aparece hasta que se empieza a hacer scroll. */}
      <div
        className={[
          "sticky bottom-00 z-10 bg-background-base transition-opacity motion-micro-appear",
          mostrarBarra ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="layout-section flex items-center justify-between py-04">
          <Button variant="secondary" iconStart="chevron-left" onClick={onAtras}>
            Atrás
          </Button>
          <Button iconEnd="chevron-right" onClick={onContinuar}>
            Hacer el cambio
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Piezas de esta pantalla                                                    */
/* -------------------------------------------------------------------------- */

/** Mismo segmentado que PantallaAhorroEmpresas.tsx (caja con borde, el
 * segmento activo en fondo negro) — se duplica aquí porque no está
 * exportado allí. */
function SelectorPeriodo({
  mensual,
  onChange,
}: {
  mensual: boolean;
  onChange: (mensual: boolean) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Periodo del ahorro"
      className="flex items-center gap-00 rounded-sm border border-border-low p-02"
    >
      {[
        { label: "Ver ahorro mensual", activo: mensual, valor: true },
        { label: "Ver ahorro anual", activo: !mensual, valor: false },
      ].map((seg) => (
        <button
          key={seg.label}
          type="button"
          role="tab"
          aria-selected={seg.activo}
          onClick={() => onChange(seg.valor)}
          className={[
            "cursor-pointer rounded-sm px-04 py-02 text-label-s whitespace-nowrap",
            "transition-colors motion-micro-states",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
            seg.activo ? "bg-background-high text-content-inverse" : "text-content-mid",
          ].join(" ")}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

/** Un interruptor de mantenimiento por tipo (Luz o Gas). A diferencia de
 * empresas (un interruptor de bulto que enciende "todos los puntos de ese
 * tipo"), aquí solo hay UN punto de cada tipo, así que es un interruptor
 * simple — sin contador n/m. */
function InterruptorMantenimiento({
  icono,
  etiqueta,
  activo,
  onCambiar,
}: {
  icono: "lightbulb" | "fire";
  etiqueta: string;
  activo: boolean;
  onCambiar: (activo: boolean) => void;
}) {
  return (
    <span className="flex items-center gap-03">
      <span className="flex items-center gap-[2px] text-content-mid">
        <Icon name="wrench" size={20} />
        <Icon name={icono} size={20} />
      </span>
      <Text variant="label-m" color="mid" as="span">
        Mantenimiento {etiqueta}
      </Text>
      <Switch
        checked={activo}
        onChange={onCambiar}
        label={`Añadir mantenimiento de ${etiqueta}`}
      />
    </span>
  );
}

/** Panel plegable: rejilla 0fr → 1fr (ver TablaAhorro.tsx para el porqué). */
function Plegable({ abierto, children }: { abierto: boolean; children: React.ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows] motion-macro-levelup"
      style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
      aria-hidden={!abierto}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function FlechaPlegar({ abierto }: { abierto: boolean }) {
  return (
    <span
      className={[
        "flex size-07 shrink-0 items-center justify-center rounded-md",
        "transition-transform motion-micro-states",
        abierto ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <Icon name="chevron-down" />
    </span>
  );
}

/** Una de las tres tarjetas de "Recomendado para ti". Toda la tarjeta es la
 * superficie de selección (`role="radio"`); el interruptor
 * Condiciones/Detalles de dentro corta la propagación del clic para no
 * seleccionarla sin querer al usarlo. */
function TarjetaRecomendacion({
  recomendacion,
  mensual,
  mantenimientoLuz,
  mantenimientoGas,
  seleccionada,
  onSeleccionar,
  suministroLuz,
  suministroGas,
}: {
  recomendacion: RecomendacionParticular;
  mensual: boolean;
  mantenimientoLuz: boolean;
  mantenimientoGas: boolean;
  seleccionada: boolean;
  onSeleccionar: () => void;
  suministroLuz: Suministro;
  suministroGas: Suministro;
}) {
  const [vista, setVista] = useState<"condiciones" | "detalles">("condiciones");
  const puntosConMantenimiento = (mantenimientoLuz ? 1 : 0) + (mantenimientoGas ? 1 : 0);
  const ahorro = conMantenimientoMixto(recomendacion.ahorroAnual, puntosConMantenimiento);
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <div
      role="radio"
      aria-checked={seleccionada}
      aria-label={`Elegir ${recomendacion.categoria}`}
      tabIndex={0}
      onClick={onSeleccionar}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSeleccionar();
        }
      }}
      className={[
        "flex h-full w-full cursor-pointer flex-col gap-07 rounded-md p-07 text-left",
        "outline-none transition-colors motion-micro-states",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        seleccionada ? "bg-highlight-deep" : "bg-background-base hover:bg-background-low",
      ].join(" ")}
    >
      <div className="flex flex-col gap-01">
        <div className="flex items-center justify-between gap-03">
          <Text
            variant="label-s-uppercase"
            color={seleccionada ? "always-light" : "low"}
            className={seleccionada ? "opacity-60" : ""}
            as="h3"
          >
            {recomendacion.categoria}
          </Text>
          {recomendacion.recomendado && (
            <Tag tone="vivid" icon="zap">
              Recomendado
            </Tag>
          )}
        </div>
        <p
          className={`font-heading text-heading-m ${
            seleccionada ? "text-content-always-light" : "text-content-high"
          }`}
        >
          <NumeroAnimado value={cifra} /> €/{mensual ? "mes" : "año"}
        </p>
      </div>

      <div className="flex flex-col gap-02">
        <Text
          variant="body-s"
          color={seleccionada ? "always-light" : "mid"}
          as="span"
          className={seleccionada ? "opacity-60" : ""}
        >
          Comercializadoras recomendadas:
        </Text>
        <HuecoLogo nombre={recomendacion.comercializadora} sobreOscuro={seleccionada} />
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <SelectorVista vista={vista} onChange={setVista} oscuro={seleccionada} />
      </div>

      {vista === "condiciones" ? (
        <ul className="flex flex-col gap-02">
          {recomendacion.ventajas.map((v) => (
            <li key={v} className="flex items-start gap-03">
              <span className={seleccionada ? "text-highlight-vivid" : "text-highlight-muted"}>
                <Icon name="check-circle" />
              </span>
              <Text
                variant="body-m"
                color={seleccionada ? "always-light" : "high"}
                as="span"
              >
                {v}
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-04" onClick={(e) => e.stopPropagation()}>
          <FichaTecnica suministro={suministroLuz} oscuro={seleccionada} />
          <div className={seleccionada ? "h-[1px] w-full bg-white/10" : "h-[1px] w-full bg-border-low"} />
          <FichaTecnica suministro={suministroGas} oscuro={seleccionada} />
        </div>
      )}
    </div>
  );
}

/** El segmentado "Condiciones"/"Detalles" de cada tarjeta. Independiente por
 * tarjeta (cada una guarda su propia vista) y no afecta a la selección. */
function SelectorVista({
  vista,
  onChange,
  oscuro,
}: {
  vista: "condiciones" | "detalles";
  onChange: (vista: "condiciones" | "detalles") => void;
  oscuro: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Condiciones o detalles técnicos"
      className={[
        "flex items-center gap-01 self-start rounded-sm border p-01",
        oscuro ? "border-white/20" : "border-border-low bg-background-low",
      ].join(" ")}
    >
      {(
        [
          { id: "condiciones" as const, etiqueta: "Condiciones" },
          { id: "detalles" as const, etiqueta: "Detalles" },
        ]
      ).map((seg) => {
        const activo = vista === seg.id;
        return (
          <button
            key={seg.id}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(seg.id)}
            className={[
              "cursor-pointer rounded-sm px-03 py-01 text-body-s whitespace-nowrap",
              "transition-colors motion-micro-states",
              activo
                ? "bg-highlight-deep text-content-always-light"
                : oscuro
                  ? "text-content-always-light opacity-60"
                  : "text-content-low",
            ].join(" ")}
          >
            {seg.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

/** La ficha técnica de un punto (Luz o Gas): los mismos campos que
 * `DetalleSuministro` en mocks/aczo.ts, recortados a lo esencial para que
 * quepa dentro de una tarjeta de recomendación (sin el perfil de consumo ni
 * la permanencia, que ya se explican en la pantalla de resultado). */
function FichaTecnica({ suministro, oscuro }: { suministro: Suministro; oscuro: boolean }) {
  const { detalle } = suministro;

  return (
    <div className="flex flex-col gap-03">
      <Text
        variant="label-s-uppercase"
        color={oscuro ? "always-light" : "mid"}
        className={oscuro ? "opacity-60" : ""}
        as="span"
      >
        Punto de {suministro.tipo === "Luz" ? "luz" : "gas"}
      </Text>
      <FilaDato etiqueta="CUPS" oscuro={oscuro}>
        {detalle.cups}
      </FilaDato>
      <FilaDato etiqueta="Tarifa contratada" oscuro={oscuro}>
        {suministro.tarifa} ({suministro.tipo})
      </FilaDato>
      <FilaDato etiqueta="Consumo anual" oscuro={oscuro}>
        {kwh(detalle.consumoAnual)} kWh/año
      </FilaDato>
      <FilaDato etiqueta="Compañía actual" oscuro={oscuro}>
        {detalle.companiaActual}
      </FilaDato>
    </div>
  );
}

function FilaDato({
  etiqueta,
  oscuro,
  children,
}: {
  etiqueta: string;
  oscuro: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-04">
      <span
        className={`text-label-s tracking-wide uppercase ${
          oscuro ? "text-content-always-light opacity-60" : "text-content-mid"
        }`}
      >
        {etiqueta}
      </span>
      <span className={`text-body-m ${oscuro ? "text-content-always-light" : "text-content-high"}`}>
        {children}
      </span>
    </div>
  );
}

/** Una fila de "Todas las ofertas". Se puede elegir (comparte radiogroup con
 * las tres tarjetas de arriba) y se puede desplegar para ver su ficha
 * técnica — las dos cosas son independientes: desplegar no elige. */
function FilaOferta({
  oferta,
  mensual,
  mantenimientoLuz,
  mantenimientoGas,
  seleccionada,
  onSeleccionar,
  suministroLuz,
  suministroGas,
}: {
  oferta: OfertaParticular;
  mensual: boolean;
  mantenimientoLuz: boolean;
  mantenimientoGas: boolean;
  seleccionada: boolean;
  onSeleccionar: () => void;
  suministroLuz: Suministro;
  suministroGas: Suministro;
}) {
  const [abierto, setAbierto] = useState(false);

  // El mantenimiento solo descuenta de los tipos que esta oferta cubre.
  const puntosConMantenimiento = oferta.tipos.filter((t) =>
    t === "Luz" ? mantenimientoLuz : mantenimientoGas,
  ).length;
  const ahorro = conMantenimientoMixto(oferta.ahorroAnual, puntosConMantenimiento);
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <div
      className={[
        "overflow-hidden rounded-md border transition-colors motion-micro-states",
        seleccionada ? "border-highlight-muted bg-highlight-soft" : "border-border-low bg-background-low",
      ].join(" ")}
    >
      <div
        role="radio"
        aria-checked={seleccionada}
        aria-label={`Elegir la oferta de ${oferta.comercializadora}`}
        tabIndex={0}
        onClick={onSeleccionar}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSeleccionar();
          }
        }}
        className="flex w-full cursor-pointer flex-wrap items-center gap-04 p-04 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-info-high"
      >
        {tieneLogoComercializadora(oferta.comercializadora) ? (
          <LogoComercializadora nombre={oferta.comercializadora} className="size-08" />
        ) : (
          <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-neutral text-highlight-muted">
            <Icon name="check-circle" />
          </span>
        )}

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-04">
          <Text variant="label-m" as="span">
            {oferta.comercializadora}
          </Text>
          <span className="flex gap-02">
            {oferta.tipos.map((tipo) => (
              <Tag key={tipo} icon={tipo === "Luz" ? "lightbulb" : "fire"}>
                {tipo}
              </Tag>
            ))}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-03">
          <span className="flex w-[150px] shrink-0 flex-col items-end">
            <Text variant="label-s" color="low" as="span">
              Ahorro potencial
            </Text>
            <span className="font-heading text-heading-s whitespace-nowrap text-content-high">
              +<NumeroAnimado value={cifra} /> €/{mensual ? "mes" : "año"}
            </span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAbierto((a) => !a);
            }}
            aria-expanded={abierto}
            aria-label={`${abierto ? "Cerrar" : "Ver"} el detalle de ${oferta.comercializadora}`}
            className="cursor-pointer rounded-md bg-background-base text-content-mid outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
          >
            <FlechaPlegar abierto={abierto} />
          </button>
        </span>
      </div>

      <Plegable abierto={abierto}>
        <div className="flex flex-col gap-04 border-t border-border-low bg-background-base px-04 pb-04 pt-04">
          {oferta.tipos.includes("Luz") && <FichaTecnica suministro={suministroLuz} oscuro={false} />}
          {oferta.tipos.includes("Gas") && <FichaTecnica suministro={suministroGas} oscuro={false} />}
        </div>
      </Plegable>
    </div>
  );
}
