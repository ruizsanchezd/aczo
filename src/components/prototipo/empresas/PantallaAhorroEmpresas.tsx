"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ahorroComercializadora,
  conMantenimiento,
  conMantenimientoMixto,
  COMERCIALIZADORAS,
  euros,
  gruposPorSociedad,
  PLANES,
  puntosPorTipo,
  SOCIEDADES_ACTIVAS,
  suministrosDe,
  TOTAL_DIRECCIONES,
  TOTAL_PUNTOS,
  type Comercializadora,
  type GrupoSociedad,
  type Plan,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { ModalComparar } from "../ModalComparar";
import { NumeroAnimado } from "../NumeroAnimado";
import { HuecoLogo, LogoComercializadora, tieneLogoComercializadora } from "../TarjetaPlan";

/**
 * PantallaAhorroEmpresas — pantalla "Tu ahorro potencial" del flujo de
 * empresas: aparece al pulsar "Calcular ahorro" en PantallaResultadoEmpresas.
 *
 * Mismo espíritu que PantallaPropuesta (recorrido particular), pero con dos
 * diferencias de fondo, porque aquí se gestionan varias sociedades a la vez:
 *
 *   - El mantenimiento se activa por separado para Luz y para Gas (dos
 *     interruptores, no uno): una empresa puede querer mantenimiento en sus
 *     puntos de luz y no en los de gas, o al revés.
 *   - La tabla de detalle se agrupa por SOCIEDAD dentro de cada
 *     comercializadora (no por dirección): así se lee el ahorro repartido
 *     entre las sociedades que hay que domiciliar y firmar más adelante.
 *
 * ANIMACIONES: la misma cascada de entrada del resto del recorrido (60 ms
 * entre piezas). El desglose por sociedad se despliega con la técnica de
 * rejilla 0fr → 1fr documentada en TablaAhorro.tsx (mismo motivo: no se puede
 * animar "height" hasta un alto que no se conoce).
 */
