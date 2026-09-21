"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input, Select } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import {
  CATEGORIAS_INMUEBLE,
  type CategoriaInmueble,
  type GrupoCartera,
  type LineaDetalle,
} from "@/mocks/aczo";

/**
 * ModalOrganizaCartera — nombra y categoriza los inmuebles de la cartera de
 * golpe (Figma nodo 797:16376).
 *
 * Se abre de dos formas, y las dos llevan al MISMO modal con TODA la cartera
 * dentro (agrupada como la lista de la que vienes: por sociedad, por
 * comercializadora...), no solo el inmueble que tocaste:
 *
 *   Desde una fila       pulsar el nombre o la dirección de un inmueble abre
 *                        el modal con SOLO ese inmueble ya desplegado (y su
 *                        grupo), para no perder de vista dónde estás — pero
 *                        el resto sigue ahí, un pliegue más allá.
 *   Desde "Organiza tu
 *   cartera"             abre igual, sin nada desplegado de más.
 *
 * Los cambios se acumulan en este componente mientras se rellenan campos, y
 * SOLO se aplican a la cartera al pulsar "Guardar" — "Continuar más tarde"
 * los descarta. Por eso el contador de arriba ("X de Y activos
 * clasificados") cuenta sobre lo que hay escrito en el momento, no sobre lo
 * que ya estaba guardado: es el sitio donde se ve el progreso mientras se
 * rellena.
 *
 * MISMO PATRÓN DE VENTANA QUE ModalSuministrosGrandes.tsx (ahí está
 * explicado con más detalle): portal, velo, crecer desde el 96 %, cerrar con
 * la X/Escape/fuera, salir siempre en 250 ms.
 */
