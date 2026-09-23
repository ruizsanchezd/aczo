"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import {
  ARCHIVO_DNI_PERFIL_CLIENTE,
  CIF_POR_SOCIEDAD,
  CONTRASENA_ACTUALIZADA_PERFIL_CLIENTE,
  DNI_NUEVO_SUMINISTRO,
  EMAIL_PERFIL_CLIENTE,
  GRUPO_PERFIL_CLIENTE,
  ROL_PERFIL_CLIENTE,
  SOCIEDADES_CARTERA,
  TELEFONO_PERFIL_CLIENTE,
  TITULAR_NUEVO_SUMINISTRO,
  type SociedadCartera,
} from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { FlechaPlegar, SelectorCompacto } from "./PiezasAreaCliente";

/**
 * MiPerfilCliente — "Mi perfil" del área de cliente (Figma nodo 797:44542).
 *
 * No es una sección más de la barra lateral (Dashboard, Mi cartera...): se
 * abre pulsando el propio nombre/avatar del pie de la barra
 * (`onAbrirPerfil` en BarraLateralCliente), igual que la campana abre
 * PanelAvisos — con la diferencia de que esta sí ocupa `<main>` entero, como
 * "Nuevo suministro" o "Ahorro detectado", en vez de flotar encima. Por eso
 * ninguna de las cuatro secciones del menú se marca activa mientras se ve
 * (ver `activa` en BarraLateralCliente): el avatar lleva su propio anillo de
 * "aquí estás" en su lugar.
 *
 * Tres tarjetas en la columna derecha — "Datos de contacto", "Mis
 * sociedades" y "Seguridad y acceso" — más la tarjeta de perfil a la
 * izquierda. El Figma trae dos secciones más apagadas
 * ("Preferencias y notificaciones" y el desglose de "Mis sociedades" con
 * poder de representación) marcadas como ocultas en el propio archivo: no
 * se construyen aquí porque no llegan a formar parte del diseño visible.
 *
 * "Mis sociedades" es un acordeón — mismo patrón (`FlechaPlegar` + grid de
 * `grid-template-rows`) que el resto del prototipo — con la primera sociedad
 * abierta de entrada, tal cual sale en el Figma. El filtro "Sociedad" de su
 * cabecera sí funciona: al elegir una, la lista se recorta a esa única fila.
 *
 * DATOS: el titular y el DNI de las cuatro sociedades son los de quien ha
 * iniciado sesión (`TITULAR_NUEVO_SUMINISTRO`/`DNI_NUEVO_SUMINISTRO`, ya
 * usados en "Nuevo suministro"); el CIF cambia con cada una
 * (`CIF_POR_SOCIEDAD`, en mocks/aczo.ts). El IBAN se deja vacío a propósito:
 * así lo enseña el propio Figma, como el único de los cinco campos
 * pendiente de rellenar.
 */
