import type { Metadata } from "next";
import { Recorrido } from "@/components/prototipo/Recorrido";

export const metadata: Metadata = {
  title: "Recorrido · Aczo",
  description:
    "Prototipo del recorrido completo: subida de facturas, análisis, recomendación, firma y alta.",
};

export default function RecorridoPage() {
  return <Recorrido />;
}
