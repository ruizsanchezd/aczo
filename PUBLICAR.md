# Cómo se publica el prototipo

El prototipo vive en Vercel, pero **no lo publica Vercel por su cuenta**: lo publica GitHub
cada vez que algo entra en el proyecto principal (`main`).

## Por qué

La cuenta de Vercel es gratuita y solo acepta cambios firmados por su dueño (Daniel). Como
aquí trabajamos varias personas, los cambios de las demás salían bloqueados y el enlace no se
actualizaba. Ahora GitHub llama a Vercel siempre con la misma llave, así que da igual quién
haya hecho el cambio: se publica igual y cada persona conserva su nombre en el historial.

## Qué significa esto en el día a día

Nada nuevo. Se trabaja igual que siempre:

`/branch` → trabajar → `/commit` → `/push` → `/pr-create` → `/pr-merge`

- Al abrir una propuesta (PR) se genera un **enlace de prueba** para verla antes de unirla.
- Al unirla a `main` se actualiza el **enlace bueno** del prototipo, en un par de minutos.

## Dónde mirar si algo no sale

En GitHub, pestaña **Actions**: cada publicación aparece ahí. Verde = publicado, rojo = algo
falló. Si sale rojo, pídeselo a Claude y lo mira.

## La llave

Está guardada en GitHub como secreto `VERCEL_TOKEN` (Settings → Secrets and variables →
Actions). Caduca al año; cuando caduque, hay que crear otra en Vercel y sustituirla ahí mismo.
La receta de publicación está en `.github/workflows/publicar.yml`.
