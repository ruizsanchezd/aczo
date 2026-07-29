"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import { SearchInput, Select } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import {
  COMERCIALIZADORAS,
  FILTROS_SOCIEDAD,
  FILTROS_TARIFA,
  FILTROS_TIPO,
  PLANES,
  type Comercializadora,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { ModalComparar } from "./ModalComparar";
import { TablaAhorro } from "./TablaAhorro";
import { TarjetaPlan } from "./TarjetaPlan";

/**
 * PantallaPropuesta — pantalla 4: "Tu ahorro potencial".
 *
 * ANIMACIONES:
 *   - Todo entra en cascada al llegar: titular, aviso, controles, las tres
 *     tarjetas (una tras otra) y la tabla. Es la pantalla con más información del
 *     recorrido, y la cascada marca el orden en que hay que leerla.
 *   - El selector anual/mensual desliza su fondo negro de un lado al otro
 *     (motion-macro-structure) mientras las cifras cuentan hasta su nuevo valor.
 *     Las dos cosas a la vez: el movimiento explica que es el mismo dato.
 *   - Los cuatro niveles de despliegue de la tabla y la ventana de comparación
 *     están documentados en TablaAhorro.tsx y ModalComparar.tsx.
 *
 * El buscador y los filtros funcionan de verdad sobre los datos de mentira.
 */
export function PantallaPropuesta({
  onContinuar,
}: {
  onContinuar: () => void;
}) {
  const [mensual, setMensual] = useState(false);
  const [mantenimiento, setMantenimiento] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [tarifa, setTarifa] = useState("todas");
  const [sociedad, setSociedad] = useState("todas");
  const [comparando, setComparando] = useState<Comercializadora | null>(null);

  // Filtrado: se quitan los suministros que no encajan y, si una dirección o una
  // comercializadora se queda vacía, desaparece también.
  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return COMERCIALIZADORAS.map((c) => ({
      ...c,
      direcciones: c.direcciones
        .filter((d) => !texto || d.direccion.toLowerCase().includes(texto))
        .filter((d) => sociedad === "todas" || d.sociedadId === sociedad)
        .map((d) => ({
          ...d,
          suministros: d.suministros.filter((s) => {
            const encajaTipo =
              tipo === "todos" || s.tipo.toLowerCase() === tipo;
            const encajaTarifa = tarifa === "todas" || s.tarifa === tarifa;
            return encajaTipo && encajaTarifa;
          }),
        }))
        .filter((d) => d.suministros.length > 0),
    })).filter((c) => c.direcciones.length > 0);
  }, [busqueda, tipo, tarifa, sociedad]);

  return (
    <div className="layout-section flex flex-col gap-08 py-09">
      {/* Cabecera --------------------------------------------------------- */}
      <div className="anim-aparece flex flex-col gap-06 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-[400px] flex-col gap-03">
          <Text variant="heading-m">Tu ahorro potencial</Text>
          <Text variant="body-m" color="mid">
            Revisa el ahorro por sociedad y vincula el IBAN de cada cuenta para
            automatizar las domiciliaciones.
          </Text>
        </div>

        <div className="anim-aparece lg:max-w-[560px]" style={retardo(1)}>
          <Alert>
            Tienes contratos con permanencia incluidos que podrían modificar los
            datos de estimación.{" "}
            <button
              type="button"
              className="cursor-pointer underline transition-opacity motion-micro-states hover:opacity-60"
            >
              Revisar permanencias
            </button>
          </Alert>
        </div>
      </div>

      {/* Controles -------------------------------------------------------- */}
      <div
        className="anim-aparece flex flex-wrap items-center justify-between gap-04"
        style={retardo(2)}
      >
        <SelectorPeriodo mensual={mensual} onChange={setMensual} />

        <div className="flex items-center gap-03">
          <Text variant="body-m" as="span">
            Añadir mantenimiento
          </Text>
          <Switch
            checked={mantenimiento}
            onChange={setMantenimiento}
            label="Añadir mantenimiento a todos los puntos"
          />
          <span className="text-content-mid">
            <Icon name="info" />
          </span>
        </div>
      </div>

      {/* Los tres planes -------------------------------------------------- */}
      <div className="grid gap-04 lg:grid-cols-3">
        {PLANES.map((plan, i) => (
          <div key={plan.id} className="anim-aparece" style={retardo(i + 3)}>
            <TarjetaPlan plan={plan} mensual={mensual} onElegir={onContinuar} />
          </div>
        ))}
      </div>

      {/* Buscador y filtros ----------------------------------------------- */}
      <div
        className="anim-aparece flex flex-col gap-04 lg:flex-row lg:items-center lg:justify-between"
        style={retardo(6)}
      >
        <SearchInput
          placeholder="Buscar por dirección"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="lg:w-[302px]"
        />

        <div className="flex flex-wrap gap-02">
          <Select
            options={FILTROS_TIPO}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar por tipo de suministro"
          />
          <Select
            options={FILTROS_TARIFA}
            value={tarifa}
            onChange={(e) => setTarifa(e.target.value)}
            aria-label="Filtrar por tarifa"
          />
          <Select
            options={FILTROS_SOCIEDAD}
            value={sociedad}
            onChange={(e) => setSociedad(e.target.value)}
            aria-label="Filtrar por sociedad"
          />
        </div>
      </div>

      {/* Tabla ------------------------------------------------------------ */}
      <div className="anim-aparece" style={retardo(7)}>
        {filtradas.length > 0 ? (
          <TablaAhorro
            comercializadoras={filtradas}
            mensual={mensual}
            onComparar={setComparando}
          />
        ) : (
          <div className="rounded-lg border border-border-low bg-background-base p-08 text-center">
            <Text variant="body-m" color="mid">
              No hay suministros que encajen con lo que estás buscando.
            </Text>
          </div>
        )}
      </div>

      {/* No hay botón de avance suelto al final: en el Figma se pasa al paso
          siguiente con el "Hacer switching" de la tarjeta del plan elegido. */}

      <ModalComparar
        abierto={comparando !== null}
        nombreComercializadora={comparando?.nombre}
        onCerrar={() => setComparando(null)}
      />
    </div>
  );
}

/**
 * SelectorPeriodo — el segmentado "Ver ahorro anual / Ver ahorro mensual".
 *
 * El fondo negro se desliza de un segmento al otro en lugar de saltar. Los dos
 * segmentos tienen el mismo ancho (en el Figma son de anchos distintos, pero
 * igualarlos es lo que permite que el indicador se deslice limpiamente).
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
      className="relative grid grid-cols-2 gap-00 rounded-full bg-background-base p-01"
    >
      {/* Indicador que se desliza. */}
      <span
        aria-hidden="true"
        className={[
          "absolute top-01 bottom-01 left-01 w-[calc(50%-4px)] rounded-full bg-background-inverse",
          "transition-transform motion-macro-structure",
          mensual ? "translate-x-full" : "translate-x-00",
        ].join(" ")}
      />

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
            "relative z-10 cursor-pointer rounded-full px-04 py-02 text-label-m whitespace-nowrap",
            "transition-colors motion-micro-states",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
            seg.activo ? "text-content-inverse" : "text-content-mid",
          ].join(" ")}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
