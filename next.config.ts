import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El prototipo no tiene servidor: son pantallas y datos de mentira. Exportarlo
  // como archivos estáticos hace que se pueda publicar en cualquier sitio sin
  // depender de nada especial.
  output: "export",
  // Sin servidor no hay quien optimice las imágenes al vuelo; se sirven tal cual.
  images: { unoptimized: true },
};

export default nextConfig;
