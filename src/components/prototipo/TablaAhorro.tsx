"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ahorroComercializadora,
  ahorroDireccion,
  conMantenimiento,
  euros,
  kwh,
  numSuministros,
  type Comercializadora,
  type DireccionSuministros,
  type Suministro,
} from "@/mocks/aczo";
import { NumeroAnimado } from "./NumeroAnimado";

/**
 * TablaAhorro — el detalle por comercializadora de la pantalla de recomendación.
 *
 * Tiene CUATRO niveles de profundidad, cada uno plegable por su cuenta:
 *
 *   1. Comercializadora   TotalEnergies · Repsol
 *   2. Dirección          "Calle Velázquez nº 10…" · 10 puntos de suministro
 *   3. Suministro         una fila de la tabla (CUPS, tarifa, coste, ahorro)
 *   4. Detalle            consumo, potencia, perfil de consumo, compañía actual
 *
 * CÓMO SE ANIMA EL DESPLIEGUE (importante para producto):
 *
 * No se anima "height" (no se puede animar hasta un alto desconocido). Se usa
 * una rejilla de una fila que pasa de 0fr a 1fr, que SÍ se puede animar y no
 * necesita saber el alto del contenido. El hijo lleva overflow-hidden para que
 * el contenido se recorte mientras se abre.
 *
 *   - Abrir: motion-macro-levelup (350 ms, ease out). Es "entrar en un detalle".
 *   - La flecha gira 180° a la vez, con motion-micro-states (200 ms): acaba antes
 *     que el panel, así que se lee como "esto lo ha provocado la flecha".
 *
 * El nivel 4 está diseñado solo como wireframe en Figma: aquí se le han aplicado
 * los tokens del sistema (tipografías, grises, verdes de feedback y espaciados).
 *
 * MANTENIMIENTO: la tabla recibe si el mantenimiento está activado y descuenta su
 * cuota (por punto de suministro) de todas las cifras de ahorro, en los tres
 * niveles: comercializadora, total por dirección y fila de cada suministro.
 */

/** Panel plegable: la técnica de 0fr → 1fr comentada arriba. */
function Plegable({
  abierto,
  children,
}: {
  abierto: boolean;
  children: React.ReactNode;
}) {
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

/**
 * Flecha que gira al abrir.
 *
 * No fija color: hereda el de quien la contiene. Así funciona igual sobre la
 * banda crema de las direcciones (que no cambia entre modo claro y oscuro) y
 * sobre las tarjetas normales.
 */
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

/* -------------------------------------------------------------------------- */
/* Nivel 4 — detalle de un punto de suministro                                */
/* -------------------------------------------------------------------------- */

function FilaDato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-04 py-02">
      <span className="text-label-s tracking-wide text-content-mid uppercase">
        {etiqueta}
      </span>
      <span className="text-body-m text-content-high">{children}</span>
    </div>
  );
}

