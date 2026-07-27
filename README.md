<div align="center">
  <img src="public/logo.png" alt="AnimeGL Logo" width="420" style="max-width: 100%; height: auto;" />

  # 🌸 AnimeGL v3.0 — Modern Anime Streaming Platform

  [![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Jikan API](https://img.shields.io/badge/Jikan_API-MyAnimeList-2E51A2)](https://jikan.moe/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

  <br />

  [![Live Demo](https://img.shields.io/badge/🌐_Demo_en_Vivo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://anime-website-rxhv.onrender.com/)

  ### 🌐 **[https://anime-website-rxhv.onrender.com/](https://anime-website-rxhv.onrender.com/)**
</div>

---

Una plataforma web de transmisión y exploración de anime moderna, rápida, elegante y sin anuncios. Diseñada con una estética oscura neón (Glassmorphism & Micro-animations) e integrada con la API oficial de MyAnimeList (Jikan API).

---

## 🎬 Características Principales

- **Reproducción HD Nativa & Tráileres**: Reproductor HTML5 sin anuncios integrados + selector de tráileres oficiales de MyAnimeList.
- **Historial y Estadísticas por Usuario**: Seguimiento personalizado de episodios vistos y animes favoritos por cada usuario registrado.
- **Soporte Multilingüe**: Disponible en Español (`es`), Inglés (`en`), Catalán (`ca`), Italiano (`it`) y Francés (`fr`).
- **Integración Jikan API**: Catálogo dinámico con los animes mejor valorados de MyAnimeList.
- **Diseño Ultra Rápido**: Compilación optimizada en Vite 8 con soporte para despliegue en Vercel, Netlify y Render.
- **MediaSession & Discord RPC**: Notificación del estado de reproducción al sistema operativo y a Discord.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, Vanilla CSS (Design Tokens, HSL & Neon Glows).
- **Backend / Database**: Node.js, Express, LocalStorage Database Engine.
- **APIs**: Jikan API (MyAnimeList v4).

---

## 🚀 Despliegue en Producción (Render.com)

🔗 **URL del sitio activo:** [https://anime-website-rxhv.onrender.com/](https://anime-website-rxhv.onrender.com/)

El proyecto incluye el archivo [`render.yaml`](./render.yaml) para despliegue automático en 1 clic en Render:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Routing**: `/* -> /index.html`

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

---

<div align="center">
  ⭐ Made by <a href="https://github.com/nevvsiita">nevvsiita</a>
</div>
