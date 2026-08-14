"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input, Select } from "@/components/ui/Input";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import {
  DATOS_LEIDOS_PARTICULARES,
  euros,
  PROVINCIAS,
  SUMINISTROS_PARTICULARES,
  TIPOS_DE_VIA,
} from "@/mocks/aczo";
import { retardo, useVisibleAlDesplazar } from "@/lib/prototipo";
import {
  Bloque,
  CabeceraBloque,
  DropzoneIdentidad,
  FilaResumen,
  FirmaCanvas,
} from "../PiezasCambioCompania";
import { HuecoLogo } from "../TarjetaPlan";
import type { ResumenCambioParticulares } from "./PantallaAhorroParticulares";

/**
 * PantallaCambioCompaniaParticulares — pantalla 03 "Cambio de compañía" del
 * flujo de particulares (Figma node 4105:32954). Aparece al pulsar "Hacer el
 * cambio" en "Ahorro y recomendación", que le pasa una foto de la oferta
 * elegida (`ResumenCambioParticulares`) para la columna derecha.
 *
 * LA IDEA DE ESTA PANTALLA: que casi todo venga ya relleno y a la persona
 * solo le quede poner el IBAN y firmar. De dónde sale cada cosa:
 *
 *   - **Nombre y email** — de lo que escribió en el paso 1, al subir la
 *     factura (llegan en `datosContratante`).
 *   - **DNI y toda la dirección del suministro** — "leídos de la factura"
 *     (`DATOS_LEIDOS_PARTICULARES` en mocks/aczo.ts). El bloque lo dice con
 *     una etiqueta, "Detectados de tu factura", como en el Figma.
 *   - **CUPS** — también leído, y va bloqueado: es el identificador del punto
 *     de suministro, no algo que se pueda cambiar a mano.
 *   - **Titular de la cuenta** — se rellena con el nombre de la persona.
 *   - **IBAN y firma** — lo ÚNICO que queda por hacer.
 *
 * DIFERENCIAS CON LA MISMA PANTALLA DE EMPRESAS: aquí no hay sociedades ni
 * apoderados, así que desaparecen el interruptor "¿tramitas en nombre de otra
 * persona?", los poderes de representación, el enlace de firma y el IBAN por
 * sociedad (hay una cuenta, no una por empresa). El teléfono es opcional, tal
 * y como lo marca el Figma.
 *
 * "Activar cambio" está desactivado hasta que hay IBAN, firma y consentimiento
 * de la domiciliación.
 *
 * MICROINTERACCIONES: las mismas que en empresas, porque son las mismas
 * piezas (`PiezasCambioCompania.tsx`) — arrastrar el DNI tiñe la zona de
 * `highlight-soft`, el recuadro de firma cambia de borde y el cursor pasa a
 * cruz, y "Borrar firma" aparece en cuanto hay trazo.
 */

/** El IBAN empieza vacío a propósito: es, con la firma, lo único que se pide. */
const IBAN_PLACEHOLDER = "Ej: ES00 0000 0000 0000";