export function PantallaAhorroEmpresas({
  onAtras,
  onContinuar,
}: {
  onAtras: () => void;
  onContinuar: () => void;
}) {
  const [mensual, setMensual] = useState(false);
  const [mantenimientoLuz, setMantenimientoLuz] = useState(false);
  const [mantenimientoGas, setMantenimientoGas] = useState(false);
  const [comparando, setComparando] = useState<Comercializadora | null>(null);

  const puntosLuz = puntosPorTipo("Luz");
  const puntosGas = puntosPorTipo("Gas");

  return (
    <div className="flex flex-1 flex-col">
      {/* Mismo marco que PantallaSubidaEmpresas/PantallaResultadoEmpresas: la
          página en bg-background-base (a juego con el navbar, blanco) y todo
          el contenido dentro de un marco en bg-background-low. */}
      <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
        <div className="flex w-full flex-col rounded-md bg-background-low">
          <div className="layout-section flex flex-col gap-08 py-09">
            {/* Cabecera: título y selector, los dos centrados uno debajo del
                otro, como en el Figma. */}
            <div className="anim-aparece flex flex-col items-center gap-04" style={retardo(0)}>
              <Text variant="heading-l" className="text-center">
                Tu ahorro potencial
              </Text>
              <SelectorPeriodo mensual={mensual} onChange={setMensual} />
            </div>

            {/* Los tres planes -------------------------------------------- */}
            <div className="grid gap-04 lg:grid-cols-3">
              {PLANES.map((plan, i) => (
                <div key={plan.id} className="anim-aparece" style={retardo(i + 1)}>
                  <TarjetaPlanEmpresa
                    plan={plan}
                    mensual={mensual}
                    mantenimientoLuz={mantenimientoLuz}
                    mantenimientoGas={mantenimientoGas}
                  />
                </div>
              ))}
            </div>

            {/* Resumen, mantenimiento y comercializadoras: una sola tarjeta
                blanca, como en el Figma (no cajas independientes). */}
            <div
              className="anim-aparece flex flex-col gap-08 rounded-md bg-background-base p-06"
              style={retardo(4)}
            >
              <div className="flex flex-wrap items-center justify-between gap-04">
                <Text variant="label-m" color="mid" as="span">
                  {SOCIEDADES_ACTIVAS} {SOCIEDADES_ACTIVAS === 1 ? "Sociedad" : "Sociedades"} ·{" "}
                  {TOTAL_DIRECCIONES} {TOTAL_DIRECCIONES === 1 ? "activo" : "activos"} ·{" "}
                  {TOTAL_PUNTOS} puntos de suministro
                </Text>

                <div className="flex flex-wrap items-center gap-04">
                  <InterruptorMantenimiento
                    etiqueta="Luz"
                    icono="lightbulb"
                    puntos={puntosLuz}
                    activo={mantenimientoLuz}
                    onChange={setMantenimientoLuz}
                  />
                  <Text variant="label-m" color="mid" as="span">
                    ·
                  </Text>
                  <InterruptorMantenimiento
                    etiqueta="Gas"
                    icono="fire"
                    puntos={puntosGas}
                    activo={mantenimientoGas}
                    onChange={setMantenimientoGas}
                  />
                </div>
              </div>

              {/* Cada comercializadora es su propio marco independiente,
                  separado del siguiente por espacio, no por una línea
                  divisoria compartida. */}
              <div className="flex flex-col gap-04">
                {COMERCIALIZADORAS.map((c) => (
                  <FilaComercializadoraEmpresa
                    key={c.id}
                    comercializadora={c}
                    mensual={mensual}
                    mantenimientoLuz={mantenimientoLuz}
                    mantenimientoGas={mantenimientoGas}
                    onComparar={() => setComparando(c)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior: mismo patrón que PantallaFirma.tsx --------------- */}
      <div className="sticky bottom-00 z-10 bg-background-base">
        <div className="layout-section flex items-center justify-between py-04">
          <Button variant="secondary" iconStart="chevron-left" onClick={onAtras}>
            Atrás
          </Button>
          <Button iconEnd="chevron-right" onClick={onContinuar}>
            Hacer el cambio
          </Button>
        </div>
      </div>

      <ModalComparar
        abierto={comparando !== null}
        nombreComercializadora={comparando?.nombre}
        onCerrar={() => setComparando(null)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Piezas de esta pantalla                                                    */
/* -------------------------------------------------------------------------- */

/**
 * El segmentado "Ver ahorro anual / Ver ahorro mensual".
 *
 * Distinto del selector de PantallaPropuesta.tsx (recorrido particular): en
 * el Figma de esta pantalla es una caja con borde, sin fondo deslizante — el
 * segmento activo simplemente cambia a fondo negro (`micro-states`).
 */
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
        { label: "Ver ahorro anual", activo: !mensual, valor: false },
        { label: "Ver ahorro mensual", activo: mensual, valor: true },
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
            seg.activo
              ? "bg-background-high text-content-inverse"
              : "text-content-mid",
          ].join(" ")}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

/** Cada interruptor lleva DOS iconos delante de la etiqueta: la llave
 * (mantenimiento, genérico) y el tipo de suministro (Luz/Gas) — igual que en
 * el Figma, con 2 px de hueco entre los dos. */
function InterruptorMantenimiento({
  icono,
  etiqueta,
  puntos,
  activo,
  onChange,
}: {
  icono: IconName;
  etiqueta: string;
  puntos: number;
  activo: boolean;
  onChange: (activo: boolean) => void;
}) {
  return (
    <span className="flex items-center gap-03">
      <span className="flex items-center gap-[2px] text-content-mid">
        <Icon name="wrench" size={20} />
        <Icon name={icono} size={20} />
      </span>
      <Text variant="label-m" color="mid" as="span">
        Mantenimiento {etiqueta} ({activo ? puntos : 0}/{puntos})
      </Text>
      <Switch
        checked={activo}
        onChange={onChange}
        label={`Añadir mantenimiento a los puntos de ${etiqueta}`}
      />
    </span>
  );
}

/** Una de las tres tarjetas de plan. Mismo diseño que TarjetaPlan.tsx (recorrido
 * particular), pero sin botón: aquí no se elige plan, solo se compara, y el
 * mantenimiento se calcula por tipo (Luz/Gas) en vez de con un único
 * interruptor — por eso no se reutiliza el componente tal cual. */
function TarjetaPlanEmpresa({
  plan,
  mensual,
  mantenimientoLuz,
  mantenimientoGas,
}: {
  plan: Plan;
  mensual: boolean;
  mantenimientoLuz: boolean;
  mantenimientoGas: boolean;
}) {
  const destacada = plan.recomendado;
  const ahorro = conMantenimientoMixto(
    plan.ahorroAnual,
    puntosPorTipo("Luz"),
    puntosPorTipo("Gas"),
    mantenimientoLuz,
    mantenimientoGas,
  );
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <article
      className={[
        "flex h-full flex-col justify-between gap-07 rounded-md p-07",
        destacada ? "bg-highlight-deep" : "bg-background-base",
      ].join(" ")}
    >
      {/* Cabecera + checklist van juntas; "Comercializadoras recomendadas"
          queda como segundo hijo del justify-between, así se pega siempre
          abajo de la tarjeta — a la misma altura en las tres, sin importar
          cuánto ocupe la checklist de cada una. */}
      <div className="flex flex-col gap-07">
        <div className="flex flex-col gap-01">
          <div className="flex items-center justify-between gap-03">
            <Text
              variant="label-s-uppercase"
              color={destacada ? "always-light" : "low"}
              className={destacada ? "opacity-60" : ""}
              as="h3"
            >
              {plan.nombre}
            </Text>
            {destacada && (
              <Tag tone="vivid" icon="zap">
                Recomendado
              </Tag>
            )}
          </div>

          <p
            className={`font-heading text-heading-m ${
              destacada ? "text-content-always-light" : "text-content-high"
            }`}
          >
            <NumeroAnimado value={cifra} /> €/{mensual ? "mes" : "año"}
          </p>
        </div>

        <ul className="flex flex-col gap-02">
          {plan.ventajas.map((v) => (
            <li key={v.texto} className="flex items-start gap-03">
              <span
                className={`shrink-0 ${
                  destacada ? "text-highlight-vivid" : "text-highlight-muted"
                }`}
              >
                <Icon name="check-circle" />
              </span>
              {/* La nota de comparación (p. ej. "+324 €/año vs. plus") no se
                  enseña en esta pantalla: aquí no se elige plan, solo se
                  compara el ahorro, y esa cifra no aporta en ese contexto. */}
              <Text
                variant="body-m"
                color={destacada ? "always-light" : "high"}
                as="span"
              >
                {v.texto}
              </Text>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-03">
        <Text
          variant="body-s"
          color={destacada ? "always-light" : "mid"}
          as="span"
          className={destacada ? "opacity-60" : ""}
        >
          Comercializadoras recomendadas:
        </Text>
        <div className="flex flex-wrap gap-02">
          {plan.comercializadoras.map((nombre) => (
            <HuecoLogo key={nombre} nombre={nombre} sobreOscuro={destacada} />
          ))}
        </div>
      </div>
    </article>
  );
}

/** Panel plegable: rejilla 0fr → 1fr (ver TablaAhorro.tsx para el porqué). Se
 * duplica aquí porque en TablaAhorro.tsx no está exportado. */
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

function FilaComercializadoraEmpresa({
  comercializadora,
  mensual,
  mantenimientoLuz,
  mantenimientoGas,
  onComparar,
}: {
  comercializadora: Comercializadora;
  mensual: boolean;
  mantenimientoLuz: boolean;
  mantenimientoGas: boolean;
  onComparar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);

  const todosSuministros = suministrosDe(comercializadora);
  const puntosLuz = todosSuministros.filter((s) => s.tipo === "Luz").length;
  const puntosGas = todosSuministros.filter((s) => s.tipo === "Gas").length;
  const tiposPresentes = Array.from(new Set(todosSuministros.map((s) => s.tipo)));

  const ahorro = conMantenimientoMixto(
    ahorroComercializadora(comercializadora),
    puntosLuz,
    puntosGas,
    mantenimientoLuz,
    mantenimientoGas,
  );
  const cifra = mensual ? ahorro / 12 : ahorro;
  const grupos = gruposPorSociedad(comercializadora);

  return (
    <article className="overflow-hidden rounded-md border border-border-low bg-background-low">
      <div className="flex flex-wrap items-center gap-04 p-04">
        {tieneLogoComercializadora(comercializadora.nombre) ? (
          <LogoComercializadora
            nombre={comercializadora.nombre}
            className="size-08"
          />
        ) : (
          <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-neutral text-highlight-muted">
            <Icon name="check-circle" />
          </span>
        )}

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-04">
          <Text variant="label-m" as="h3">
            {comercializadora.nombre}
          </Text>
          <span className="flex gap-02">
            {tiposPresentes.map((tipo) => (
              <Tag key={tipo} icon={tipo === "Luz" ? "lightbulb" : "fire"}>
                {tipo}
              </Tag>
            ))}
          </span>
          <Text variant="body-m" color="mid" as="span">
            {todosSuministros.length}{" "}
            {todosSuministros.length === 1 ? "punto" : "puntos"} de suministro
          </Text>
        </span>

        <Button
          variant="secondary"
          size="small"
          iconEnd="compare"
          onClick={onComparar}
          aria-label={`Comparar ofertas de ${comercializadora.nombre}`}
        >
          Comparar
        </Button>

        <span className="flex items-center gap-03">
          {/* Ancho fijo: así el botón de plegar queda en el mismo punto en
              todas las filas, sin importar cuántas cifras tenga el ahorro. */}
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
            onClick={() => setAbierto((a) => !a)}
            aria-expanded={abierto}
            aria-label={`${abierto ? "Cerrar" : "Ver"} el detalle de ${comercializadora.nombre}`}
            className="cursor-pointer rounded-md bg-background-low text-content-mid outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
          >
            <FlechaPlegar abierto={abierto} />
          </button>
        </span>
      </div>

      <Plegable abierto={abierto}>
        <div className="flex flex-col gap-03 px-04 pb-04">
          {grupos.map((grupo) => (
            <GrupoSociedadTabla
              key={grupo.sociedad.id}
              grupo={grupo}
              mantenimientoLuz={mantenimientoLuz}
              mantenimientoGas={mantenimientoGas}
            />
          ))}
        </div>
      </Plegable>
    </article>
  );
}

/** El desglose por sociedad dentro de una comercializadora: columnas
 * SUMINISTRO/TARIFA/TIPO/COSTE ACTUAL/MEJOR ALTERNATIVA/AHORRO ESTIMADO,
 * como en el wireframe del Figma, con los tokens del sistema en vez de sus
 * valores sueltos. */
function GrupoSociedadTabla({
  grupo,
  mantenimientoLuz,
  mantenimientoGas,
}: {
  grupo: GrupoSociedad;
  mantenimientoLuz: boolean;
  mantenimientoGas: boolean;
}) {
  const puntos = grupo.suministros.length;
  const totalAhorro = grupo.suministros.reduce((total, s) => {
    const activo = s.tipo === "Luz" ? mantenimientoLuz : mantenimientoGas;
    return total + conMantenimiento(s.ahorro, 1, activo);
  }, 0);

  return (
    <div className="overflow-hidden rounded-md">
      <div className="flex items-center justify-between gap-04 bg-highlight-neutral px-04 py-03 text-content-always-dark">
        <Text variant="label-m" color="always-dark" as="span" className="min-w-0 truncate">
          {grupo.sociedad.nombre}
        </Text>
        <Text variant="body-m" color="always-dark" as="span" className="shrink-0">
          {puntos} {puntos === 1 ? "punto" : "puntos"} de suministro
        </Text>
      </div>

      <div className="bg-background-base">
        <div className="hidden items-center gap-03 border-b border-border-low px-04 py-02 md:flex">
          <span className="size-05 shrink-0" />
          <span className="grid flex-1 grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.9fr_0.9fr] gap-04 text-label-s tracking-wide text-content-low uppercase">
            <span>Suministro</span>
            <span>Tarifa</span>
            <span>Tipo</span>
            <span>Coste actual</span>
            <span>Mejor alternativa</span>
            <span>Ahorro estimado</span>
          </span>
        </div>

        <ul>
          {grupo.suministros.map((s) => {
            const activo = s.tipo === "Luz" ? mantenimientoLuz : mantenimientoGas;
            const ahorro = conMantenimiento(s.ahorro, 1, activo);
            const mejorAlternativa = s.costeActual - ahorro;

            return (
              <li key={s.id} className="flex items-center gap-03 border-b border-border-low px-04 py-03 last:border-b-00">
                <span className="shrink-0 text-content-mid">
                  <Icon name="check-circle-outline" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-02 md:grid md:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.9fr_0.9fr] md:items-center md:gap-04">
                  <Text variant="body-m" as="span" className="truncate">
                    {s.nombre}
                  </Text>
                  <Text variant="body-m" color="mid" as="span">
                    {s.tarifa}
                  </Text>
                  <span>
                    <Tag icon={s.tipo === "Luz" ? "lightbulb" : "fire"}>{s.tipo}</Tag>
                  </span>
                  <Text variant="body-m" color="mid" as="span">
                    €{euros(s.costeActual)}/año
                  </Text>
                  <Text variant="body-m" color="mid" as="span">
                    €{euros(mejorAlternativa)}/año
                  </Text>
                  <span>
                    <Tag tone="success">€{euros(ahorro)}/año</Tag>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end px-04 py-03">
          <Text variant="label-m" as="span">
            Total €{euros(totalAhorro)}/año
          </Text>
        </div>
      </div>
    </div>
  );
}
