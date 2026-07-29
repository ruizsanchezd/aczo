import Link from "next/link";
import { Text } from "@/components/ui/Text";

/**
 * Portada del prototipo: índice de lo que hay hecho.
 * A medida que se añadan pantallas y animaciones, se listan aquí.
 */
export default function Home() {
  return (
    <main className="layout-section flex flex-1 flex-col justify-center py-10">
      <Text variant="heading-l">Aczo</Text>
      {/* 52ch no es un token: mide la línea en caracteres para que el texto sea
          cómodo de leer. Es una medida tipográfica, no una medida de diseño. */}
      <Text variant="body-l" color="mid" className="mt-03 max-w-[52ch]">
        Prototipo de animaciones e interacciones. Todo lo que se ve aquí usa
        datos de mentira: el diseño manda desde Figma, y este repo aporta el
        movimiento.
      </Text>

      <nav className="mt-08 flex flex-col gap-02">
        <Text variant="label-s" color="low" as="p" className="mb-01">
          Prototipos
        </Text>
        <Link
          href="/estilos"
          className="group flex items-center justify-between gap-04 rounded-md border border-border-low p-04 transition-colors motion-micro-states hover:bg-background-low"
        >
          <span>
            <Text variant="label-l" as="span">
              Estilos
            </Text>
            <Text variant="body-s" color="mid">
              Colores, tipografía, espaciado y motion del sistema de diseño
            </Text>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-content-low transition-transform motion-micro-states group-hover:translate-x-01"
          >
            →
          </span>
        </Link>
      </nav>
    </main>
  );
}