export function PantallaCambioCompaniaParticulares({
  datosContratante,
  resumen,
  onAtras,
  onContinuar,
}: {
  datosContratante: { nombre: string; email: string };
  resumen: ResumenCambioParticulares;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  const mostrarBarra = useVisibleAlDesplazar();

  // Datos personales: nombre y email vienen del paso 1; el DNI, de la factura.
  const [nombre, setNombre] = useState(datosContratante.nombre);
  const [email, setEmail] = useState(datosContratante.email);
  const [dni, setDni] = useState(DATOS_LEIDOS_PARTICULARES.dni);
  const [telefono, setTelefono] = useState("");
  const [identidadArchivo, setIdentidadArchivo] = useState<string | null>(null);

  // Datos del suministro: todos leídos de la factura, editables por si algo
  // no se leyó bien.
  const [tipoVia, setTipoVia] = useState<string>(DATOS_LEIDOS_PARTICULARES.tipoVia);
  const [nombreVia, setNombreVia] = useState(DATOS_LEIDOS_PARTICULARES.nombreVia);
  const [numero, setNumero] = useState(DATOS_LEIDOS_PARTICULARES.numero);
  const [piso, setPiso] = useState(DATOS_LEIDOS_PARTICULARES.piso);
  const [puerta, setPuerta] = useState(DATOS_LEIDOS_PARTICULARES.puerta);
  const [codigoPostal, setCodigoPostal] = useState(
    DATOS_LEIDOS_PARTICULARES.codigoPostal,
  );
  const [localidad, setLocalidad] = useState(DATOS_LEIDOS_PARTICULARES.localidad);
  const [provincia, setProvincia] = useState<string>(
    DATOS_LEIDOS_PARTICULARES.provincia,
  );

  // Datos bancarios: lo único que falta.
  const [titular, setTitular] = useState(datosContratante.nombre);
  const [iban, setIban] = useState("");
  const [firmado, setFirmado] = useState(false);
  const [domiciliacionAceptada, setDomiciliacionAceptada] = useState(false);

  // El CUPS que se enseña es el del punto de luz; si la oferta elegida solo
  // cubre gas, el de gas. No se puede editar: identifica el punto.
  const cups = (
    SUMINISTROS_PARTICULARES.find((s) => s.tipo === "Luz") ??
    SUMINISTROS_PARTICULARES[0]
  ).detalle.cups;

  const todoCompleto =
    titular.trim() !== "" && iban.trim() !== "" && firmado && domiciliacionAceptada;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
        <div className="flex w-full flex-col rounded-md bg-background-low">
          <div className="layout-section flex flex-col gap-08 py-09">
            <div
              className="anim-aparece flex flex-col items-center gap-03 text-center"
              style={retardo(0)}
            >
              <Text variant="heading-l">Cambio de compañía</Text>
              <Text variant="body-l" color="mid" className="max-w-[600px]">
                Ya hemos rellenado tus datos con lo que leímos de la factura.
                Solo falta la cuenta donde domiciliar y tu firma.
              </Text>
            </div>

            <div className="flex flex-col gap-06 lg:flex-row lg:items-start">
              {/* Columna izquierda ----------------------------------------- */}
              <div className="flex min-w-0 flex-1 flex-col gap-06">
                {/* Bloque 1: datos personales */}
                <Bloque style={retardo(1)}>
                  <CabeceraBloque
                    titulo="Datos personales"
                    descripcion="Los datos de la persona que titula el contrato de luz y gas."
                  />

                  <div className="grid w-full gap-04 sm:grid-cols-2">
                    <Input
                      label="Nombre y apellidos"
                      placeholder="Tu nombre completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                    <Input
                      label="DNI"
                      placeholder="Ej: 38829103B"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      label="Nº de teléfono (opcional)"
                      type="tel"
                      placeholder="Ej: 695 948 394"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>

                  <div className="flex w-full flex-col gap-04">
                    <Text variant="body-m" color="low">
                      Necesitamos verificar tu identidad para poder tramitar el
                      cambio en tu nombre. Sube una foto o documento de tu DNI,
                      NIE o pasaporte.
                    </Text>
                    <DropzoneIdentidad
                      archivo={identidadArchivo}
                      onCambiar={setIdentidadArchivo}
                      titulo="Arrastra tu documento aquí o haz clic para seleccionarlo"
                      ayuda="Una foto o un PDF de tu DNI, NIE o pasaporte"
                    />
                  </div>
                </Bloque>

                {/* Bloque 2: datos del suministro, ya rellenos */}
                <Bloque style={retardo(2)}>
                  <CabeceraBloque
                    titulo="Datos de tu suministro"
                    descripcion="La dirección del punto de suministro que vamos a cambiar. Revísala y corrígela si algo no cuadra."
                    extra={<Tag tone="outline">Detectados de tu factura</Tag>}
                  />

                  <div className="flex w-full flex-col gap-04">
                    <Select
                      label="Tipo de vía"
                      options={TIPOS_DE_VIA}
                      value={tipoVia}
                      onChange={(e) => setTipoVia(e.target.value)}
                    />

                    <div className="grid gap-04 sm:grid-cols-[2fr_1fr]">
                      <Input
                        label="Nombre de la vía"
                        value={nombreVia}
                        onChange={(e) => setNombreVia(e.target.value)}
                      />
                      <Input
                        label="Nº"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-04 sm:grid-cols-3">
                      <Input
                        label="Piso"
                        value={piso}
                        onChange={(e) => setPiso(e.target.value)}
                      />
                      <Input
                        label="Puerta"
                        value={puerta}
                        onChange={(e) => setPuerta(e.target.value)}
                      />
                      <Input
                        label="Código Postal"
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-04 sm:grid-cols-2">
                      <Input
                        label="Localidad"
                        value={localidad}
                        onChange={(e) => setLocalidad(e.target.value)}
                      />
                      <Select
                        label="Provincia"
                        options={PROVINCIAS}
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                      />
                    </div>

                    {/* Bloqueado: el CUPS identifica el punto de suministro,
                        no es un dato que se pueda corregir a mano. */}
                    <Input label="CUPS" value={cups} disabled readOnly />
                  </div>
                </Bloque>

                {/* Bloque 3: lo único que queda por rellenar */}
                <Bloque style={retardo(3)}>
                  <CabeceraBloque
                    titulo="Datos bancarios"
                    descripcion="La cuenta donde domiciliar tus facturas, y tu firma para autorizar el cambio."
                  />

                  <div className="flex w-full flex-col gap-04">
                    <Input
                      label="Titular"
                      placeholder="Nombre de quien titula la cuenta"
                      value={titular}
                      onChange={(e) => setTitular(e.target.value)}
                    />
                    <Input
                      label="IBAN"
                      placeholder={IBAN_PLACEHOLDER}
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                    />
                  </div>

                  <FirmaCanvas firmado={firmado} onCambiarFirmado={setFirmado} />

                  <Checkbox
                    checked={domiciliacionAceptada}
                    onChange={setDomiciliacionAceptada}
                  >
                    En Aczo no guardamos la información de tus datos de pago.
                    Nuestros amigos de GoCardless se encargan de pagos seguros.
                    Al hacer clic aquí, autorizas la domiciliación de tus
                    facturas y aceptas el mandato SEPA.
                  </Checkbox>
                </Bloque>
              </div>

              {/* Columna derecha ------------------------------------------- */}
              <aside className="flex w-full shrink-0 flex-col gap-04 lg:w-[360px]">
                <Bloque style={retardo(2)}>
                  <Text variant="heading-s" as="h3">
                    Resumen de tu cambio
                  </Text>

                  <div className="flex w-full flex-col gap-03">
                    <Text variant="body-s" color="mid" as="span">
                      Comercializadora:
                    </Text>
                    <div className="flex flex-wrap gap-02">
                      <HuecoLogo nombre={resumen.comercializadora} />
                    </div>
                  </div>

                  <dl className="flex w-full flex-col gap-02">
                    <FilaResumen etiqueta="Puntos de suministro">
                      {resumen.puntos}
                    </FilaResumen>
                    <FilaResumen etiqueta="Mantenimiento incluido">
                      {resumen.puntosConMantenimiento === 0
                        ? "No incluido"
                        : `${resumen.puntosConMantenimiento} ${
                            resumen.puntosConMantenimiento === 1 ? "punto" : "puntos"
                          }`}
                    </FilaResumen>
                  </dl>

                  <div className="flex w-full items-end justify-between gap-04 border-t border-border-low pt-04">
                    <div className="flex flex-col">
                      <Text variant="body-s" color="mid" as="span">
                        Ahorro estimado total
                      </Text>
                      <span className="font-heading text-heading-m text-content-high">
                        +{euros(resumen.ahorroAnual)} €/año
                      </span>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer pb-01 text-body-s text-content-high underline transition-opacity motion-micro-states hover:opacity-60"
                    >
                      Ver desglose
                    </button>
                  </div>
                </Bloque>

                {/* Banda "Aczo garantiza": superficie oscura fija (no cambia
                    entre modos), por eso el texto y el botón van en tonos
                    claros. El dibujo de la esquina es el patrón de marca,
                    decorativo. Misma banda que en empresas. */}
                <div
                  className="anim-aparece flex items-start rounded-lg bg-highlight-deep pb-05 pl-06"
                  style={retardo(3)}
                >
                  <div className="flex min-w-0 flex-1 flex-col items-start justify-center pt-06">
                    <div className="flex flex-col gap-01">
                      <Text variant="heading-s" color="always-light" as="h4">
                        Aczo garantiza
                      </Text>
                      <Text variant="body-m" color="always-light">
                        Firma digital segura · Sin coste oculto · Cancela cuando
                        quieras
                      </Text>
                    </div>
                    <Button
                      variant="tertiary"
                      feedback="highlight"
                      size="small"
                      className="self-start pr-09 underline"
                    >
                      Ver condiciones
                    </Button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG decorativo, no necesita optimización de next/image. */}
                  <img
                    src="/patron-garantia.svg"
                    alt=""
                    className="h-[71px] w-[107px] shrink-0"
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior: mismo patrón que el resto del flujo — no aparece
          hasta que se empieza a bajar. */}
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
          <Button
            iconEnd="chevron-right"
            disabled={!todoCompleto}
            onClick={onContinuar}
            className="transition-colors motion-micro-states"
          >
            Activar cambio
          </Button>
        </div>
      </div>
    </div>
  );
}
