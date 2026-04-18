/**
 * GalleryApp — Fase 4 (REST API)
 *
 * Muestra en grid las fotos guardadas en Firebase RTDB bajo:
 *   users/{uid}/gallery
 *
 * Usa polling via REST API (mismo mecanismo que CloudSyncSystem).
 *
 * Exports:
 *   mountGalleryApp(container, uid)
 *   unmountGalleryApp(container)
 */

import { rtdbListen } from '../../firebase/rtdbREST.js';

let _unsubscribe = null;

// ── Montar ─────────────────────────────────────────────────────────────────
export function mountGalleryApp(container, uid) {
  container.innerHTML = buildGalleryShell();

  const grid    = container.querySelector('#gallery-grid');
  const emptyEl = container.querySelector('#gallery-empty');
  let prevCount = -1;

  _unsubscribe = rtdbListen(
    `users/${uid}/gallery`,
    (data) => {
      if (!data) {
        if (prevCount !== 0) {
          grid.innerHTML        = '';
          emptyEl.style.display = 'flex';
          prevCount             = 0;
        }
        return;
      }

      const photos = Object.entries(data)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => b.timestamp - a.timestamp);

      if (photos.length === prevCount) return; // Sin cambios

      prevCount             = photos.length;
      emptyEl.style.display = 'none';

      grid.innerHTML = photos.map(photo => `
        <div class="gallery-item" title="${new Date(photo.timestamp).toLocaleString()}">
          <img
            src="${photo.dataURL}"
            alt="Foto ${new Date(photo.timestamp).toLocaleTimeString()}"
            class="gallery-img"
            loading="lazy"
          />
          <div class="gallery-item-overlay">
            <span>${new Date(photo.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      `).join('');
    },
    (err) => {
      console.error('[GalleryApp] RTDB error:', err.message);
      grid.innerHTML = `<p class="gallery-error">⚠️ Error: ${err.message}</p>`;
    },
    4000 // Polling cada 4s (fotos cambian menos seguido)
  );
}

// ── Desmontar ──────────────────────────────────────────────────────────────
export function unmountGalleryApp(container) {
  if (typeof _unsubscribe === 'function') {
    _unsubscribe();
    _unsubscribe = null;
  }
  container.innerHTML = '';
}

// ── UI Shell ───────────────────────────────────────────────────────────────
function buildGalleryShell() {
  return `
    <div class="gallery-app">
      <div id="gallery-grid" class="gallery-grid"></div>
      <div id="gallery-empty" class="gallery-empty" style="display:flex;">
        <span class="gallery-empty-icon">🖼️</span>
        <p>No hay fotos todavía.</p>
        <p style="opacity:0.5;font-size:0.8rem;">Abre la Cámara y toma una foto.</p>
      </div>
    </div>
  `;
}
