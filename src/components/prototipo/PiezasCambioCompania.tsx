"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";

/**
 * Las piezas que comparten las dos pantallas de "Cambio de compañía" (paso 03)
 * — la de empresas y la de particulares. El Figma las dibuja idénticas en los
 * dos flujos, así que viven aquí y no duplicadas en cada pantalla: si cambia
 * una tarjeta, un recuadro de firma o una zona de subida, cambia en los dos
 * sitios a la vez.
 */

/** La tarjeta blanca sobre la que va cada sección del formulario. */
export function Bloque({
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

/** Título y explicación de una sección. `extra` va a la derecha del título
 * (en particulares, la etiqueta "Detectados de tu factura"). */
export function CabeceraBloque({
  titulo,
  descripcion,
  extra,
}: {
  titulo: string;
  descripcion: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-04">
      <div className="flex min-w-0 flex-col gap-01">
        <Text variant="heading-s" as="h3">
          {titulo}
        </Text>
        <Text variant="body-m" color="low">
          {descripcion}
        </Text>
      </div>
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  );
}

/** Una fila del resumen de la columna derecha: etiqueta y valor. */
export function FilaResumen({
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

/**
 * DropzoneIdentidad — subir una foto o escaneo del DNI/NIE/pasaporte.
 *
 * Un solo archivo (a diferencia de la subida de facturas, aquí no tiene
 * sentido más de un documento de identidad): al soltar uno nuevo, sustituye
 * al anterior. Mismo patrón de arrastre que la subida de facturas (borde +
 * fondo `highlight-soft`, icono que crece un poco al arrastrar).
 */
export function DropzoneIdentidad({
  archivo,
  onCambiar,
  titulo,
  ayuda,
}: {
  archivo: string | null;
  onCambiar: (nombre: string | null) => void;
  titulo: string;
  ayuda: string;
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
          {titulo}
        </Text>
        <Text variant="body-m" color="low" as="span">
          {ayuda}
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
export function FirmaCanvas({
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
