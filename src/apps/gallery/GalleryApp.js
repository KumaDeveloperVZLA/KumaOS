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

import { rtdbListen, rtdbDelete } from '../../firebase/rtdbREST.js';

let _unsubscribe = null;

// ── Montar ─────────────────────────────────────────────────────────────────
export function mountGalleryApp(container, uid) {
  container.innerHTML = buildGalleryShell();

  const grid    = container.querySelector('#gallery-grid');
  const emptyEl = container.querySelector('#gallery-empty');
  const viewer = container.querySelector('#gallery-viewer');
  const viewerImg = container.querySelector('#gallery-viewer-img');
  const btnClose = container.querySelector('#gallery-close-viewer');
  const btnDelete = container.querySelector('#gallery-delete-photo');

  let selectedKey = null;
  let prevCount = -1;

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) {
      selectedKey = item.getAttribute('data-key');
      viewerImg.src = item.getAttribute('data-url');
      viewer.style.display = 'flex';
    }
  });

  btnClose.addEventListener('click', () => {
    viewer.style.display = 'none';
    selectedKey = null;
    viewerImg.src = '';
  });

  btnDelete.addEventListener('click', async () => {
    if (!selectedKey) return;
    if (confirm('¿Seguro que deseas borrar esta foto?')) {
      // Optimizacion visual, podemos salir de la vista previa antes para que no se note latencia
      viewer.style.display = 'none';
      try {
        await rtdbDelete(`users/${uid}/gallery/${selectedKey}`);
        selectedKey = null;
        viewerImg.src = '';
      } catch(err) {
        alert('Error al borrar: ' + err.message);
      }
    }
  });

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
        <div class="gallery-item" data-key="${photo.key}" data-url="${photo.dataURL}" title="${new Date(photo.timestamp).toLocaleString()}" style="cursor:pointer;">
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
      <div id="gallery-viewer" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:black; flex-direction:column; z-index:50;">
        <div style="display:flex; justify-content:space-between; padding:15px; background:rgba(0,0,0,0.5);">
          <button id="gallery-close-viewer" style="color:white; background:none; border:none; font-size:1.1rem; cursor:pointer;">← Volver</button>
          <button id="gallery-delete-photo" style="color:#ff4444; background:none; border:none; font-size:1.1rem; font-weight:bold; cursor:pointer;">Borrar</button>
        </div>
        <img id="gallery-viewer-img" src="" style="flex:1; object-fit:contain; max-width:100%; min-height:0; user-select:none;" />
      </div>
    </div>
  `;
}
