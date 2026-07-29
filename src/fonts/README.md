# Fuentes

## Qué hay aquí

**`Bradford LL TT` (Medium / 500)** — la fuente de marca, la de los titulares (`heading`).
Es la de verdad, de la fundición [Lineto](https://lineto.com). La licencia está confirmada.

Hay dos archivos del mismo tipo:

| Archivo | Para qué |
| --- | --- |
| `BradfordLLTT-Medium.woff2` | **La que usa la web.** 101 KB, es la que se carga en el navegador. |
| `BradfordLLTT-Medium.ttf` | El original tal cual llegó de la fundición (350 KB). No se usa en la web; se guarda como copia de seguridad y por si algún día hace falta otro formato. |

Está conectada en `src/app/layout.tsx` y se usa con la clase `font-heading` (o con el
componente `<Text variant="heading-l">`, que ya la aplica).

## La otra fuente: Inter

`body`, `label` y `title` usan **Inter**, que es gratuita y de código abierto. No hace falta
ningún archivo: se descarga automáticamente de Google Fonts y Next.js la sirve ya optimizada
desde el propio proyecto. No hay nada que hacer con ella.

---

## Si algún día hay que añadir otro peso

1. Deja el archivo en esta carpeta (mejor `.woff2`; si es `.ttf` u `.otf`, se puede convertir).
2. Dilo y se conecta en `src/app/layout.tsx`.

Para convertir un `.ttf` u `.otf` a `.woff2` (pesa un 70% menos):

```bash
python3 -c "
from fontTools.ttLib import TTFont
f = TTFont('ARCHIVO.ttf'); f.flavor = 'woff2'; f.save('ARCHIVO.woff2')
"
```

## Nota sobre la licencia

`Bradford LL TT` es una fuente **de pago**. Este repositorio es **privado**, que es la
condición que hace correcto guardarla aquí. Si en algún momento el repositorio se hiciera
público, la fuente tendría que salir de aquí.
