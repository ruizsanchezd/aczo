import type { Metadata } from "next";
import { Landing } from "@/components/prototipo/Landing";

export const metadata: Metadata = {
  title: "Landing · Aczo",
  description: "La página de entrada (captación), antes de empezar el recorrido.",
};

export default function LandingPage() {
  return <Landing />;
}
