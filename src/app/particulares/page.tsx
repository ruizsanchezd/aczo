import type { Metadata } from "next";
import { RecorridoParticulares } from "@/components/prototipo/particulares/RecorridoParticulares";

export const metadata: Metadata = {
  title: "Particulares · Aczo",
  description: "El flujo de particulares: sube tu factura y calcula tu ahorro.",
};

export default function ParticularesPage() {
  return <RecorridoParticulares />;
}
