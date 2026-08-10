"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Text } from "@/components/ui/Text";
import { retardo } from "@/lib/prototipo";

/**
 * PantallaSubidaEmpresas — paso 1 del flujo de empresas: "Sube las facturas
 * de tus sociedades" (/empresas). Del frame "Aczo / Landing / Desktop" del
 * Figma máster, subida "Subida de documentos".
 *
 * Los tres estados de la maqueta (zona vacía → subiendo → subido) no son tres
 * pantallas distintas: son el mismo componente reaccionando a `archivos`.
 *
 * ANIMACIONES (para replicar en el repo real):
 *
 * 1. Zona de arrastre: al pasar un archivo por encima, borde y fondo pasan a
 *    oliva y el icono crece un 5%, con motion-micro-states (200 ms). Igual
 *    que en la subida particular, para que se sienta receptiva al instante.
 *
 * 2. Como no hay backend, cada archivo "sube" solo: el progreso avanza a
 *    saltos aleatorios cada 180 ms hasta llegar a 100%, momento en el que la
 *    barra y el "Subiendo… X%" se sustituyen por el tamaño del archivo. Es lo
 *    que hace que la lista se note viva en vez de aparecer ya terminada.
 *
 * 3. Quitar un archivo no lo borra de golpe: se encoge y se desvanece con
 *    motion-micro-leave (250 ms) antes de salir de la lista de verdad.
 *
 * 4. El botón "Analizar facturas" está desactivado hasta que se cumplen las
 *    condiciones (archivos subidos + nombre + email + las dos casillas). El
 *    paso de desactivado a activo lleva una transición de color
 *    (motion-micro-states): se nota el momento en que "ya se puede seguir".
 */

const AYUDA =
  "Sube todas las facturas de luz, gas o ambas. Puedes arrastrar una foto, un PDF o un ZIP. Cuantas más facturas de un mismo CUPS, más preciso será el cálculo de tu ahorro.";

type EstadoArchivo = "subiendo" | "listo" | "saliendo";

type Archivo = {
  id: string;
  nombre: string;
  extension: string;
  tamanoBytes: number;
  progreso: number;
  estado: EstadoArchivo;
};

