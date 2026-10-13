# CasaQuest

Web app doméstica gamificada para dos personas.

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite.

## Build

```bash
npm run build
npm run preview
```

## Datos

Los puntos iniciales viven en:

- `data/brais.json`
- `data/noa.json`

En esta primera versión, GitHub Pages sirve esos JSON como estado inicial y los cambios se guardan en `localStorage` del navegador. La aplicación permite exportar el JSON actual desde **Datos**.

Esto es intencionado: GitHub Pages es hosting estático y el navegador no puede modificar los archivos del repositorio directamente. Para sincronizar puntos entre dos móviles/ordenadores habrá que añadir una base de datos (por ejemplo Supabase/Firebase).

## GitHub Pages

El proyecto ya incluye `vite.config.js` con:

```js
base: "/casaquest/"
```

Cambia `casaquest` por el nombre real de tu repositorio si utilizas otro.

Después:

1. Crea un repositorio en GitHub.
2. Sube el contenido de esta carpeta.
3. Ve a **Settings → Pages**.
4. En **Build and deployment → Source**, selecciona **GitHub Actions**.
5. Añade el workflow indicado en `DEPLOY.md`.
