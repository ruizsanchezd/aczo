"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { euros, SOCIEDADES } from "@/mocks/aczo";
import { retardo } from "@/lib/prototipo";
import { HuecoLogo } from "../TarjetaPlan";
import type { ResumenCambioEmpresas } from "./PantallaAhorroEmpresas";

/**
 * PantallaCambioCompaniaEmpresas — pantalla 03 "Cambio de compañía" del
 * flujo de empresas. Aparece al pulsar "Hacer el cambio" en "Tu ahorro
 * potencial" (`PantallaAhorroEmpresas`), que le pasa una foto del plan
 * elegido en ese momento (`ResumenCambioEmpresas`) para la columna derecha.
 *
 * DOS FLUJOS, según el interruptor "¿Tramitas este proceso en nombre de
 * otra persona?" (por defecto apagado = tramita standard):
 *
 *   APAGADO (tramita standard) — la propia persona que gestiona el cambio
 *   puede autorizarlo:
 *     1. Datos de quien tramita (nombre y email ya vienen rellenados con
 *        los datos de la pantalla de subida de facturas).
 *     2. Verificación de identidad: sube una foto o escaneo del DNI/NIE.
 *     3. IBAN por sociedad.
 *     4. Firma de autorización: dibuja la firma + declaración de poderes.
 *
 *   ENCENDIDO (tramita en nombre de otra persona) — quien rellena el
 *   formulario NO es quien puede autorizar, así que cambian los pasos 2 y 4:
 *     - Ya no hace falta verificar identidad (no es esa persona la que firma).
 *     - En vez de firmar aquí, se elige CÓMO se autoriza, con dos tarjetas de
 *       opción que NO despliegan nada por dentro: comparten un mismo hueco
 *       debajo, según cuál esté elegida.
 *         · "Tengo los poderes": una zona de subida compacta
 *           (`DropzonePoderes`). En cuanto hay al menos un archivo, se
 *           sustituye por un aviso de éxito (`ArchivosCargados`) y aparece
 *           un bloque de "Firma de autorización" — igual que en tramita
 *           standard, pero con una casilla más (confidencialidad de la
 *           documentación aportada).
 *         · "No tengo el poder": un enlace ya generado con botón "Copiar"
 *           (`EnlaceFirma`) — no hace falta recoger nombre ni email, se
 *           comparte el enlace por el canal que se prefiera.
 *
 * TODOS LOS CAMPOS SON OBLIGATORIOS: "Activar cambio" está desactivado
 * (`disabled`) hasta que se completan todos los pasos del flujo activo (con
 * "No tengo el poder" no hay nada más que completar: el enlace ya está listo
 * en cuanto se elige esa opción).
 *
 * MICROINTERACCIONES:
 *   - Arrastrar el DNI o los poderes sobre su zona de subida: borde y fondo
 *     `highlight-soft`.
 *   - Firma: el recuadro cambia de borde al pasar el ratón por encima y el
 *     cursor pasa a cruz mientras se puede dibujar; "Borrar firma" aparece
 *     en cuanto hay un trazo.
 *   - "Copiar" el enlace de firma cambia a "Copiado" durante 2 segundos.
 *   - El contador "n/3 completados" del IBAN reacciona al instante
 *     (`motion-micro-states`), igual que en `PantallaFirma.tsx`.
 */

type FormaAutorizar = "tengo-poderes" | "que-firme-otro";
type DatosIban = { titular: string; dni: string; iban: string };

