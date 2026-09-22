"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  AHORRO_EXTRA_DASHBOARD,
  euros,
  MES_COMPARACION_DASHBOARD,
  suministrosDe,
  type Comercializadora,
  type Plan,
  type Suministro,
} from "@/mocks/aczo";
import { DetalleTecnicoSuministro } from "../DetalleTecnicoSuministro";
import { HuecoLogo, LogoComercializadora, tieneLogoComercializadora } from "../TarjetaPlan";

/**
 * PiezasAreaCliente — piezas pequeñas que comparte más de una pantalla del
 * área de cliente (Dashboard, "Mi cartera" y "Consumo y ahorro"), más el
 * patrón "Tu ahorro potencial" que comparten los dos asistentes que comparan
 * ofertas (`NuevoSuministroCliente.tsx` y `AhorroDetectadoCliente.tsx`).
 * Viven aparte para no duplicarlas entre pantallas.
 */

/**
 * BannerAhorroExtra — "Hemos detectado una oportunidad de ahorro extra"
 * (Figma nodo 878:13973): la misma banda, en las tres pantallas donde
 * aparece (Dashboard, Mi cartera, Consumo y ahorro), justo debajo de la
 * cabecera. Es una superficie oscura fija (`highlight-deep`, igual que la
 * barra lateral), así que el texto va con los `content-always-*` en vez de
 * `content-high`/`content-mid` — si no, se volvería invisible el día que se
 * active el modo oscuro (ver CLAUDE.md, "superficie oscura").
 *
 * "Ver ahorro" abre el asistente `AhorroDetectadoCliente` (otra sección más
 * del `seccion` state de `AreaCliente2.tsx`, ver `onVerAhorro`).
 */
export function BannerAhorroExtra({ onVerAhorro }: { onVerAhorro?: () => void }) {
  return (
    <div className="mt-06 flex flex-wrap items-start gap-03 rounded-md bg-highlight-deep px-04 py-03">
      <Icon
        name="piggy-bank"
        className="mt-[2px] shrink-0 text-highlight-vivid"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-01">
        {/* `font-bold` a pelo: el Figma de este aviso concreto (nodo
            878:13973) pone esta línea en negrita de verdad (peso 700), y
            ningún variant de Text la trae — body-m es peso 400 siempre. No
            hay una utilidad de peso en el sistema para esto todavía. El
            tamaño SÍ es el de `body-m` (14/20), no `label-s` (12/16): las dos
            líneas del aviso miden igual en el Figma, la de arriba solo
            cambia en el peso. */}
        <p>
          <Text
            variant="body-m"
            as="span"
            color="always-light"
            className="font-bold"
          >
            Hemos detectado una oportunidad de ahorro extra.
          </Text>{" "}
          <Text
            variant="body-m"
            as="span"
            className="font-bold text-highlight-vivid"
          >
            Oferta válida durante 48h.
          </Text>
        </p>
        <Text variant="body-m" as="p" color="always-light">
          Podrías ahorrar {euros(AHORRO_EXTRA_DASHBOARD)} € extra al año
          cambiando de comercializadora.
        </Text>
      </div>
      <Button variant="primary" feedback="highlight" size="small" onClick={onVerAhorro}>
        Ver ahorro
      </Button>
    </div>
  );
}

/**
 * ValorConUnidad — el número grande de una tarjeta seguido de su unidad
 * ("8.300 €/año", "7.234 €"). Son DOS tipografías, no una: el número va en
 * la de marca (`heading-m`, 24 px) y la unidad en una etiqueta gris pequeña
 * al lado (`label-s`/`content-low`) — igual que "84 % completado" en el
 * panel de Cartera del Dashboard. Por eso no es un único `<Text>` con las
 * dos palabras dentro.
 */
export function ValorConUnidad({
  valor,
  unidad,
}: {
  valor: string;
  unidad: string;
}) {
  return (
    <p className="flex items-baseline gap-01">
      <Text variant="heading-m" as="span">
        {valor}
      </Text>
      <Text variant="label-s" color="low" as="span">
        {unidad}
      </Text>
    </p>
  );
}

/**
 * Tendencia — la línea "- 6% vs julio 2025" bajo un coste o un consumo. El
 * signo decide el color: bajar de coste (o de consumo) es la buena noticia
 * (`success-high`) y subir es la que conviene mirar (`warning-high`) — no
 * "positivo o negativo" en abstracto, que aquí significaría lo contrario de
 * lo que se lee a simple vista.
 */
export function Tendencia({ variacion }: { variacion: number }) {
  const sube = variacion > 0;
  return (
    <Text
      variant="label-s"
      as="p"
      className={sube ? "text-warning-high" : "text-success-high"}
    >
      {sube ? "+" : "-"} {Math.abs(variacion)}% vs {MES_COMPARACION_DASHBOARD}
    </Text>
  );
}

