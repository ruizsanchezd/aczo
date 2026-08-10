import type { Metadata } from "next";
import { RecorridoEmpresas } from "@/components/prototipo/empresas/RecorridoEmpresas";

export const metadata: Metadata = {
  title: "Empresas · Aczo",
  description: "El flujo de empresas: sube las facturas de tus sociedades.",
};

export default function EmpresasPage() {
  return <RecorridoEmpresas />;
}