export function PantallaCambioCompaniaEmpresas({
  datosContratante,
  resumen,
  onAtras,
  onContinuar,
}: {
  datosContratante: { nombre: string; email: string };
  resumen: ResumenCambioEmpresas;
  onAtras: () => void;
  onContinuar: () => void;
}) {
  const [enNombreDeOtro, setEnNombreDeOtro] = useState(false);

  // Datos de quien tramita: nombre y email llegan ya rellenados.
  const [nombre, setNombre] = useState(datosContratante.nombre);
  const [email, setEmail] = useState(datosContratante.email);
  const [dni, setDni] = useState("");
  const [cargo, setCargo] = useState("");

  // Verificación de identidad (solo tramita standard).
  const [identidadArchivo, setIdentidadArchivo] = useState<string | null>(null);

  // IBAN por sociedad.
  const [datosIban, setDatosIban] = useState<Record<string, DatosIban>>({});

  // Firma de autorización: en tramita standard se ve siempre; en nombre de
  // otra persona solo si se suben los poderes (por eso comparte estado con
  // ese caso — nunca se ven los dos a la vez).
  const [firmado, setFirmado] = useState(false);
  const [declaracionAceptada, setDeclaracionAceptada] = useState(false);
  const [confidencialidadAceptada, setConfidencialidadAceptada] = useState(false);

  // Cómo autorizar (solo en nombre de otra persona).
  const [formaAutorizar, setFormaAutorizar] = useState<FormaAutorizar>("tengo-poderes");
  const [poderesArchivos, setPoderesArchivos] = useState<string[]>([]);

  const sociedadesIncluidas = SOCIEDADES.filter((s) =>
    resumen.sociedadesIds.includes(s.id),
  );

  const ibanCompletados = sociedadesIncluidas.filter((s) => {
    const d = datosIban[s.id];
    return d?.titular.trim() && d?.dni.trim() && d?.iban.trim();
  }).length;

  function actualizarIban(sociedadId: string, campo: keyof DatosIban, valor: string) {
    setDatosIban((prev) => {
      const actual = prev[sociedadId] ?? { titular: "", dni: "", iban: "" };
      return { ...prev, [sociedadId]: { ...actual, [campo]: valor } };
    });
  }

  const datosTramitanteCompletos =
    nombre.trim() !== "" &&
    email.trim() !== "" &&
    dni.trim() !== "" &&
    cargo.trim() !== "";
  const ibanCompleto = ibanCompletados === sociedadesIncluidas.length;
  const identidadCompleta = enNombreDeOtro || identidadArchivo !== null;
  // Con poderes: hace falta subir el documento Y firmar. Enviando la
  // solicitud a la persona representante no hay nada más que completar aquí
  // — el enlace ya está listo para copiar en cuanto se elige esa opción.
  const autorizacionCompleta = enNombreDeOtro
    ? formaAutorizar === "tengo-poderes"
      ? poderesArchivos.length > 0 &&
        firmado &&
        declaracionAceptada &&
        confidencialidadAceptada
      : true
    : firmado && declaracionAceptada;

  const todoCompleto =
    datosTramitanteCompletos && identidadCompleta && ibanCompleto && autorizacionCompleta;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
        <div className="flex w-full flex-col rounded-md bg-background-low">
          <div className="layout-section flex flex-col gap-08 py-09">
            <div className="anim-aparece flex flex-col items-center gap-03 text-center" style={retardo(0)}>
              <Text variant="heading-l">Cambio de compañía</Text>
              <Text variant="body-l" color="mid" className="max-w-[600px]">
                Para tramitar el cambio en nombre de las sociedades necesitamos al
                apoderado, su firma y el poder que lo acredite.
              </Text>
            </div>

            <div className="flex flex-col gap-06 lg:flex-row lg:items-start">
              {/* Columna izquierda ----------------------------------------- */}
              <div className="flex min-w-0 flex-1 flex-col gap-06">
                {/* Bloque 1: quién tramita */}
                <Bloque style={retardo(1)}>
                  <CabeceraBloque
                    titulo="Datos de quien tramita"
                    descripcion="Datos de la persona que tiene los poderes para tramitar el cambio."
                  />

                  <div className="grid w-full gap-04 sm:grid-cols-2">
                    <Input
                      label="Nombre y apellidos"
                      placeholder="Tu nombre completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="nombre@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      label="DNI/NIE"
                      placeholder="Ej: 38582948P"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                    />
                    <Input
                      label="Cargo"
                      placeholder="Admin."
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-03">
                    <Switch
                      checked={enNombreDeOtro}
                      onChange={setEnNombreDeOtro}
                      label="Tramitas este proceso en nombre de otra persona"
                    />
                    <Text variant="body-m" as="span">
                      ¿Tramitas este proceso en nombre de otra persona?
                    </Text>
                  </div>

                  {/* Verificación de identidad: solo si tramita para sí
                      misma — si tramita en nombre de otra persona, no es
                      esta persona la que necesita quedar identificada. */}
                  {!enNombreDeOtro && (
                    <div className="flex w-full flex-col gap-04">
                      <Text variant="body-m" color="low">
                        Necesitamos verificar tu identidad para poder tramitar el
                        cambio en tu nombre. Sube una foto o escanea tu DNI, NIE o
                        pasaporte.
                      </Text>
                      <DropzoneIdentidad
                        archivo={identidadArchivo}
                        onCambiar={setIdentidadArchivo}
                      />
                    </div>
                  )}
                </Bloque>

                {/* Bloque 2: IBAN por sociedad */}
                <Bloque style={retardo(2)}>
                  <div className="flex w-full items-start justify-between gap-04">
                    <CabeceraBloque
                      titulo="Necesitamos el IBAN para domiciliar los cobros"
                      descripcion="Es necesario que nos facilites los IBAN de las cuentas bancarias para poder gestionar la domiciliación bancaria."
                    />
                    <Tag tone="highlight" className="shrink-0 transition-colors motion-micro-states">
                      {ibanCompletados}/{sociedadesIncluidas.length} completados
                    </Tag>
                  </div>

                  <div className="flex w-full flex-col gap-04">
                    {sociedadesIncluidas.map((sociedad) => (
                      <div
                        key={sociedad.id}
                        className="flex flex-col gap-04 rounded-md border border-border-low bg-background-low p-06"
                      >
                        <div className="flex flex-col">
                          <Text variant="label-l" as="h4">
                            {sociedad.nombre}
                          </Text>
                          <Text variant="body-m" color="mid">
                            CIF {sociedad.cif}
                          </Text>
                        </div>

                        <div className="grid gap-04 sm:grid-cols-2">
                          <Input
                            label="Nombre del titular"
                            placeholder="Ej: Carlos Sánchez"
                            value={datosIban[sociedad.id]?.titular ?? ""}
                            onChange={(e) =>
                              actualizarIban(sociedad.id, "titular", e.target.value)
                            }
                          />
                          <Input
                            label="DNI"
                            placeholder="Ej: 30329203P"
                            value={datosIban[sociedad.id]?.dni ?? ""}
                            onChange={(e) =>
                              actualizarIban(sociedad.id, "dni", e.target.value)
                            }
                          />
                        </div>
                        <Input
                          label="IBAN"
                          placeholder="ES00 000 000 000 000"
                          value={datosIban[sociedad.id]?.iban ?? ""}
                          onChange={(e) =>
                            actualizarIban(sociedad.id, "iban", e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Bloque>

                {/* Bloque 3: autorización — firma propia o, si tramita en
                    nombre de otra persona, cómo se consigue esa firma. */}
                {!enNombreDeOtro ? (
                  <Bloque style={retardo(3)}>
                    <CabeceraBloque
                      titulo="Firma de autorización"
                      descripcion="Dibuja tu firma en el recuadro para validar la autorización de todas las sociedades."
                    />
                    <FirmaCanvas firmado={firmado} onCambiarFirmado={setFirmado} />
                    <Checkbox
                      checked={declaracionAceptada}
                      onChange={setDeclaracionAceptada}
                    >
                      Declaro que ostento poderes suficientes para representar a{" "}
                      {listaConY(sociedadesIncluidas.map((s) => s.nombre))}, y
                      autorizo el cambio de comercializadora y la domiciliación en
                      los IBAN facilitados.
                    </Checkbox>
                  </Bloque>
                ) : (
                  <>
                    <Bloque style={retardo(3)}>
                      <Text variant="heading-s" as="h3">
                        ¿Cómo quieres autorizar el cambio?
                      </Text>

                      <div className="grid w-full gap-04 sm:grid-cols-2">
                        <TarjetaOpcion
                          elegida={formaAutorizar === "tengo-poderes"}
                          onElegir={() => setFormaAutorizar("tengo-poderes")}
                          titulo="Tengo los poderes"
                          descripcion="Sube uno o varios poderes de representación, los emparejaremos automáticamente con cada sociedad según el CIF que detectemos en el documento."
                        />

                        <TarjetaOpcion
                          elegida={formaAutorizar === "que-firme-otro"}
                          onElegir={() => setFormaAutorizar("que-firme-otro")}
                          titulo="No tengo el poder, enviar solicitud de firma a la persona representante"
                          descripcion="Enviaremos un enlace de firma al administrador o apoderado de cada sociedad para que autorice el cambio directamente."
                        />
                      </div>

                      {/* El contenido de cada opción no va DENTRO de su tarjeta:
                          las dos comparten este mismo hueco de abajo, según cuál
                          esté elegida (así lo marca el Figma — ninguna tarjeta
                          se despliega por dentro). */}
                      {formaAutorizar === "tengo-poderes" ? (
                        poderesArchivos.length > 0 ? (
                          <ArchivosCargados cantidad={poderesArchivos.length} />
                        ) : (
                          <DropzonePoderes onSubir={setPoderesArchivos} />
                        )
                      ) : (
                        <EnlaceFirma />
                      )}
                    </Bloque>

                    {/* Firma de autorización: solo aparece con "Tengo los
                        poderes" y en cuanto se ha subido al menos un
                        documento — antes no hay nada que firmar todavía. */}
                    {formaAutorizar === "tengo-poderes" && poderesArchivos.length > 0 && (
                      <Bloque style={retardo(4)}>
                        <CabeceraBloque
                          titulo="Firma de autorización"
                          descripcion="Dibuja tu firma en el recuadro para validar la autorización de todas las sociedades."
                        />
                        <FirmaCanvas firmado={firmado} onCambiarFirmado={setFirmado} />
                        <Checkbox
                          checked={declaracionAceptada}
                          onChange={setDeclaracionAceptada}
                        >
                          Declaro que ostento poderes suficientes para representar a{" "}
                          {listaConY(sociedadesIncluidas.map((s) => s.nombre))}, y
                          autorizo el cambio de comercializadora y la domiciliación
                          en los IBAN facilitados.
                        </Checkbox>
                        <Checkbox
                          checked={confidencialidadAceptada}
                          onChange={setConfidencialidadAceptada}
                        >
                          Confirmo que la documentación aportada es veraz y me
                          responsabilizo de su confidencialidad.
                        </Checkbox>
                      </Bloque>
                    )}
                  </>
                )}
              </div>

              {/* Columna derecha ------------------------------------------- */}
              <aside className="flex w-full shrink-0 flex-col gap-04 lg:w-[360px]">
                <Bloque style={retardo(2)}>
                  <Text variant="heading-s" as="h3">
                    Resumen de tu cambio
                  </Text>

                  <dl className="flex w-full flex-col gap-02">
                    <FilaResumen etiqueta="Sociedades incluidas">
                      {resumen.sociedadesIds.length}
                    </FilaResumen>
                    <FilaResumen etiqueta="Puntos de suministro">
                      {resumen.totalPuntos}
                    </FilaResumen>
                    <FilaResumen etiqueta="Mantenimiento incluido">
                      {resumen.puntosConMantenimiento} puntos
                    </FilaResumen>
                  </dl>

                  <div className="flex w-full flex-col gap-03">
                    <Text variant="body-s" color="mid" as="span">
                      Comercializadoras:
                    </Text>
                    <div className="flex flex-wrap gap-02">
                      {resumen.comercializadoras.map((c) => (
                        <HuecoLogo key={c.id} nombre={c.nombre} />
                      ))}
                    </div>
                  </div>

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
                    claros. El dibujo de la esquina es decorativo (patrón de
                    marca), sin icono de escudo — a diferencia de la versión
                    del recorrido particular, este Figma no lo lleva. */}
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
                      Ver detalle completo
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

      {/* Barra inferior: mismo patrón que el resto del flujo de empresas. */}
      <div className="sticky bottom-00 z-10 bg-background-base">
        <div className="layout-section flex items-center justify-between py-04">
          <Button variant="secondary" iconStart="chevron-left" onClick={onAtras}>
            Atrás
          </Button>
          <Button iconEnd="chevron-right" disabled={!todoCompleto} onClick={onContinuar}>
            Activar cambio
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Piezas de esta pantalla                                                    */
/* -------------------------------------------------------------------------- */

function Bloque({
  style,
  children,
}: {
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section
      className="anim-aparece flex w-full flex-col gap-06 rounded-md bg-background-base p-06"
      style={style}
    >
      {children}
    </section>
  );
}

function CabeceraBloque({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex w-full flex-col gap-01">
      <Text variant="heading-s" as="h3">
        {titulo}
      </Text>
      <Text variant="body-m" color="low">
        {descripcion}
      </Text>
    </div>
  );
}

function FilaResumen({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-04">
      <dt className="text-label-s-uppercase text-content-mid">{etiqueta}</dt>
      <dd className="text-body-s text-content-high tabular-nums">{children}</dd>
    </div>
  );
}

/** "A, B y C" — para la frase de la declaración de poderes. */
function listaConY(nombres: string[]): string {
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

/**
 * DropzoneIdentidad — subir una foto o escaneo del DNI/NIE/pasaporte.
 *
 * Un solo archivo (a diferencia de la subida de facturas, aquí no tiene
 * sentido más de un documento de identidad): al soltar uno nuevo, sustituye
 * al anterior. Mismo patrón de arrastre que `PantallaSubidaEmpresas`
 * (borde + fondo `highlight-soft`, icono que crece un poco al arrastrar).
 */
function DropzoneIdentidad({
  archivo,
  onCambiar,
}: {
  archivo: string | null;
  onCambiar: (nombre: string | null) => void;
}) {
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function elegir(lista: FileList | null) {
    const primero = lista?.[0];
    if (primero) onCambiar(primero.name);
  }

  if (archivo) {
    return (
      <div className="anim-aparece flex items-center gap-02 rounded-md border border-border-low bg-background-base p-04">
        <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-soft text-content-high">
          <Icon name="document" size={20} />
        </span>
        <Text variant="body-m" as="span" className="min-w-0 flex-1 truncate">
          {archivo}
        </Text>
        <Tag tone="success">DNI subido</Tag>
        <button
          type="button"
          onClick={() => onCambiar(null)}
          aria-label="Quitar documento de identidad"
          className="flex shrink-0 items-center justify-center rounded-sm p-01 text-content-mid transition-opacity motion-micro-states hover:opacity-60"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastrando(false);
        elegir(e.dataTransfer.files);
      }}
      className={[
        "flex h-[266px] w-full cursor-pointer flex-col items-center justify-center gap-06 rounded-md border px-09",
        "transition-colors motion-micro-states",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        arrastrando
          ? "border-highlight-muted bg-highlight-soft"
          : "border-border-low bg-background-low",
      ].join(" ")}
    >
      <span
        className={[
          "flex size-[56px] items-center justify-center rounded-md bg-highlight-soft text-content-high",
          "transition-transform motion-micro-states",
          arrastrando ? "scale-105" : "scale-100",
        ].join(" ")}
      >
        <Icon name="upload" size={24} />
      </span>
      <span className="flex flex-col items-center gap-02">
        <Text variant="label-l" as="span">
          Arrastra tus facturas aquí o haz clic para seleccionar archivos
        </Text>
        <Text variant="body-m" color="low" as="span">
          Una foto, un PDF o ZIP con varias facturas
        </Text>
      </span>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => elegir(e.target.files)}
        className="hidden"
      />
    </button>
  );
}

/**
 * FirmaCanvas — recuadro donde dibujar la firma con el ratón o el dedo.
 *
 * Se dibuja con un `<canvas>`: es el único elemento HTML pensado para trazos
 * libres. El tamaño en píxeles del lienzo se ajusta una vez al medido real
 * del recuadro (para que el trazo no salga borroso ni desproporcionado),
 * así que al cambiar el ancho de la ventana se pierde el trazo — aceptable
 * en un prototipo, se avisa con el comentario por si se replica en el repo
 * real (ahí conviene un ResizeObserver que reescale sin borrar).
 */
function FirmaCanvas({
  firmado,
  onCambiarFirmado,
}: {
  firmado: boolean;
  onCambiarFirmado: (firmado: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujandoRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  function coordenadas(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function alBajar(e: React.PointerEvent<HTMLCanvasElement>) {
    dibujandoRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = coordenadas(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function alMover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujandoRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = coordenadas(e);
    // Negro fijo, no un token: el lienzo dibuja píxeles, no puede leer
    // variables CSS. Coincide con content-high en modo claro (el único
    // modo del producto).
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!firmado) onCambiarFirmado(true);
  }

  function borrar() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onCambiarFirmado(false);
  }

  return (
    <div className="flex w-full flex-col gap-02">
      <div
        className={[
          "relative h-[160px] w-full rounded-md border border-dashed bg-background-low",
          "transition-colors motion-micro-states",
          firmado ? "border-highlight-muted" : "border-border-mid hover:border-border-high",
        ].join(" ")}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={() => (dibujandoRef.current = false)}
          onPointerLeave={() => (dibujandoRef.current = false)}
          className="size-full touch-none rounded-md cursor-crosshair"
        />
        {!firmado && (
          <Text
            variant="body-m"
            color="low"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            Firma aquí usando el ratón o trackpad
          </Text>
        )}
      </div>
      {firmado && (
        <button
          type="button"
          onClick={borrar}
          className="anim-aparece flex items-center gap-01 self-start text-body-s text-content-mid underline transition-opacity motion-micro-states hover:opacity-60"
        >
          <Icon name="trash" size={14} />
          Borrar firma
        </button>
      )}
    </div>
  );
}

/** Tarjeta de opción única. A diferencia de `PantallaFirma.tsx` (recorrido
 * particular), aquí ninguna tarjeta despliega contenido por dentro: las dos
 * comparten un mismo hueco debajo de la rejilla, según cuál esté elegida —
 * así lo marca este Figma. */
function TarjetaOpcion({
  elegida,
  onElegir,
  titulo,
  descripcion,
}: {
  elegida: boolean;
  onElegir: () => void;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-03 rounded-md border p-05",
        "transition-colors motion-micro-states",
        elegida
          ? "border-highlight-muted bg-background-base"
          : "border-border-low bg-background-base hover:border-border-mid",
      ].join(" ")}
    >
      <Radio
        name="forma-autorizar-empresas"
        checked={elegida}
        onChange={onElegir}
        className="[&_label]:text-label-m"
      >
        {titulo}
      </Radio>

      <Text variant="body-m" color="mid">
        {descripcion}
      </Text>
    </div>
  );
}

/**
 * DropzonePoderes — subir uno o varios poderes de representación.
 *
 * Compacta (a diferencia de `DropzoneIdentidad`, que es la grande de arriba):
 * este Figma la dibuja como una franja fina con borde punteado, sin la
 * casilla de icono en amarillo.
 */
function DropzonePoderes({ onSubir }: { onSubir: (documentos: string[]) => void }) {
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function anadir(archivos: FileList | null) {
    if (!archivos?.length) return;
    onSubir([...archivos].map((f) => f.name));
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastrando(false);
        anadir(e.dataTransfer.files);
      }}
      className={[
        "flex w-full cursor-pointer flex-col items-center justify-center gap-02 rounded-sm border border-dashed p-05",
        "transition-colors motion-micro-states",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
        arrastrando
          ? "border-highlight-muted bg-highlight-soft"
          : "border-content-low bg-background-low",
      ].join(" ")}
    >
      <Icon name="upload" size={20} />
      <Text variant="body-s" as="span" className="text-center">
        Arrastra tu archivo aquí o haz clic para seleccionar
      </Text>
      <Text variant="body-s" color="low" as="span" className="text-center">
        PDF, JPG, PNG — máx. 10 MB
      </Text>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => anadir(e.target.files)}
        className="hidden"
      />
    </button>
  );
}

/** Aviso de éxito tras subir el/los poder(es) — sustituye a la lista de
 * archivos de antes: este Figma solo enseña la confirmación agregada. */
function ArchivosCargados({ cantidad }: { cantidad: number }) {
  return (
    <div className="anim-aparece flex w-full flex-col items-center gap-02 rounded-sm border border-success-high bg-success-low p-05">
      <Icon name="check" size={20} className="text-success-high" />
      <p className="text-label-s text-center text-success-high">
        {cantidad === 1 ? "Archivo cargado correctamente" : "Archivos cargados correctamente"}
      </p>
      <p className="text-body-s text-center text-success-high">
        PDF, JPG, PNG — máx. 10 MB
      </p>
    </div>
  );
}

/** Enlace de firma para la persona representante, con botón de copiar. No
 * hace falta recoger nombre ni email: el enlace ya está listo, y quien
 * tramita lo comparte por el canal que prefiera. */
function EnlaceFirma() {
  const [copiado, setCopiado] = useState(false);
  // Dato de mentira: en el repo real este enlace lo genera el backend, uno
  // distinto por cada solicitud.
  const enlace = "https://aczo.com/firma-representante-cambio.com";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
    } catch {
      // Sin permiso de portapapeles: el enlace sigue ahí, se puede
      // seleccionar y copiar a mano — no bloquea nada.
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex w-full flex-col gap-04 rounded-md bg-background-low p-04">
      <Text variant="label-s-uppercase" color="low" as="span">
        Link
      </Text>
      <div className="flex items-center justify-between gap-04 rounded-sm bg-background-base p-03">
        <Text
          variant="body-m"
          as="span"
          className="min-w-0 truncate text-extended-five-dark"
        >
          {enlace}
        </Text>
        <Button
          variant="tertiary"
          size="small"
          onClick={copiar}
          className="shrink-0"
        >
          {copiado ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
