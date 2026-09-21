# Cómo se publica el prototipo

El prototipo se publica en **Netlify**. Cada vez que algo entra en el proyecto principal
(`main`), Netlify lo reconstruye y actualiza el enlace, **lo haya hecho quien lo haya hecho**.

## Por qué no está en Vercel

Vercel, en su plan gratuito, solo publica los cambios firmados por la dueña de la cuenta. Los
del resto del equipo salían "Blocked" y el enlace se quedaba viejo. Probamos a publicar desde
GitHub con una llave y tampoco: Vercel mira quién **escribió** el cambio, no quién lo publica.
Netlify no hace esa comprobación, así que ahí funciona sin pagar nada.

## Qué significa en el día a día

Nada nuevo. Se trabaja igual que siempre:

`/branch` → trabajar → `/commit` → `/push` → `/pr-create` → `/pr-merge`

- Al abrir una propuesta (PR), Netlify genera un **enlace de prueba** para verla antes de unirla.
- Al unirla a `main` se actualiza el **enlace bueno**, en un par de minutos.

## Detalle técnico (para quien lo reimplemente)

El prototipo se exporta como archivos estáticos (`output: "export"` en `next.config.ts`): no
hay servidor, ni API, ni nada dinámico — sólo hacen falta los archivos. La configuración de
publicación está en `netlify.toml`.

## Dónde mirar si algo no sale

En el panel de Netlify, apartado **Deploys**: verde = publicado, rojo = algo falló. Si sale
rojo, pídeselo a Claude y lo mira.
