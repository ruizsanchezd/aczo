# Fuentes

## 👉 Deja aquí el archivo de `Bradford LL TT`

Esta es la carpeta. El archivo va **dentro de `src/fonts/`**, al mismo nivel que este
documento. No hace falta que hagas nada más: déjalo ahí y dime que ya está, que yo lo
conecto.

### Qué archivo hace falta

- **Peso:** `Medium` (500). Es el único que usa el sistema de diseño para los `heading`.
- **Formato:** el mejor es **`.woff2`**. Si solo tienes `.otf` o `.ttf`, también sirve.
- **Nombre:** da igual cómo se llame, pero si puedes déjalo como
  `BradfordLLTT-Medium.woff2` (o la extensión que sea).

Si de la fundición te llegan varios pesos (Regular, Bold…), déjalos todos y ya veo yo
cuáles conectar.

### Por qué está aquí y no en `public/`

Next.js procesa las fuentes de esta carpeta y las sirve optimizadas, sin parpadeo al
cargar. Si estuvieran en `public/` no lo haría.

---

## Estado actual

Ahora mismo **falta la fuente de marca**, así que los titulares (`heading`) se ven con
una serif parecida (Newsreader, de Google Fonts) como sustituto temporal. Están
configurados en `src/app/layout.tsx`.

Esto significa que **los titulares del prototipo NO son fieles al Figma** todavía. El
resto de la tipografía (`body`, `label`, `title`) usa Inter y sí es correcta.

## Nota sobre la licencia

`Bradford LL TT` es una fuente **de pago** (de la fundición Lineto). Este repositorio es
privado, así que guardar el archivo aquí es lo normal para un prototipo interno — pero
conviene que confirmes que la licencia que tenéis cubre su uso en un proyecto web,
aunque sea interno. Si en algún momento el repositorio se hiciera público, la fuente
tendría que salir de aquí.
