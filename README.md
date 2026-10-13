# 🏠 CasaQuest

**Convierte las tareas de casa en una aventura para dos.**

CasaQuest es una PWA doméstica gamificada: cada tarea da monedas, las monedas desbloquean recompensas y las metas comunes convierten el mantenimiento de la casa en un pequeño juego cooperativo.

## ✨ Ahora incluye

- Dos perfiles: Brais y Noa.
- Puntos personales + bote común.
- Misiones por habitaciones/categorías.
- Tienda de recompensas personales y para dos.
- Niveles, XP y rachas.
- Historial de actividad.
- Estadísticas y objetivo semanal.
- Diseño responsive y PWA instalable.
- Persistencia local con `localStorage`.
- Cliente Supabase preparado para sincronización en nube.
- Esquema SQL de Supabase en `supabase/schema.sql`.
- GitHub Actions preparado para GitHub Pages.

## 🚀 Desarrollo

```bash
npm install
npm run dev
```

## 🌍 GitHub Pages

El workflow de `.github/workflows/deploy.yml` construye y publica automáticamente la aplicación en cada push a `main`.

En GitHub: **Settings → Pages → Source → GitHub Actions**.

La aplicación usa `/casaquest/` como base porque el repositorio se llama `casaquest`.

## ☁️ Persistencia compartida

La aplicación funciona sin backend y guarda los cambios en el navegador. Para que Brais y Noa compartan la misma partida entre móviles, crea un proyecto gratuito en Supabase, ejecuta `supabase/schema.sql` y añade estas variables como **Repository Variables** de GitHub Actions:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

El cliente está en `src/lib/supabase.js`.

La siguiente capa recomendable es una Edge Function/RPC para hacer los cambios de puntos de forma atómica y segura; nunca conviene confiar en el cliente para decidir cuánto dinero/puntos puede crear un usuario.

## 🎨 Dirección visual

CasaQuest busca sentirse más como un pequeño juego acogedor que como una app corporativa: colores cálidos, tarjetas suaves, personajes, monedas, misiones y recompensas.

## 🗺️ Próximos pasos

1. Supabase Auth + invitación por código.
2. Sincronización Realtime.
3. CRUD de tareas y recompensas desde Ajustes.
4. Misiones recurrentes automáticas.
5. Logros y temporadas.
6. Mascota de la casa con progresión.
7. Notificaciones PWA.
