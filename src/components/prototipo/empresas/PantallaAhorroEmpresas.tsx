"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  conMantenimiento,
  conMantenimientoMixto,
  COMERCIALIZADORAS,
  euros,
  sociedadDe,
  suministrosDe,
  PLANES,
  SOCIEDADES_ACTIVAS,
  TOTAL_DIRECCIONES,
  TOTAL_PUNTOS,
  type Comercializadora,
  type DireccionSuministros,
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
 *   - El mantenimiento se activa PUNTO POR PUNTO (un interruptor por fila),
 *     no con un único interruptor por tipo. Los interruptores "Mantenimiento
 *     Luz/Gas" de arriba son de bulto: encienden o apagan a la vez todos los
 *     puntos de ese tipo, y su contador (n/m) refleja cuántos están activos.
 *   - Cada fila tiene además una casilla: al desmarcarla, ese punto sale del
 *     cálculo de ahorro (de su ubicación, de su comercializadora y de las
 *     tres tarjetas de plan) como si no existiera. Los puntos por
 *     suministro que se enseñan en las cabeceras no cambian: son un dato de
 *     inventario, no del cálculo.
 *   - La tabla de detalle se agrupa por UBICACIÓN (cada dirección de
 *     `mocks/aczo.ts` ya es una ubicación) en vez de por sociedad; el CIF de
 *     la sociedad a la que pertenece se enseña en la cabecera de su grupo.
 *
 * ANIMACIONES: la misma cascada de entrada del resto del recorrido (60 ms
 * entre piezas). El desglose por ubicación se despliega con la técnica de
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
  // Ids de los puntos de suministro con mantenimiento activado.
  const [mantenimientoIds, setMantenimientoIds] = useState<Set<string>>(
    new Set(),
  );
  // Ids de los puntos que se han desmarcado: no cuentan en el ahorro.
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set());
  const [comparando, setComparando] = useState<Comercializadora | null>(null);

  const todosLosSuministros = COMERCIALIZADORAS.flatMap(suministrosDe);
  const idsLuz = todosLosSuministros
    .filter((s) => s.tipo === "Luz")
    .map((s) => s.id);
  const idsGas = todosLosSuministros
    .filter((s) => s.tipo === "Gas")
    .map((s) => s.id);
  const puntosConMantenimiento = todosLosSuministros.filter(
    (s) => mantenimientoIds.has(s.id) && !excluidos.has(s.id),
  ).length;

  function alCambiarMantenimiento(id: string, activo: boolean) {
    setMantenimientoIds((prev) => {
      const next = new Set(prev);
      if (activo) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function alCambiarMantenimientoEnBloque(ids: string[], activo: boolean) {
    setMantenimientoIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (activo ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  function alCambiarIncluido(id: string, incluido: boolean) {
    setExcluidos((prev) => {
      const next = new Set(prev);
      if (incluido) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
                    puntosConMantenimiento={puntosConMantenimiento}
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
                    ids={idsLuz}
                    mantenimientoIds={mantenimientoIds}
                    onCambiarTodos={(activo) =>
                      alCambiarMantenimientoEnBloque(idsLuz, activo)
                    }
                  />
                  <Text variant="label-m" color="mid" as="span">
                    ·
                  </Text>
                  <InterruptorMantenimiento
                    etiqueta="Gas"
                    icono="fire"
                    ids={idsGas}
                    mantenimientoIds={mantenimientoIds}
                    onCambiarTodos={(activo) =>
                      alCambiarMantenimientoEnBloque(idsGas, activo)
                    }
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
                    mantenimientoIds={mantenimientoIds}
                    excluidos={excluidos}
                    onCambiarMantenimiento={alCambiarMantenimiento}
                    onCambiarIncluido={alCambiarIncluido}
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

/**
 * Interruptor de bulto: enciende o apaga a la vez el mantenimiento de TODOS
 * los puntos de un tipo (Luz o Gas). El contador (n/m) cuenta cuántos de esos
 * puntos lo tienen activo ahora mismo — cada fila de la tabla puede llevar la
 * cuenta a un valor intermedio, y por eso el interruptor no siempre está del
 * todo encendido o del todo apagado.
 *
 * Lleva DOS iconos delante de la etiqueta: la llave (mantenimiento, genérico)
 * y el tipo de suministro (Luz/Gas) — igual que en el Figma, con 2 px de
 * hueco entre los dos.
 */
function InterruptorMantenimiento({
  icono,
  etiqueta,
  ids,
  mantenimientoIds,
  onCambiarTodos,
}: {
  icono: IconName;
  etiqueta: string;
  ids: string[];
  mantenimientoIds: Set<string>;
  onCambiarTodos: (activo: boolean) => void;
}) {
  const total = ids.length;
  const activos = ids.filter((id) => mantenimientoIds.has(id)).length;

  return (
    <span className="flex items-center gap-03">
      <span className="flex items-center gap-[2px] text-content-mid">
        <Icon name="wrench" size={20} />
        <Icon name={icono} size={20} />
      </span>
      <Text variant="label-m" color="mid" as="span">
        Mantenimiento {etiqueta} ({activos}/{total})
      </Text>
      <Switch
        checked={total > 0 && activos === total}
        onChange={onCambiarTodos}
        label={`Añadir mantenimiento a todos los puntos de ${etiqueta}`}
      />
    </span>
  );
}

/** Una de las tres tarjetas de plan. Mismo diseño que TarjetaPlan.tsx (recorrido
 * particular), pero sin botón: aquí no se elige plan, solo se compara. */
function TarjetaPlanEmpresa({
  plan,
  mensual,
  puntosConMantenimiento,
}: {
  plan: Plan;
  mensual: boolean;
  puntosConMantenimiento: number;
}) {
  const destacada = plan.recomendado;
  const ahorro = conMantenimientoMixto(plan.ahorroAnual, puntosConMantenimiento);
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
  mantenimientoIds,
  excluidos,
  onCambiarMantenimiento,
  onCambiarIncluido,
  onComparar,
}: {
  comercializadora: Comercializadora;
  mensual: boolean;
  mantenimientoIds: Set<string>;
  excluidos: Set<string>;
  onCambiarMantenimiento: (id: string, activo: boolean) => void;
  onCambiarIncluido: (id: string, incluido: boolean) => void;
  onComparar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);

  const todosSuministros = suministrosDe(comercializadora);
  const tiposPresentes = Array.from(new Set(todosSuministros.map((s) => s.tipo)));

  const ahorro = todosSuministros
    .filter((s) => !excluidos.has(s.id))
    .reduce(
      (total, s) => total + conMantenimiento(s.ahorro, 1, mantenimientoIds.has(s.id)),
      0,
    );
  const cifra = mensual ? ahorro / 12 : ahorro;

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
        <div className="flex flex-col gap-04 px-04 pb-04">
          {comercializadora.direcciones.map((direccion) => (
            <GrupoDireccionTabla
              key={direccion.id}
              direccion={direccion}
              mantenimientoIds={mantenimientoIds}
              excluidos={excluidos}
              onCambiarMantenimiento={onCambiarMantenimiento}
              onCambiarIncluido={onCambiarIncluido}
            />
          ))}
        </div>
      </Plegable>
    </article>
  );
}

/**
 * El desglose por UBICACIÓN dentro de una comercializadora: columnas Punto de
 * suministro (con su casilla), Tipo de suministro, Coste actual, Ahorro
 * potencial y Mantenimiento (con su interruptor por fila) — como en el
 * Figma. El CIF que se enseña en la cabecera es el de la sociedad a la que
 * pertenece esta dirección (`sociedadDe`, en mocks/aczo.ts).
 *
 * Se pliega igual que la comercializadora que la contiene (misma técnica de
 * rejilla 0fr → 1fr), pero empieza ABIERTA: en el Figma las ubicaciones ya
 * se ven desplegadas en cuanto se abre la comercializadora.
 */
function GrupoDireccionTabla({
  direccion,
  mantenimientoIds,
  excluidos,
  onCambiarMantenimiento,
  onCambiarIncluido,
}: {
  direccion: DireccionSuministros;
  mantenimientoIds: Set<string>;
  excluidos: Set<string>;
  onCambiarMantenimiento: (id: string, activo: boolean) => void;
  onCambiarIncluido: (id: string, incluido: boolean) => void;
}) {
  const [abierto, setAbierto] = useState(true);
  const sociedad = sociedadDe(direccion);
  const puntos = direccion.suministros.length;

  return (
    <div className="overflow-hidden rounded-md border border-border-low">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="flex w-full items-center gap-04 bg-highlight-soft p-03 text-left text-content-high outline-none transition-opacity motion-micro-states hover:opacity-80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-info-high"
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-04">
          <span className="flex min-w-0 flex-wrap items-center gap-02">
            <Text variant="label-m" as="span" className="truncate">
              {direccion.direccion}
            </Text>
          </span>
          <Text variant="body-m" color="mid" as="span" className="shrink-0 whitespace-nowrap">
            CIF {sociedad.cif} · {puntos} {puntos === 1 ? "punto" : "puntos"} de suministro
          </Text>
        </span>
        <FlechaPlegar abierto={abierto} />
      </button>

      <Plegable abierto={abierto}>
        <div className="bg-background-base">
          <div className="hidden items-center gap-03 border-b border-border-low px-03 py-02 md:flex">
            <span className="size-04 shrink-0" />
            <span className="grid flex-1 grid-cols-[2fr_1.5fr_1.2fr_1.2fr_1fr] gap-04 text-label-s text-content-mid">
              <span>Punto de suministro</span>
              <span>Tipo de suministro</span>
              <span>Coste actual</span>
              <span>Ahorro potencial</span>
              <span className="flex items-center gap-01">
                Mantenimiento
                <span
                  className="text-content-mid"
                  title="El mantenimiento cuesta una cuota fija por punto y se descuenta del ahorro estimado."
                >
                  <Icon name="info" size={14} />
                </span>
              </span>
            </span>
          </div>

          <ul>
            {direccion.suministros.map((s) => {
              const incluido = !excluidos.has(s.id);
              const activo = mantenimientoIds.has(s.id);
              const ahorro = incluido ? conMantenimiento(s.ahorro, 1, activo) : 0;

              return (
                <li
                  key={s.id}
                  className="flex items-center gap-03 border-b border-border-low px-03 py-04 last:border-b-00"
                >
                  <Checkbox
                    checked={incluido}
                    onChange={(checked) => onCambiarIncluido(s.id, checked)}
                    className="shrink-0"
                  />
                  <span
                    className={[
                      "flex min-w-0 flex-1 flex-col gap-02 md:grid md:grid-cols-[2fr_1.5fr_1.2fr_1.2fr_1fr] md:items-center md:gap-04",
                      incluido ? "" : "opacity-40",
                    ].join(" ")}
                  >
                    <Text variant="label-m" as="span" className="truncate">
                      {s.nombre}
                    </Text>
                    <span>
                      <Tag icon={s.tipo === "Luz" ? "lightbulb" : "fire"}>{s.tipo}</Tag>
                    </span>
                    <Text variant="body-m" color="mid" as="span">
                      €{euros(s.costeActual)}/año
                    </Text>
                    <span>
                      <Tag tone="success">€{euros(ahorro)}/año</Tag>
                    </span>
                    <span className="flex items-center gap-02">
                      <span className="text-content-mid">
                        <Icon name="wrench" size={20} />
                      </span>
                      <Switch
                        checked={activo}
                        disabled={!incluido}
                        onChange={(checked) => onCambiarMantenimiento(s.id, checked)}
                        label={`Añadir mantenimiento en ${s.nombre}`}
                      />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Plegable>
    </div>
  );
}