export function ModalOrganizaCartera({
  grupos,
  focoId,
  onGuardar,
  onCerrar,
}: {
  /** Los grupos que se ven en la lista de fuera, con la misma agrupación. */
  grupos: GrupoCartera[];
  /** id del inmueble que se abre ya desplegado, o null si se entra sin foco. */
  focoId: string | null;
  onGuardar: (
    cambios: Record<string, { nombre?: string; categoria?: CategoriaInmueble }>,
  ) => void;
  onCerrar: () => void;
}) {
  const [cerrando, setCerrando] = useState(false);

  const lineas = grupos.flatMap((g) => g.detalle);

  const [gruposAbiertos, setGruposAbiertos] = useState<Set<string>>(() => {
    const grupo = grupos.find((g) => g.detalle.some((l) => l.id === focoId));
    return new Set(grupo ? [grupo.id] : []);
  });
  const [inmueblesAbiertos, setInmueblesAbiertos] = useState<Set<string>>(
    () => new Set(focoId ? [focoId] : []),
  );

  // Los cambios en curso, por dirección. Parten de lo que ya hay guardado, y
  // solo se escriben en la cartera real al pulsar "Guardar".
  const [edits, setEdits] = useState<
    Record<string, { nombre: string; categoria: CategoriaInmueble | "" }>
  >(() =>
    Object.fromEntries(
      lineas.map((l) => [
        l.id,
        { nombre: l.nombre ?? "", categoria: l.categoria ?? "" },
      ]),
    ),
  );

  useEffect(() => {
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
  }, []);

  function iniciarCierre() {
    setCerrando(true);
    setTimeout(() => {
      setCerrando(false);
      onCerrar();
    }, 250);
  }

  function alternar(set: Set<string>, id: string) {
    const copia = new Set(set);
    if (copia.has(id)) copia.delete(id);
    else copia.add(id);
    return copia;
  }

  const clasificados = lineas.filter((l) => edits[l.id]?.categoria).length;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Organiza tu cartera y nombra tus inmuebles"
      className="fixed inset-00 z-50 flex items-center justify-center overflow-y-auto p-04"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={iniciarCierre}
        className={`fixed inset-00 cursor-default bg-background-overlay ${
          cerrando ? "opacity-00 transition-opacity motion-micro-leave" : "anim-aparece-simple"
        }`}
      />

      <div
        className={[
          "relative my-auto flex w-full max-w-[600px] flex-col gap-04 rounded-lg bg-background-base p-05 shadow-md",
          cerrando
            ? "scale-95 opacity-00 transition-[transform,opacity] motion-micro-leave"
            : "anim-escala-entrada",
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-04">
          <div className="flex flex-col gap-01">
            <Text variant="heading-s" as="h2">
              Organiza tu cartera y nombra tus inmuebles
            </Text>
            <Text variant="body-s" color="low" as="p">
              {clasificados} de {lineas.length} activos clasificados
            </Text>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={iniciarCierre}
            className="shrink-0 cursor-pointer rounded-sm p-01 text-content-high transition-opacity motion-micro-states hover:opacity-60 active:opacity-30"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="flex max-h-[60vh] flex-col gap-03 overflow-y-auto">
          {grupos.map((grupo) => (
            <GrupoOrganizar
              key={grupo.id}
              grupo={grupo}
              abierto={gruposAbiertos.has(grupo.id)}
              onAbrir={() =>
                setGruposAbiertos((s) => alternar(s, grupo.id))
              }
              inmueblesAbiertos={inmueblesAbiertos}
              onAbrirInmueble={(id) =>
                setInmueblesAbiertos((s) => alternar(s, id))
              }
              edits={edits}
              onCambiar={(id, cambio) =>
                setEdits((e) => ({ ...e, [id]: { ...e[id], ...cambio } }))
              }
            />
          ))}
        </div>

        <footer className="flex flex-wrap justify-end gap-02">
          <Button variant="secondary" onClick={iniciarCierre}>
            Continuar más tarde
          </Button>
          <Button
            onClick={() => {
              const cambios: Record<
                string,
                { nombre?: string; categoria?: CategoriaInmueble }
              > = {};
              for (const l of lineas) {
                const edit = edits[l.id];
                if (!edit) continue;
                const cambio: { nombre?: string; categoria?: CategoriaInmueble } =
                  {};
                if (edit.nombre && edit.nombre !== l.nombre)
                  cambio.nombre = edit.nombre;
                if (edit.categoria && edit.categoria !== l.categoria)
                  cambio.categoria = edit.categoria;
                if (cambio.nombre || cambio.categoria) cambios[l.id] = cambio;
              }
              onGuardar(cambios);
              iniciarCierre();
            }}
          >
            Guardar
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/** Una sociedad (o provincia, o lo que toque) dentro del modal, con sus inmuebles debajo. */
function GrupoOrganizar({
  grupo,
  abierto,
  onAbrir,
  inmueblesAbiertos,
  onAbrirInmueble,
  edits,
  onCambiar,
}: {
  grupo: GrupoCartera;
  abierto: boolean;
  onAbrir: () => void;
  inmueblesAbiertos: Set<string>;
  onAbrirInmueble: (id: string) => void;
  edits: Record<string, { nombre: string; categoria: CategoriaInmueble | "" }>;
  onCambiar: (
    id: string,
    cambio: Partial<{ nombre: string; categoria: CategoriaInmueble | "" }>,
  ) => void;
}) {
  return (
    <div className="rounded-md border border-border-low">
      <button
        type="button"
        onClick={onAbrir}
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center justify-between gap-04 rounded-md bg-background-low p-03"
      >
        <span className="flex min-w-0 items-center gap-03">
          <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-deep text-highlight-soft">
            <Icon name="building-office" />
          </span>
          <span className="flex min-w-0 items-center gap-02">
            <Text variant="label-m" as="span">
              {grupo.nombre}
            </Text>
            <Text variant="body-s" color="low" as="span">
              {grupo.inmuebles} {grupo.inmuebles === 1 ? "inmueble" : "inmuebles"}{" "}
              · {grupo.puntos} puntos de suministro
            </Text>
          </span>
        </span>
        <Icon
          name="chevron-down"
          className={`shrink-0 transition-transform motion-micro-states ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
        aria-hidden={!abierto}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-02 p-03">
            {grupo.detalle.map((linea) => (
              <FilaOrganizar
                key={linea.id}
                linea={linea}
                abierto={inmueblesAbiertos.has(linea.id)}
                onAbrir={() => onAbrirInmueble(linea.id)}
                edit={edits[linea.id] ?? { nombre: "", categoria: "" }}
                onCambiar={(cambio) => onCambiar(linea.id, cambio)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Un inmueble dentro del modal: colapsado enseña solo su resumen; abierto, sus dos campos. */
function FilaOrganizar({
  linea,
  abierto,
  onAbrir,
  edit,
  onCambiar,
}: {
  linea: LineaDetalle;
  abierto: boolean;
  onAbrir: () => void;
  edit: { nombre: string; categoria: CategoriaInmueble | "" };
  onCambiar: (
    cambio: Partial<{ nombre: string; categoria: CategoriaInmueble | "" }>,
  ) => void;
}) {
  return (
    <li className="rounded-md bg-background-low">
      <button
        type="button"
        onClick={onAbrir}
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center justify-between gap-04 p-03 text-left"
      >
        <Text variant="body-m" as="span">
          {linea.nombre ?? linea.direccion}
        </Text>
        <span className="flex shrink-0 items-center gap-03">
          <Text variant="body-s" color="low" as="span">
            {linea.puntos} puntos de suministro
          </Text>
          <Icon
            name="chevron-down"
            size={16}
            className={`transition-transform motion-micro-states ${abierto ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
        aria-hidden={!abierto}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-04 p-03 pt-00 sm:grid-cols-2">
            <Input
              label="Nombre del inmueble"
              placeholder="Ej: Oficinas Madrid"
              value={edit.nombre}
              onChange={(e) => onCambiar({ nombre: e.target.value })}
            />
            <Select
              label="Tipo de inmueble"
              placeholder="Selecciona el tipo de activo"
              options={CATEGORIAS_INMUEBLE.map((c) => ({ value: c, label: c }))}
              value={edit.categoria}
              onChange={(e) =>
                onCambiar({ categoria: e.target.value as CategoriaInmueble })
              }
            />
          </div>
        </div>
      </div>
    </li>
  );
}
