import type { Metadata } from "next";
import { AreaCliente2 } from "@/components/prototipo/area-cliente2/AreaCliente2";

export const metadata: Metadata = {
  title: "Dashboard · Aczo",
  description:
    "El área de cliente: el resumen de ahorro y consumo, y la cartera de sociedades.",
};

export default function AreaCliente2Page() {
  return <AreaCliente2 />;
}
