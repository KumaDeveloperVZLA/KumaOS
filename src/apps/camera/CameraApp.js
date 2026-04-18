/**
 * CameraApp — Fase 4 (REST API)
 *
 * Usa la cámara real del equipo vía navigator.mediaDevices.getUserMedia.
 * Al tomar una foto, guarda la referencia (dataURL) en Firebase RTDB via REST:
 *   users/{uid}/gallery/{pushId}
 *
 * Exports:
 *   mountCameraApp(container, uid)
 *   unmountCameraApp(container)
 */

import { rtdbPost } from '../../firebase/rtdbREST.js';

let _stream = null; // MediaStream activo

// ── Montar ─────────────────────────────────────────────────────────────────
export async function mountCameraApp(container, uid) {
  container.innerHTML = buildCameraUI();

  const video    = container.querySelector('#camera-video');
  const canvas   = container.querySelector('#camera-canvas');
  const snapBtn  = container.querySelector('#camera-snap-btn');
  const flashEl  = container.querySelector('#camera-flash');
  const statusEl = container.querySelector('#camera-status');

  // Solicitar acceso a la cámara real
  try {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = _stream;
    video.play();
  } catch (err) {
    statusEl.textContent = `⚠️ Cámara no disponible: ${err.message}`;
    statusEl.style.display = 'block';
    snapBtn.disabled = true;
    console.error('[CameraApp] getUserMedia error:', err);
    return;
  }

  // ── Capturar foto ───────────────────────────────────────────────────────
  snapBtn.addEventListener('click', async () => {
    // Flash visual
    flashEl.classList.add('camera-flash--active');
    setTimeout(() => flashEl.classList.remove('camera-flash--active'), 350);

    // Deshabilitar botón durante guardado
    snapBtn.disabled = true;

    // Capturar frame en canvas
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // Comprimir: calidad 0.7 para mantener dataURL dentro de límites RTDB (10MB/nodo)
    const dataURL = canvas.toDataURL('image/jpeg', 0.7);

    // Guardar en Firebase RTDB via REST
    try {
      await rtdbPost(`users/${uid}/gallery`, {
        dataURL,
        timestamp: Date.now(),
        uid,
      });
      console.log('[CameraApp] Foto guardada en Firebase RTDB.');
      _showSavedBadge(container);
    } catch (err) {
      console.error('[CameraApp] Error guardando foto:', err.message);
      statusEl.textContent = `⚠️ Error al guardar: ${err.message}`;
      statusEl.style.display = 'block';
    } finally {
      snapBtn.disabled = false;
    }
  });
}

// ── Desmontar ──────────────────────────────────────────────────────────────
export function unmountCameraApp(container) {
  if (_stream) {
    _stream.getTracks().forEach(track => track.stop());
    _stream = null;
  }
  container.innerHTML = '';
}

// ── UI ─────────────────────────────────────────────────────────────────────
function buildCameraUI() {
  return `
    <div class="camera-app">
      <div class="camera-flash" id="camera-flash"></div>

      <video
        id="camera-video"
        class="camera-video"
        autoplay
        muted
        playsinline
      ></video>

      <canvas id="camera-canvas" style="display:none;"></canvas>

      <div class="camera-controls">
        <button id="camera-snap-btn" class="camera-snap-btn" aria-label="Tomar foto">
          <span class="camera-snap-icon"></span>
        </button>
      </div>

      <p id="camera-status" class="camera-status" style="display:none;"></p>
    </div>
  `;
}

function _showSavedBadge(container) {
  const badge = document.createElement('div');
  badge.className = 'camera-saved-badge';
  badge.textContent = '✓ Foto guardada';
  container.querySelector('.camera-app').appendChild(badge);
  setTimeout(() => badge.remove(), 2000);
}