function formatoTamano(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function BadgeArchivo({ extension }: { extension: string }) {
  return (
    <span className="flex size-08 shrink-0 items-center justify-center rounded-md bg-highlight-soft text-body-s text-highlight-muted">
      {extension}
    </span>
  );
}

export function PantallaSubidaEmpresas({
  onContinuar,
}: {
  /** Aún no hay una pantalla 2 a la que ir: por eso es opcional. */
  onContinuar?: () => void;
}) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [confirmaDatos, setConfirmaDatos] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subida simulada: mientras haya archivos "subiendo", el progreso avanza
  // solo. Sin backend real, es la única forma de que la barra se note viva.
  useEffect(() => {
    if (!archivos.some((a) => a.estado === "subiendo")) return;

    const intervalo = setInterval(() => {
      setArchivos((prev) =>
        prev.map((a) => {
          if (a.estado !== "subiendo") return a;
          const siguiente = a.progreso + 8 + Math.random() * 20;
          return siguiente >= 100
            ? { ...a, progreso: 100, estado: "listo" as const }
            : { ...a, progreso: siguiente };
        }),
      );
    }, 180);

    return () => clearInterval(intervalo);
  }, [archivos]);

  function anadir(lista: FileList | null) {
    if (!lista?.length) return;
    const nuevos: Archivo[] = [...lista].map((f, i) => ({
      id: `${f.name}-${Date.now()}-${i}`,
      nombre: f.name,
      extension:
        (f.name.split(".").pop() || "").toUpperCase().slice(0, 4) || "DOC",
      tamanoBytes: f.size,
      progreso: 0,
      estado: "subiendo" as const,
    }));
    setArchivos((prev) => [...prev, ...nuevos]);
  }

  function quitar(id: string) {
    // Se marca "saliendo" para que se desvanezca antes de quitarlo de verdad.
    setArchivos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: "saliendo" as const } : a)),
    );
    setTimeout(() => {
      setArchivos((prev) => prev.filter((a) => a.id !== id));
    }, 250);
  }

  const hayArchivos = archivos.length > 0;
  const todosListos =
    hayArchivos && archivos.every((a) => a.estado !== "subiendo");
  const listoParaContinuar =
    todosListos &&
    nombre.trim() !== "" &&
    email.trim() !== "" &&
    aceptaPrivacidad &&
    confirmaDatos;

  return (
    <div className="flex flex-1 flex-col items-center bg-background-base px-06 pb-06">
      <div className="flex w-full flex-col rounded-md bg-background-low">
        <div className="flex flex-col items-center gap-10 px-[140px] pt-10 pb-07">
          <div
            className="anim-aparece flex flex-col items-center gap-04 text-center"
            style={retardo(0)}
          >
            <Text variant="heading-xl">Sube las facturas de tus sociedades</Text>
            <Text variant="body-l" color="low" className="max-w-[800px]">
              {AYUDA}
            </Text>
          </div>

          <div className="flex w-full flex-col items-center gap-06">
            {/* Zona de arrastre — solo antes de soltar el primer archivo. */}
            {!hayArchivos && (
              <div
                className="anim-aparece w-full max-w-[800px]"
                style={retardo(1)}
              >
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
                    "flex h-[266px] w-full cursor-pointer flex-col items-center justify-center gap-06 rounded-md border px-09",
                    "transition-colors motion-micro-states",
                    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
                    arrastrando
                      ? "border-highlight-muted bg-highlight-soft"
                      : "border-border-low bg-background-base",
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
                      Arrastra tus facturas aquí o haz clic para seleccionar
                      archivos
                    </Text>
                    <Text variant="body-m" color="low" as="span">
                      Una foto, un PDF o ZIP con varias facturas
                    </Text>
                  </span>
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.zip"
              onChange={(e) => anadir(e.target.files)}
              className="hidden"
            />

            {/* Lista de archivos — sustituye a la zona de arrastre en cuanto hay al menos uno. */}
            {hayArchivos && (
              <div className="anim-aparece flex w-full max-w-[800px] flex-col gap-02 rounded-md border border-border-low bg-background-base p-04">
                {archivos.map((archivo, i) => (
                  <div
                    key={archivo.id}
                    className={[
                      "flex items-center justify-between gap-03 rounded-md bg-background-low p-03",
                      "transition-all motion-micro-leave",
                      archivo.estado === "saliendo"
                        ? "scale-95 opacity-0"
                        : "anim-aparece scale-100 opacity-100",
                    ].join(" ")}
                    style={archivo.estado === "saliendo" ? undefined : retardo(i)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-03">
                      <BadgeArchivo extension={archivo.extension} />
                      <div className="flex min-w-0 flex-1 flex-col gap-01">
                        <Text variant="body-m" className="truncate">
                          {archivo.nombre}
                        </Text>
                        {archivo.estado === "subiendo" ? (
                          <>
                            <Text
                              variant="body-s"
                              as="span"
                              className="text-highlight-muted"
                            >
                              Subiendo… {Math.round(archivo.progreso)}%
                            </Text>
                            <ProgressBar
                              value={archivo.progreso}
                              showValue={false}
                            />
                          </>
                        ) : (
                          <Text variant="body-s" color="low">
                            {formatoTamano(archivo.tamanoBytes)}
                          </Text>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="tertiary"
                      size="small"
                      iconOnly="close"
                      aria-label={`Quitar ${archivo.nombre}`}
                      onClick={() => quitar(archivo.id)}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center justify-center rounded-md border border-dashed border-border-mid py-03 text-body-m text-highlight-muted transition-colors motion-micro-states hover:bg-highlight-soft"
                >
                  + Agregar más archivos
                </button>
              </div>
            )}

            <div
              className="anim-aparece flex w-full max-w-[800px] flex-col gap-04"
              style={retardo(2)}
            >
              <div className="flex gap-04">
                <Input
                  label="Nombre"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="flex-1"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
              </div>

              <Checkbox checked={aceptaPrivacidad} onChange={setAceptaPrivacidad}>
                He leído y acepto la Política de Privacidad y Protección de
                Datos, y autorizo el tratamiento de mis facturas (incl. CIF e
                IBAN) para el análisis y la optimización energética.
              </Checkbox>
              <Checkbox checked={confirmaDatos} onChange={setConfirmaDatos}>
                Confirmo que los datos aportados corresponden a mi empresa y
                autorizo su tratamiento confidencial por parte de ACZO, sin
                cesión a terceros salvo para ejecutar el cambio de suministro.
              </Checkbox>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-[140px] py-04">
          <Button
            iconEnd="chevron-right"
            disabled={!listoParaContinuar}
            onClick={onContinuar}
            className="transition-colors motion-micro-states"
          >
            Analizar facturas
          </Button>
        </div>
      </div>
    </div>
  );
}
