"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/**
 * PantallaSubida — pantalla 1: "Subida masiva de facturas".
 *
 * ANIMACIONES (esto es lo que hay que replicar en producto):
 *
 * 1. Zona de arrastre, al pasar un archivo por encima:
 *    borde gris → oliva, fondo blanco → oliva muy suave, y el icono crece un 5%.
 *    Todo con motion-micro-states (200 ms, lineal). Se nota al instante, que es
 *    lo que hace que la zona se sienta "viva" y receptiva.
 *
 * 2. Al soltar, cada factura entra por separado con anim-aparece (350 ms) y un
 *    retardo de 60 ms por archivo. El escalonado hace que se lea como "han
 *    entrado varias" en vez de "ha cambiado el bloque de golpe".
 *
 * 3. El resto de la pantalla entra en cascada al llegar (titular, ayudas, zona,
 *    botón), también de 60 en 60 ms.
 */

const AYUDAS = [
  "Sube al menos 1 factura de los últimos 12 meses",
  "Cuantas más facturas subas, más exacta será la estimación",
  "También puedes subir tu contrato si no tienes facturas a mano",
];

/** Retardo de la entrada en cascada, en milisegundos. */
const PASO_CASCADA = 60;

type Factura = { id: string; nombre: string; tamano: string };

export function PantallaSubida({ onContinuar }: { onContinuar: () => void }) {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function anadir(archivos: FileList | null) {
    if (!archivos?.length) return;
    const nuevas = [...archivos].map((f, i) => ({
      id: `${f.name}-${Date.now()}-${i}`,
      nombre: f.name,
      tamano: `${Math.max(1, Math.round(f.size / 1024))} KB`,
    }));
    setFacturas((prev) => [...prev, ...nuevas]);
  }

  return (
    // 620 px es el ancho de la columna en el Figma. No hay token para anchos de
    // columna, así que va como medida de layout, comentada.
    // Espaciados del Figma: 48 px entre bloques (gap-09) y 16 px entre el
    // titular y las ayudas (gap-04), que forman un solo bloque de texto.
    <div className="mx-auto flex w-full max-w-[620px] flex-col gap-09 px-04 py-09 sm:px-00">
      <div
        className="anim-aparece flex flex-col gap-04"
        style={{ animationDelay: "0ms" }}
      >
        <Text variant="heading-l">Subida masiva de facturas</Text>

        <ul className="flex flex-col gap-02">
          {AYUDAS.map((ayuda, i) => (
            <li
              key={ayuda}
              className="anim-aparece flex items-start gap-02"
              style={{ animationDelay: `${(i + 1) * PASO_CASCADA}ms` }}
            >
              <span className="shrink-0 text-highlight-muted">
                <Icon name="check-circle" />
              </span>
              <Text variant="body-m" color="mid" as="span">
                {ayuda}
              </Text>
            </li>
          ))}
        </ul>
      </div>

      {/* Zona de arrastre --------------------------------------------------- */}
      <div
        className="anim-aparece"
        style={{ animationDelay: `${4 * PASO_CASCADA}ms` }}
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
            "flex w-full cursor-pointer flex-col items-center justify-center gap-06 rounded-lg border border-dashed px-06 py-09",
            "transition-colors motion-micro-states",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-high",
            arrastrando
              ? "border-highlight-muted bg-highlight-soft"
              : "border-border-mid bg-background-base hover:border-border-high",
          ].join(" ")}
        >
          <span
            className={[
              // 56 × 56 en el Figma. No hay token de 56, pero sale exacto de
              // 16 de padding a cada lado (p-04) más el icono de 24.
              "flex items-center justify-center rounded-md bg-highlight-neutral p-04 text-highlight-muted",
              "transition-transform motion-micro-states",
              arrastrando ? "scale-105" : "scale-100",
            ].join(" ")}
          >
            <Icon name="upload" size={24} />
          </span>

          <span className="flex flex-col items-center gap-02">
            <Text variant="title-s" as="span">
              Arrastra tus facturas aquí o haz clic para seleccionar archivos
            </Text>
            <Text variant="body-m" color="low" as="span">
              PDF, JPG, PNG o ZIP con varias facturas
            </Text>
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.zip"
          onChange={(e) => anadir(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Facturas subidas.
          No está en el Figma: hace falta para que se vea el resultado de
          arrastrar, que es la animación principal de esta pantalla. */}
      {facturas.length > 0 && (
        <ul className="flex flex-col gap-02">
          {facturas.map((f, i) => (
            <li
              key={f.id}
              className="anim-aparece flex items-center gap-03 rounded-md border border-border-low bg-background-base p-03"
              style={{ animationDelay: `${i * PASO_CASCADA}ms` }}
            >
              <span className="shrink-0 text-content-mid">
                <Icon name="document" />
              </span>
              <Text variant="body-m" as="span" className="min-w-0 flex-1 truncate">
                {f.nombre}
              </Text>
              <Text variant="body-s" color="low" as="span">
                {f.tamano}
              </Text>
              <Button
                variant="tertiary"
                size="small"
                iconOnly="close"
                aria-label={`Quitar ${f.nombre}`}
                onClick={() =>
                  setFacturas((prev) => prev.filter((x) => x.id !== f.id))
                }
              />
            </li>
          ))}
        </ul>
      )}

      <div
        className="anim-aparece"
        style={{ animationDelay: `${5 * PASO_CASCADA}ms` }}
      >
        {/* Se puede continuar sin subir nada: es un prototipo y hay que poder
            recorrerlo entero para enseñarlo. */}
        <Button iconEnd="chevron-right" onClick={onContinuar}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