export function MiPerfilCliente({
  persona = "Ainhoa Martínez",
}: {
  persona?: string;
}) {
  const inicial = persona.trim().charAt(0).toUpperCase();
  // "" = todas las sociedades.
  const [filtroSociedad, setFiltroSociedad] = useState("");
  const [desplegada, setDesplegada] = useState<string | null>(
    SOCIEDADES_CARTERA[0]?.id ?? null,
  );

  const sociedadesVisibles = filtroSociedad
    ? SOCIEDADES_CARTERA.filter((s) => s.id === filtroSociedad)
    : SOCIEDADES_CARTERA;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-04">
        <div className="flex flex-col gap-01">
          <Text variant="label-s-uppercase" color="low" as="p">
            Ajustes de cuenta y preferencias
          </Text>
          <Text variant="heading-l" as="h1">
            Mi perfil
          </Text>
        </div>
        <Button variant="secondary" size="small" iconStart="call">
          ¿Necesitas asistencia?
        </Button>
      </header>

      <div className="mt-06 flex flex-col items-start gap-04 lg:flex-row">
        {/* Tarjeta de perfil */}
        <div
          className="anim-aparece w-full shrink-0 rounded-md bg-background-base p-06 lg:w-[282px]"
          style={retardo(0)}
        >
          <div className="flex flex-col items-start gap-05">
            <span className="flex size-[64px] shrink-0 items-center justify-center rounded-full bg-highlight-deep">
              <Text
                variant="title-l"
                as="span"
                className="text-highlight-vivid"
              >
                {inicial}
              </Text>
            </span>
            <div className="flex flex-col gap-01">
              <Text variant="heading-m" as="h2">
                {persona}
              </Text>
              <Text variant="body-m" color="low">
                {ROL_PERFIL_CLIENTE} · {GRUPO_PERFIL_CLIENTE}
              </Text>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex min-w-0 flex-1 flex-col gap-06">
          {/* Datos de contacto */}
          <section
            className="anim-aparece flex w-full flex-col gap-06 rounded-md bg-background-base p-06"
            style={retardo(1)}
          >
            <Text variant="heading-m" as="h2">
              Datos de contacto
            </Text>
            <div className="flex flex-col gap-04">
              <div className="grid gap-04 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  defaultValue={EMAIL_PERFIL_CLIENTE}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  defaultValue={TELEFONO_PERFIL_CLIENTE}
                />
              </div>
              <div className="flex flex-col gap-01">
                <Text variant="label-s" color="mid" as="span">
                  DNI
                </Text>
                <FilaArchivoPerfil archivo={ARCHIVO_DNI_PERFIL_CLIENTE} />
              </div>
            </div>
          </section>

          {/* Mis sociedades */}
          <section
            className="anim-aparece flex w-full flex-col gap-06 rounded-md bg-background-base p-06"
            style={retardo(2)}
          >
            <div className="flex flex-wrap items-center justify-between gap-04">
              <Text variant="heading-s" as="h2">
                Mis sociedades
              </Text>
              <SelectorCompacto
                etiqueta="Sociedad"
                ancho="w-[150px]"
                valor={filtroSociedad}
                onChange={setFiltroSociedad}
                opciones={[
                  { value: "", label: "Sociedad" },
                  ...SOCIEDADES_CARTERA.map((s) => ({
                    value: s.id,
                    label: s.nombre,
                  })),
                ]}
              />
            </div>

            <div className="flex w-full flex-col gap-04">
              {sociedadesVisibles.map((s) => (
                <FilaSociedadPerfil
                  key={s.id}
                  sociedad={s}
                  abierta={desplegada === s.id}
                  onAbrir={() =>
                    setDesplegada((d) => (d === s.id ? null : s.id))
                  }
                />
              ))}
            </div>
          </section>

          {/* Seguridad y acceso */}
          <section
            className="anim-aparece flex w-full flex-col gap-06 rounded-md bg-background-base p-06"
            style={retardo(3)}
          >
            <Text variant="heading-m" as="h2">
              Seguridad y acceso
            </Text>
            <div className="flex flex-wrap items-center justify-between gap-04 rounded-md bg-background-low p-04">
              <div className="flex flex-col gap-01">
                <Text variant="label-m" as="span">
                  Contraseña
                </Text>
                <Text variant="body-s" color="low" as="span">
                  {CONTRASENA_ACTUALIZADA_PERFIL_CLIENTE}
                </Text>
              </div>
              <Button variant="secondary" size="small">
                Modificar
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/** La fila de una sociedad dentro de "Mis sociedades": nombre plegado, y sus
 * datos de facturación al desplegarla. */
function FilaSociedadPerfil({
  sociedad,
  abierta,
  onAbrir,
}: {
  sociedad: SociedadCartera;
  abierta: boolean;
  onAbrir: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-md">
      <button
        type="button"
        onClick={onAbrir}
        aria-expanded={abierta}
        aria-label={`${abierta ? "Cerrar" : "Ver"} los datos de ${sociedad.nombre}`}
        className="flex w-full cursor-pointer items-center justify-between gap-04 bg-background-low px-06 py-04 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high"
      >
        <Text variant="label-l" as="span">
          {sociedad.nombre}
        </Text>
        <FlechaPlegar abierto={abierta} />
      </button>

      <div
        className="grid transition-[grid-template-rows] motion-macro-levelup"
        style={{ gridTemplateRows: abierta ? "1fr" : "0fr" }}
        aria-hidden={!abierta}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-04 bg-background-base p-06">
            <div className="grid gap-04 sm:grid-cols-2">
              <Input label="Razón Social" defaultValue={sociedad.nombre} />
              <Input label="CIF" defaultValue={CIF_POR_SOCIEDAD[sociedad.id]} />
            </div>
            <div className="grid gap-04 sm:grid-cols-2">
              <Input
                label="Nombre del titular"
                defaultValue={TITULAR_NUEVO_SUMINISTRO}
              />
              <Input label="DNI" defaultValue={DNI_NUEVO_SUMINISTRO} />
            </div>
            <Input label="IBAN" placeholder="Escribe aquí el IBAN" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Un documento ya subido, de solo lectura (a diferencia de las dropzones de
 * los asistentes, aquí no se puede quitar): la insignia con la extensión,
 * el nombre y el peso, y un icono de descarga. Mismo patrón que el "File
 * item" del Figma (nodo 797:44608) y que las filas de "Documentos". */
function FilaArchivoPerfil({
  archivo,
}: {
  archivo: { nombre: string; extension: string; tamano: string };
}) {
  return (
    <div className="flex items-center justify-between gap-03 rounded-md bg-background-low p-03">
      <div className="flex min-w-0 flex-1 items-center gap-03">
        <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-soft text-body-s text-highlight-muted">
          {archivo.extension}
        </span>
        <span className="flex min-w-0 flex-col">
          <Text variant="body-m" as="span" className="truncate">
            {archivo.nombre}
          </Text>
          <Text variant="body-s" color="low" as="span">
            {archivo.tamano}
          </Text>
        </span>
      </div>
      <button
        type="button"
        aria-label={`Descargar ${archivo.nombre}`}
        className="flex shrink-0 cursor-pointer items-center rounded-md p-02 text-content-high transition-opacity motion-micro-states hover:opacity-60"
      >
        <Icon name="upload" size={20} />
      </button>
    </div>
  );
}
