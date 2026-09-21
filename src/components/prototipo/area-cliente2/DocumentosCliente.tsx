"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  ACTUALIZACION_DASHBOARD,
  CONTRATOS_CLIENTE,
  FACTURAS_CLIENTE,
  OTROS_DOCUMENTOS_CLIENTE,
  euros,
} from "@/mocks/aczo";
import { SelectorCompacto } from "./PiezasAreaCliente";

/**
 * DocumentosCliente — "Documentos" del área de cliente (Figma nodo
 * 797:44753).
 *
 * Tres pestañas, las tres con diseño en el Figma: "Facturas" (797:44753),
 * "Contratos" (797:44901) y "Otros documentos" (797:45011).
 *
 * LA CABECERA DE LA TABLA VA EN OSCURO (`bg-highlight-deep`), no en blanco
 * como el resto de tablas del prototipo — así sale en las tres pestañas, y
 * es lo que distingue estas listas largas de una lista corta como la de "Mi
 * cartera".
 *
 * Los filtros son de una sola respuesta (`SelectorCompacto`, el mismo del
 * Dashboard) y sus opciones salen de los documentos que de verdad hay — no
 * hay una lista de sociedades o comercializadoras aparte que se pueda
 * desincronizar.
 *
 * "Descargar todas" y el icono de descarga de cada fila no tienen archivo
 * real que descargar (todo son datos de mentira, ver CLAUDE.md): están ahí
 * para que se vea el gesto, igual que "Añadir nuevos suministros" en el
 * resto de pantallas del área de cliente.
 *
 * Los ejemplos de "Contratos" y "Otros documentos" del Figma traían
 * contenido genérico (mantenimiento, alquiler, seguro...) y sociedades
 * inventadas que no existen en ningún otro sitio del prototipo — en
 * `CONTRATOS_CLIENTE` y `OTROS_DOCUMENTOS_CLIENTE` se sustituyen por
 * contratos de luz/gas y sociedades de verdad de la cartera, para que
 * tengan sentido con el resto del área de cliente.
 */

const PESTAÑAS = [
  { id: "facturas", rotulo: "Facturas" },
  { id: "contratos", rotulo: "Contratos" },
  { id: "otros", rotulo: "Otros documentos" },
] as const;
type Pestaña = (typeof PESTAÑAS)[number]["id"];

export function DocumentosCliente() {
  const [pestaña, setPestaña] = useState<Pestaña>("facturas");

  return (
    <>
      {/* Cabecera */}
      <header className="flex flex-wrap items-end justify-between gap-04">
        <div className="flex flex-col gap-01">
          <Text variant="label-s-uppercase" color="low" as="p">
            Última actualización · {ACTUALIZACION_DASHBOARD}
          </Text>
          <Text variant="heading-l" as="h1">
            Documentos
          </Text>
          <Text variant="body-s" color="mid" as="p">
            Toda tu documentación en un mismo sitio
          </Text>
        </div>
        <Button size="small">Añadir nuevos suministros</Button>
      </header>

      {/* Pestañas */}
      <div
        role="tablist"
        aria-label="Ver documentos por"
        className="mt-06 flex gap-06 border-b border-border-low"
      >
        {PESTAÑAS.map((p) => {
          const activa = p.id === pestaña;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setPestaña(p.id)}
              className={`cursor-pointer border-b-2 py-02 transition-colors motion-micro-states ${
                activa
                  ? "border-content-high"
                  : "border-transparent hover:opacity-60"
              }`}
            >
              <Text variant="label-m" as="span" color={activa ? "high" : "low"}>
                {p.rotulo}
              </Text>
            </button>
          );
        })}
      </div>

      {pestaña === "facturas" ? (
        <TablaFacturas />
      ) : pestaña === "contratos" ? (
        <TablaContratos />
      ) : (
        <TablaOtrosDocumentos />
      )}
    </>
  );
}

const POR_PAGINA = 10;

