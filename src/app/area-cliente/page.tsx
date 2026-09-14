import type { Metadata } from "next";
import { AreaCliente } from "@/components/prototipo/area-cliente/AreaCliente";

export const metadata: Metadata = {
  title: "Mi cartera · Aczo",
  description:
    "El área de cliente: las sociedades de tu cartera y dónde están, sobre el mapa.",
};

export default function AreaClientePage() {
  return <AreaCliente />;
}