function DetalleSuministro({
  suministro,
  mantenimientoGlobal,
}: {
  suministro: Suministro;
  mantenimientoGlobal: boolean;
}) {
  const [mantenimiento, setMantenimiento] = useState(
    suministro.detalle.mantenimiento,
  );
  const { detalle } = suministro;
  const consumo = detalle.consumoAnual;

  return (
    <div className="flex flex-col gap-04 bg-background-low px-04 py-04">
      <div className="flex flex-col">
        <FilaDato etiqueta="Tarifa">{suministro.tarifa}</FilaDato>
        <FilaDato etiqueta="Consumo anual">{kwh(consumo)} kWh/año</FilaDato>
        {detalle.potencia > 0 && (
          <FilaDato etiqueta="Nueva potencia contratada">
            {detalle.potencia.toLocaleString("es-ES")} kW
          </FilaDato>
        )}
        <FilaDato etiqueta="Nuevo perfil de consumo">
          <span className="flex flex-wrap justify-end gap-02">
            {(
              [
                ["Punta", detalle.perfil.punta],
                ["Llano", detalle.perfil.llano],
                ["Valle", detalle.perfil.valle],
              ] as const
            ).map(([franja, porcentaje]) => (
              <Tag key={franja} tone="outline">
                <span className="font-medium">{franja}</span>
                <span className="text-content-mid">
                  {kwh(Math.round((consumo * porcentaje) / 100))} kWh (
                  {porcentaje}%)
                </span>
              </Tag>
            ))}
          </span>
        </FilaDato>
        <FilaDato etiqueta="Compañía actual">
          <span className="flex items-center gap-01">
            {detalle.companiaActual}
            <span className="text-content-mid">
              <Icon name="info" size={16} />
            </span>
          </span>
        </FilaDato>
      </div>

      <div className="flex items-center justify-between gap-04 border-t border-border-low pt-04">
        <span className="flex items-center gap-03">
          {/* Si el interruptor de arriba ya ha añadido mantenimiento a TODOS
              los puntos, este queda encendido y desactivado: se manda desde
              arriba, y así se entiende que no está roto. */}
          <Switch
            checked={mantenimientoGlobal || mantenimiento}
            onChange={setMantenimiento}
            disabled={mantenimientoGlobal}
            label={`Añadir mantenimiento en ${suministro.nombre}`}
          />
          <Text variant="body-m" color="mid" as="span">
            Añadir mantenimiento
          </Text>
        </span>
        <button
          type="button"
          className="cursor-pointer text-body-s text-content-high underline transition-opacity motion-micro-states hover:opacity-60"
        >
          Ver más detalles
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nivel 3 — fila de un suministro                                            */
/* -------------------------------------------------------------------------- */

function FilaSuministro({
  suministro,
  mantenimiento,
}: {
  suministro: Suministro;
  mantenimiento: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const ahorro = conMantenimiento(suministro.ahorro, 1, mantenimiento);

  return (
    <li className="border-b border-border-low last:border-b-00">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center gap-03 px-04 py-03 text-left text-content-mid outline-none transition-colors motion-micro-states hover:bg-background-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-info-high"
      >
        <span className="shrink-0 text-content-mid">
          <Icon name="check-circle-outline" />
        </span>

        {/* En pantallas grandes, columnas como en el Figma. En estrechas, todo
            se apila para que no haya scroll horizontal. */}
        <span className="flex min-w-0 flex-1 flex-col gap-02 md:grid md:grid-cols-[1.4fr_0.8fr_1fr_1fr] md:items-center md:gap-04">
          <Text variant="body-m" as="span" className="truncate">
            {suministro.nombre}
          </Text>
          <span className="flex gap-02">
            <Tag>{suministro.tipo}</Tag>
            <Tag className="md:hidden">{suministro.tarifa}</Tag>
          </span>
          <Text variant="body-m" color="mid" as="span">
            €{euros(suministro.costeActual)}/año
          </Text>
          <span className="flex md:justify-start">
            <Tag tone="success">€{euros(ahorro)}/año</Tag>
          </span>
        </span>

        <FlechaPlegar abierto={abierto} />
      </button>

      <Plegable abierto={abierto}>
        <DetalleSuministro
          suministro={suministro}
          mantenimientoGlobal={mantenimiento}
        />
      </Plegable>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Nivel 2 — grupo por dirección                                              */
/* -------------------------------------------------------------------------- */

function GrupoDireccion({
  direccion,
  mantenimiento,
  inicialAbierto = false,
}: {
  direccion: DireccionSuministros;
  mantenimiento: boolean;
  inicialAbierto?: boolean;
}) {
  const [abierto, setAbierto] = useState(inicialAbierto);
  const puntos = direccion.suministros.length;
  const total = conMantenimiento(
    ahorroDireccion(direccion),
    puntos,
    mantenimiento,
  );

  return (
    <div className="overflow-hidden rounded-md">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center justify-between gap-04 bg-highlight-neutral px-04 py-03 text-left text-content-always-dark outline-none transition-opacity motion-micro-states hover:opacity-60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-info-high"
      >
        <Text
          variant="label-m"
          color="always-dark"
          as="span"
          className="min-w-0 truncate"
        >
          {direccion.direccion}
        </Text>
        <span className="flex shrink-0 items-center gap-02">
          <Text variant="body-m" color="always-dark" as="span">
            {puntos} {puntos === 1 ? "punto" : "puntos"} de suministro
          </Text>
          <FlechaPlegar abierto={abierto} />
        </span>
      </button>

      <Plegable abierto={abierto}>
        <div className="bg-background-base">
          {/* Cabecera de la tabla: solo en pantallas anchas. */}
          <div className="hidden items-center gap-03 border-b border-border-low px-04 py-02 md:flex">
            <span className="size-05 shrink-0" />
            <span className="grid flex-1 grid-cols-[1.4fr_0.8fr_1fr_1fr] gap-04 text-label-s tracking-wide text-content-low uppercase">
              <span>CUPS</span>
              <span>Tipo de suministro</span>
              <span>Coste actual</span>
              <span>Ahorro estimado</span>
            </span>
            <span className="size-07 shrink-0" />
          </div>

          <ul>
            {direccion.suministros.map((s) => (
              <FilaSuministro
                key={s.id}
                suministro={s}
                mantenimiento={mantenimiento}
              />
            ))}
          </ul>

          <div className="flex justify-end border-t border-border-low px-04 py-03">
            <Text variant="label-m" as="span">
              Total €{euros(total)}/año
            </Text>
          </div>
        </div>
      </Plegable>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nivel 1 — comercializadora                                                 */
/* -------------------------------------------------------------------------- */

function FilaComercializadora({
  comercializadora,
  mensual,
  mantenimiento,
  onComparar,
}: {
  comercializadora: Comercializadora;
  mensual: boolean;
  mantenimiento: boolean;
  onComparar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const puntos = numSuministros(comercializadora);
  const ahorro = conMantenimiento(
    ahorroComercializadora(comercializadora),
    puntos,
    mantenimiento,
  );
  const cifra = mensual ? ahorro / 12 : ahorro;

  return (
    <article className="overflow-hidden rounded-lg border border-border-low bg-background-base">
      <div className="flex flex-wrap items-center gap-04 p-04">
        <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-neutral text-highlight-muted">
          <Icon name="check-circle" />
        </span>

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-03">
          <Text variant="label-l" as="h3">
            {comercializadora.nombre}
          </Text>
          <span className="flex gap-02">
            {comercializadora.etiquetas.map((e) => (
              <Tag key={e}>{e}</Tag>
            ))}
          </span>
          <Text variant="body-m" color="mid" as="span">
            {puntos} suministros
          </Text>
        </span>

        <Button
          size="small"
          iconEnd="compare"
          onClick={onComparar}
          aria-label={`Comparar ofertas de ${comercializadora.nombre}`}
        >
          Comparar
        </Button>

        <span className="flex items-center gap-03">
          <span className="flex flex-col items-end">
            <Text variant="body-s" color="mid" as="span">
              Ahorro estimado
            </Text>
            {/* En el Figma el ahorro grande lleva el símbolo detrás
                ("+5.520 €/año") y los importes de la tabla lo llevan delante
                ("€12.600/año"). Se respetan las dos formas. */}
            {/* Es la cifra grande de la fila: cuenta al cambiar de periodo o al
                activar el mantenimiento, igual que en las tarjetas de plan. Los
                importes pequeños de dentro cambian de golpe a propósito: son
                docenas y animarlos todos a la vez sería ruido. */}
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
          {comercializadora.direcciones.map((d, i) => (
            <GrupoDireccion
              key={d.id}
              direccion={d}
              mantenimiento={mantenimiento}
              // La primera dirección viene abierta: al desplegar una
              // comercializadora se ve contenido de verdad, no otra fila cerrada.
              inicialAbierto={i === 0}
            />
          ))}
        </div>
      </Plegable>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

export function TablaAhorro({
  comercializadoras,
  mensual,
  mantenimiento = false,
  onComparar,
}: {
  comercializadoras: Comercializadora[];
  mensual: boolean;
  /** true = el mantenimiento resta su cuota de todas las cifras de ahorro. */
  mantenimiento?: boolean;
  onComparar: (c: Comercializadora) => void;
}) {
  return (
    <div className="flex flex-col gap-04">
      {comercializadoras.map((c) => (
        <FilaComercializadora
          key={c.id}
          comercializadora={c}
          mensual={mensual}
          mantenimiento={mantenimiento}
          onComparar={() => onComparar(c)}
        />
      ))}
    </div>
  );
}