/** La pestaña "Facturas" (Figma nodo 797:44753): filtros, tabla paginada. */
function TablaFacturas() {
  const [fecha, setFecha] = useState("");
  const [sociedad, setSociedad] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [comercializadora, setComercializadora] = useState("");
  const [tipo, setTipo] = useState("");
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const opciones = useMemo(
    () => ({
      fechas: [...new Set(FACTURAS_CLIENTE.map((f) => f.fecha))],
      sociedades: [...new Set(FACTURAS_CLIENTE.map((f) => f.sociedad))],
      ubicaciones: [...new Set(FACTURAS_CLIENTE.map((f) => f.ubicacion))],
      comercializadoras: [
        ...new Set(FACTURAS_CLIENTE.map((f) => f.comercializadora)),
      ],
    }),
    [],
  );

  const facturas = useMemo(
    () =>
      FACTURAS_CLIENTE.filter(
        (f) =>
          (!fecha || f.fecha === fecha) &&
          (!sociedad || f.sociedad === sociedad) &&
          (!ubicacion || f.ubicacion === ubicacion) &&
          (!comercializadora || f.comercializadora === comercializadora) &&
          (!tipo || f.tipo === tipo),
      ),
    [fecha, sociedad, ubicacion, comercializadora, tipo],
  );

  const totalPaginas = Math.max(1, Math.ceil(facturas.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * POR_PAGINA;
  const facturasPagina = facturas.slice(inicio, inicio + POR_PAGINA);

  function cambiarFiltro(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPagina(1);
      setSeleccion(new Set());
    };
  }

  const marcadasEnPagina = facturasPagina.filter((f) =>
    seleccion.has(f.id),
  ).length;
  const todasMarcadas =
    facturasPagina.length > 0 && marcadasEnPagina === facturasPagina.length;

  function alternarPagina(marcar: boolean) {
    setSeleccion((s) => {
      const copia = new Set(s);
      for (const f of facturasPagina) {
        if (marcar) copia.add(f.id);
        else copia.delete(f.id);
      }
      return copia;
    });
  }

  function alternarFila(id: string) {
    setSeleccion((s) => {
      const copia = new Set(s);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  return (
    <>
      {/* Filtros + descargar */}
      <div className="mt-06 flex flex-wrap items-center justify-between gap-03">
        <div className="flex flex-wrap gap-02">
          <SelectorCompacto
            etiqueta="Fecha"
            ancho="w-[110px]"
            valor={fecha}
            onChange={cambiarFiltro(setFecha)}
            opciones={[
              { value: "", label: "Fecha" },
              ...opciones.fechas.map((f) => ({ value: f, label: f })),
            ]}
          />
          <SelectorCompacto
            etiqueta="Sociedad"
            ancho="w-[150px]"
            valor={sociedad}
            onChange={cambiarFiltro(setSociedad)}
            opciones={[
              { value: "", label: "Sociedad" },
              ...opciones.sociedades.map((s) => ({ value: s, label: s })),
            ]}
          />
          <SelectorCompacto
            etiqueta="Ubicación"
            ancho="w-[150px]"
            valor={ubicacion}
            onChange={cambiarFiltro(setUbicacion)}
            opciones={[
              { value: "", label: "Ubicación" },
              ...opciones.ubicaciones.map((u) => ({ value: u, label: u })),
            ]}
          />
          <SelectorCompacto
            etiqueta="Comercializadora"
            ancho="w-[170px]"
            valor={comercializadora}
            onChange={cambiarFiltro(setComercializadora)}
            opciones={[
              { value: "", label: "Comercializadora" },
              ...opciones.comercializadoras.map((c) => ({
                value: c,
                label: c,
              })),
            ]}
          />
          <SelectorCompacto
            etiqueta="Tipo de factura"
            ancho="w-[150px]"
            valor={tipo}
            onChange={cambiarFiltro(setTipo)}
            opciones={[
              { value: "", label: "Tipo de factura" },
              { value: "luz", label: "Luz" },
              { value: "gas", label: "Gas" },
            ]}
          />
        </div>

        <Button variant="secondary" size="small">
          <span className="flex items-center gap-02">
            <Icon name="download" size={16} />
            Descargar todas
          </span>
        </Button>
      </div>

      {/* Tabla */}
      <div className="mt-04 overflow-hidden rounded-md border border-border-low">
        <div className="flex items-center gap-04 bg-highlight-deep px-04 py-03">
          <Checkbox
            checked={todasMarcadas}
            indeterminate={marcadasEnPagina > 0 && !todasMarcadas}
            onChange={alternarPagina}
          />
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-[2]"
          >
            Factura
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Sociedad
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Ubicación/ Activo
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="w-[80px] shrink-0 text-right"
          >
            Importe
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="w-08 shrink-0 text-right"
          >
            Acción
          </Text>
        </div>

        {facturasPagina.length === 0 ? (
          <div className="p-08 text-center">
            <Text variant="body-m" color="mid" as="p">
              No hay facturas con los filtros puestos.
            </Text>
          </div>
        ) : (
          <ul className="divide-y divide-border-low">
            {facturasPagina.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-04 bg-background-base px-04 py-03"
              >
                <Checkbox
                  checked={seleccion.has(f.id)}
                  onChange={() => alternarFila(f.id)}
                />
                <span className="flex min-w-0 flex-[2] items-center gap-03">
                  <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-background-low">
                    <Icon name="document" className="text-content-mid" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <Text variant="label-m" as="span">
                      {f.numero} · {f.fecha}
                    </Text>
                    <Text variant="body-s" color="low" as="span">
                      {f.tipo === "luz" ? "Luz" : "Gas"}
                    </Text>
                  </span>
                </span>
                <Text
                  variant="body-m"
                  as="span"
                  className="min-w-0 flex-1 truncate"
                >
                  {f.sociedad}
                </Text>
                <Text
                  variant="body-m"
                  color="mid"
                  as="span"
                  className="min-w-0 flex-1 truncate"
                >
                  {f.ubicacion}
                </Text>
                <Text
                  variant="body-m"
                  as="span"
                  className="w-[80px] shrink-0 text-right"
                >
                  {euros(f.importe)} €
                </Text>
                <span className="flex w-08 shrink-0 justify-end">
                  <button
                    type="button"
                    aria-label={`Descargar ${f.numero}`}
                    className="flex cursor-pointer items-center rounded-md p-02 text-content-high transition-opacity motion-micro-states hover:opacity-60"
                  >
                    <Icon name="download" size={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Paginación */}
        <div className="flex flex-wrap items-center justify-between gap-03 border-t border-border-low bg-background-base px-04 py-03">
          <Text variant="body-s" color="low" as="p">
            Mostrando {facturas.length === 0 ? 0 : inicio + 1}-
            {Math.min(inicio + POR_PAGINA, facturas.length)} de{" "}
            {facturas.length} facturas
          </Text>
          <div className="flex items-center gap-01">
            <button
              type="button"
              disabled={paginaSegura === 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
              className="flex size-08 cursor-pointer items-center justify-center rounded-md text-content-high transition-opacity motion-micro-states hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Icon name="chevron-left" size={16} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === paginaSegura ? "page" : undefined}
                  onClick={() => setPagina(n)}
                  className={`flex size-08 cursor-pointer items-center justify-center rounded-md transition-colors motion-micro-states ${
                    n === paginaSegura
                      ? "bg-background-inverse text-content-inverse"
                      : "text-content-high hover:bg-background-low"
                  }`}
                >
                  <Text
                    variant="label-s"
                    as="span"
                    color={n === paginaSegura ? "inverse" : "high"}
                  >
                    {n}
                  </Text>
                </button>
              ),
            )}
            <button
              type="button"
              disabled={paginaSegura === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              aria-label="Página siguiente"
              className="flex size-08 cursor-pointer items-center justify-center rounded-md text-content-high transition-opacity motion-micro-states hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** La pestaña "Contratos" (Figma nodo 797:44901): filtros, tabla sin paginar. */
function TablaContratos() {
  const [sociedad, setSociedad] = useState("");
  const [comercializadora, setComercializadora] = useState("");
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const opciones = useMemo(
    () => ({
      sociedades: [...new Set(CONTRATOS_CLIENTE.map((c) => c.sociedad))],
      comercializadoras: [
        ...new Set(CONTRATOS_CLIENTE.map((c) => c.proveedor)),
      ],
    }),
    [],
  );

  const contratos = useMemo(
    () =>
      CONTRATOS_CLIENTE.filter(
        (c) =>
          (!sociedad || c.sociedad === sociedad) &&
          (!comercializadora || c.proveedor === comercializadora),
      ),
    [sociedad, comercializadora],
  );

  const marcados = contratos.filter((c) => seleccion.has(c.id)).length;
  const todosMarcados = contratos.length > 0 && marcados === contratos.length;

  function alternarTodos(marcar: boolean) {
    setSeleccion(new Set(marcar ? contratos.map((c) => c.id) : []));
  }

  function alternarFila(id: string) {
    setSeleccion((s) => {
      const copia = new Set(s);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  return (
    <>
      {/* Filtros + descargar */}
      <div className="mt-06 flex flex-wrap items-center justify-between gap-03">
        <div className="flex flex-wrap gap-02">
          <SelectorCompacto
            etiqueta="Sociedad"
            ancho="w-[150px]"
            valor={sociedad}
            onChange={setSociedad}
            opciones={[
              { value: "", label: "Sociedad" },
              ...opciones.sociedades.map((s) => ({ value: s, label: s })),
            ]}
          />
          <SelectorCompacto
            etiqueta="Comercializadora"
            ancho="w-[170px]"
            valor={comercializadora}
            onChange={setComercializadora}
            opciones={[
              { value: "", label: "Comercializadora" },
              ...opciones.comercializadoras.map((c) => ({
                value: c,
                label: c,
              })),
            ]}
          />
        </div>

        <Button variant="secondary" size="small">
          <span className="flex items-center gap-02">
            <Icon name="download" size={16} />
            Descargar todas
          </span>
        </Button>
      </div>

      {/* Tabla */}
      <div className="mt-04 overflow-hidden rounded-md border border-border-low">
        <div className="flex items-center gap-04 bg-highlight-deep px-04 py-03">
          <Checkbox
            checked={todosMarcados}
            indeterminate={marcados > 0 && !todosMarcados}
            onChange={alternarTodos}
          />
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-[2]"
          >
            Documento
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Sociedad
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Firma
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Vigencia
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="w-[100px] shrink-0"
          >
            Estado
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="w-08 shrink-0 text-right"
          >
            Acción
          </Text>
        </div>

        {contratos.length === 0 ? (
          <div className="p-08 text-center">
            <Text variant="body-m" color="mid" as="p">
              No hay contratos con los filtros puestos.
            </Text>
          </div>
        ) : (
          <ul className="divide-y divide-border-low">
            {contratos.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-04 bg-background-base px-04 py-03"
              >
                <Checkbox
                  checked={seleccion.has(c.id)}
                  onChange={() => alternarFila(c.id)}
                />
                <span className="flex min-w-0 flex-[2] items-center gap-03">
                  <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-background-low">
                    <Icon name="document" className="text-content-mid" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <Text variant="label-m" as="span">
                      {c.titulo}
                    </Text>
                    <Text variant="body-s" color="low" as="span">
                      {c.categoria} · {c.proveedor}
                    </Text>
                  </span>
                </span>
                <Text
                  variant="body-m"
                  as="span"
                  className="min-w-0 flex-1 truncate"
                >
                  {c.sociedad}
                </Text>
                <Text
                  variant="body-m"
                  color="mid"
                  as="span"
                  className="min-w-0 flex-1"
                >
                  {c.firma}
                </Text>
                <Text
                  variant="body-m"
                  color="mid"
                  as="span"
                  className="min-w-0 flex-1"
                >
                  {c.vigencia}
                </Text>
                <span className="w-[100px] shrink-0">
                  <Tag tone="success">Vigente</Tag>
                </span>
                <span className="flex w-08 shrink-0 justify-end">
                  <button
                    type="button"
                    aria-label={`Descargar ${c.titulo}`}
                    className="flex cursor-pointer items-center rounded-md p-02 text-content-high transition-opacity motion-micro-states hover:opacity-60"
                  >
                    <Icon name="download" size={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/** La pestaña "Otros documentos" (Figma nodo 797:45011): filtro, tabla sin paginar. */
function TablaOtrosDocumentos() {
  const [sociedad, setSociedad] = useState("");
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const sociedades = useMemo(
    () => [...new Set(OTROS_DOCUMENTOS_CLIENTE.map((d) => d.titular))],
    [],
  );

  const documentos = useMemo(
    () =>
      OTROS_DOCUMENTOS_CLIENTE.filter(
        (d) => !sociedad || d.titular === sociedad,
      ),
    [sociedad],
  );

  const marcados = documentos.filter((d) => seleccion.has(d.id)).length;
  const todosMarcados = documentos.length > 0 && marcados === documentos.length;

  function alternarTodos(marcar: boolean) {
    setSeleccion(new Set(marcar ? documentos.map((d) => d.id) : []));
  }

  function alternarFila(id: string) {
    setSeleccion((s) => {
      const copia = new Set(s);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  return (
    <>
      {/* Filtro + descargar */}
      <div className="mt-06 flex flex-wrap items-center justify-between gap-03">
        <SelectorCompacto
          etiqueta="Sociedad"
          ancho="w-[150px]"
          valor={sociedad}
          onChange={setSociedad}
          opciones={[
            { value: "", label: "Sociedad" },
            ...sociedades.map((s) => ({ value: s, label: s })),
          ]}
        />

        <Button variant="secondary" size="small">
          <span className="flex items-center gap-02">
            <Icon name="download" size={16} />
            Descargar todas
          </span>
        </Button>
      </div>

      {/* Tabla */}
      <div className="mt-04 overflow-hidden rounded-md border border-border-low">
        <div className="flex items-center gap-04 bg-highlight-deep px-04 py-03">
          <Checkbox
            checked={todosMarcados}
            indeterminate={marcados > 0 && !todosMarcados}
            onChange={alternarTodos}
          />
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-[2]"
          >
            Documento
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Tipo
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Titular
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="min-w-0 flex-1"
          >
            Fecha
          </Text>
          <Text
            variant="label-s-uppercase"
            color="always-light"
            as="span"
            className="w-08 shrink-0 text-right"
          >
            Acción
          </Text>
        </div>

        {documentos.length === 0 ? (
          <div className="p-08 text-center">
            <Text variant="body-m" color="mid" as="p">
              No hay documentos con los filtros puestos.
            </Text>
          </div>
        ) : (
          <ul className="divide-y divide-border-low">
            {documentos.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-04 bg-background-base px-04 py-03"
              >
                <Checkbox
                  checked={seleccion.has(d.id)}
                  onChange={() => alternarFila(d.id)}
                />
                <span className="flex min-w-0 flex-[2] items-center gap-03">
                  <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-background-low">
                    <Icon name="document" className="text-content-mid" />
                  </span>
                  <Text variant="label-m" as="span">
                    {d.titulo}
                  </Text>
                </span>
                <Text
                  variant="body-m"
                  color="mid"
                  as="span"
                  className="min-w-0 flex-1"
                >
                  {d.tipo}
                </Text>
                <Text
                  variant="body-m"
                  as="span"
                  className="min-w-0 flex-1 truncate"
                >
                  {d.titular}
                </Text>
                <Text
                  variant="body-m"
                  color="mid"
                  as="span"
                  className="min-w-0 flex-1"
                >
                  {d.fecha}
                </Text>
                <span className="flex w-08 shrink-0 justify-end">
                  <button
                    type="button"
                    aria-label={`Descargar ${d.titulo}`}
                    className="flex cursor-pointer items-center rounded-md p-02 text-content-high transition-opacity motion-micro-states hover:opacity-60"
                  >
                    <Icon name="download" size={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