/**
 * SelectorCompacto — el desplegable sencillo de una barra de filtros
 * ("Sociedades", "Luz y Gas"...). No es el `Select` del sistema
 * (`ui/Input.tsx`): ese es un campo de formulario de 40 px con etiqueta, y
 * este es un filtro de barra de herramientas de 32 px, como el de la Figma
 * (nodos 797:6195/6197 en el Dashboard y 797:44769 en "Documentos"): mismo
 * radio y tipografía que el resto de campos, pero más bajo y sin etiqueta
 * encima. El propio botón enseña la opción elegida, así que no hace falta un
 * rótulo aparte.
 */
export function SelectorCompacto({
  etiqueta,
  valor,
  onChange,
  opciones,
  ancho = "w-[180px]",
}: {
  /** Nombre accesible del campo, para quien use lector de pantalla. */
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  opciones: readonly { value: string; label: string }[];
  /** Clase de ancho de Tailwind. Cada pantalla trae sus propias medidas. */
  ancho?: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={etiqueta}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={`h-07 ${ancho} cursor-pointer appearance-none rounded-md border border-border-low bg-background-base px-03 text-body-s text-content-mid outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high`}
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-03 -translate-y-1/2 text-content-mid">
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* "Tu ahorro potencial" — compartido por NuevoSuministroCliente y            */
/* AhorroDetectadoCliente (ver PasoAhorro en cada uno).                       */
/* -------------------------------------------------------------------------- */

/** El selector "Ver ahorro anual" / "Ver ahorro mensual" de la cabecera de
 * "Tu ahorro potencial". */
export function SelectorPeriodoAhorro({
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
            seg.activo ? "bg-background-high text-content-inverse" : "text-content-mid",
          ].join(" ")}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

/** La tarjeta de una oferta ("Ahorro Aczo" / "Ahorro Confort"), con su cifra
 * grande, sus logos y el botón de seleccionarla. */
export function TarjetaOfertaAhorro({
  plan,
  mensual,
  ahorroBase,
  seleccionada,
  onSeleccionar,
}: {
  plan: Plan;
  mensual: boolean;
  /** Suma del ahorro de las comercializadoras de esta oferta — se enseña tal
   * cual, sin restar nada más: tiene que coincidir exactamente con la fila de
   * "Ahorro potencial" de cada comercializadora al desplegar la oferta, que
   * tampoco lo resta (ver `FilaComercializadoraAhorro`). */
  ahorroBase: number;
  seleccionada: boolean;
  onSeleccionar: () => void;
}) {
  const cifra = mensual ? ahorroBase / 12 : ahorroBase;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      aria-label={`Elegir ${plan.nombre}`}
      onClick={onSeleccionar}
      className={[
        "flex h-full w-full flex-col justify-between gap-06 rounded-md p-07 text-left",
        "cursor-pointer outline-none transition-colors motion-micro-states",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        seleccionada ? "bg-highlight-deep" : "bg-background-base hover:bg-background-mid",
      ].join(" ")}
    >
      <div className="flex flex-col gap-04">
        <Text
          variant="label-s-uppercase"
          color={seleccionada ? "always-light" : "low"}
          className={seleccionada ? "opacity-60" : ""}
          as="h3"
        >
          {plan.nombre === "Ahorro Aczo" ? "Ahorro Aczo" : "Ahorro Confort"}
        </Text>

        <p
          className={`font-heading text-heading-m ${
            seleccionada ? "text-content-always-light" : "text-content-high"
          }`}
        >
          {euros(cifra)} €/{mensual ? "mes" : "año"}
        </p>

        {plan.recomendado ? (
          <Tag tone="vivid" icon="zap" className="w-fit">
            Recomendado
          </Tag>
        ) : (
          <Text variant="label-m" color={seleccionada ? "always-light" : "high"} as="span">
            Máxima simplicidad en la gestión
          </Text>
        )}

        <Text
          variant="body-m"
          color={seleccionada ? "always-light" : "mid"}
          as="span"
        >
          {plan.ventajas[0]?.texto}
        </Text>
      </div>

      <div className="flex flex-col gap-03">
        <Text
          variant="body-s"
          color={seleccionada ? "always-light" : "mid"}
          as="span"
          className={seleccionada ? "opacity-60" : ""}
        >
          Comercializadoras seleccionadas:
        </Text>
        <div className="flex flex-wrap gap-02">
          {plan.comercializadoras.map((nombre) => (
            <HuecoLogo key={nombre} nombre={nombre} sobreOscuro={seleccionada} />
          ))}
        </div>
      </div>

      <span
        className={[
          "flex items-center justify-center rounded-md py-03 text-label-m",
          "transition-colors motion-micro-states",
          seleccionada
            ? "bg-background-state-disabled text-content-state-disabled"
            : "bg-background-high text-content-inverse",
        ].join(" ")}
      >
        {seleccionada ? "Oferta seleccionada" : "Seleccionar oferta"}
      </span>
    </button>
  );
}

/** El interruptor "Mantenimiento Luz (2/3)" / "Mantenimiento Gas (1/1)" que
 * activa/desactiva el mantenimiento de todos los puntos de un tipo a la vez. */
export function InterruptorMantenimientoAhorro({
  icono,
  etiqueta,
  ids,
  mantenimientoIds,
  onCambiarTodos,
}: {
  icono: "lightbulb" | "fire";
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

/** La flecha que gira 180º al desplegar una fila — comercializadora o punto
 * de suministro. */
export function FlechaPlegar({ abierto }: { abierto: boolean }) {
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

/** La fila de una comercializadora dentro de "Tu ahorro potencial", con su
 * cifra de ahorro y la lista de puntos de suministro al desplegarla. */
export function FilaComercializadoraAhorro({
  comercializadora,
  mensual,
  mantenimientoIds,
  onCambiarMantenimiento,
}: {
  comercializadora: Comercializadora;
  mensual: boolean;
  mantenimientoIds: Set<string>;
  onCambiarMantenimiento: (id: string, activo: boolean) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const todosSuministros = suministrosDe(comercializadora);
  const tiposPresentes = Array.from(new Set(todosSuministros.map((s) => s.tipo)));
  const ahorro = todosSuministros.reduce((total, s) => total + s.ahorro, 0);
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <article className="overflow-hidden rounded-md border border-border-low bg-background-base">
      <div className="flex flex-wrap items-center gap-04 p-04">
        {tieneLogoComercializadora(comercializadora.nombre) ? (
          <LogoComercializadora nombre={comercializadora.nombre} className="size-08" />
        ) : (
          <HuecoLogo nombre={comercializadora.nombre} />
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

        {/* Botón visual, como el resto del prototipo (ver "Ver desglose" en
            PantallaCambioCompaniaEmpresas.tsx): no abre nada, deja el gesto
            del Figma a la vista sin construir un panel de comparación nuevo
            solo para estos asistentes — ya existe uno completo en
            PanelCompararEmpresas.tsx para cuando haga falta cablearlo. */}
        <Button variant="secondary" size="small" iconEnd="compare">
          Comparar comercializadoras
        </Button>

        <span className="flex items-center gap-03">
          <span className="flex w-[150px] shrink-0 flex-col items-end">
            <Text variant="label-s" color="low" as="span">
              Ahorro potencial
            </Text>
            <span className="font-heading text-heading-s whitespace-nowrap text-content-high">
              {euros(cifra)} €/{mensual ? "mes" : "año"}
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

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
        aria-hidden={!abierto}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col px-04 pb-04">
            {todosSuministros.map((s) => (
              <FilaPuntoSuministroAhorro
                key={s.id}
                suministro={s}
                activo={mantenimientoIds.has(s.id)}
                onCambiarMantenimiento={(activo) => onCambiarMantenimiento(s.id, activo)}
              />
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/** Una fila de punto de suministro dentro de una comercializadora
 * desplegada, con su ficha técnica al volver a desplegarla. */
export function FilaPuntoSuministroAhorro({
  suministro,
  activo,
  onCambiarMantenimiento,
}: {
  suministro: Suministro;
  activo: boolean;
  onCambiarMantenimiento: (activo: boolean) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <li className="border-b border-border-low last:border-b-00">
      <div className="flex items-center gap-03 py-04">
        <span className="flex min-w-0 flex-1 flex-col gap-02 md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center md:gap-04">
          <Text variant="label-m" as="span" className="truncate">
            {suministro.nombre}
          </Text>
          <span>
            <Tag icon={suministro.tipo === "Luz" ? "lightbulb" : "fire"}>
              {suministro.tipo}
            </Tag>
          </span>
          <span>
            <Tag tone="success">€{euros(suministro.ahorro)}/año</Tag>
          </span>
          <span className="flex items-center gap-02">
            <span className="text-content-mid">
              <Icon name="wrench" size={20} />
            </span>
            <Switch
              checked={activo}
              onChange={onCambiarMantenimiento}
              label={`Añadir mantenimiento en ${suministro.nombre}`}
            />
          </span>
        </span>

        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label={`${abierto ? "Cerrar" : "Ver"} el detalle de ${suministro.nombre}`}
          className="shrink-0 cursor-pointer rounded-md text-content-mid outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high active:opacity-30"
        >
          <FlechaPlegar abierto={abierto} />
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
        aria-hidden={!abierto}
      >
        <div className="overflow-hidden">
          <DetalleTecnicoSuministro suministro={suministro} />
        </div>
      </div>
    </li>
  );
}
