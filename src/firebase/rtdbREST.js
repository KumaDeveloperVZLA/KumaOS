/**
 * rtdbREST.js — Firebase RTDB via REST API
 *
 * Misma estrategia que CloudSyncSystem (que funciona):
 * - Usa fetch directamente con el databaseURL y el token de auth.
 * - `onValue()` del SDK silently falla en algunos entornos Electron porque
 *   getDatabase() no detecta el databaseURL correctamente.
 *
 * API pública:
 *   rtdbGet(path)           → Promise<data|null>
 *   rtdbPost(path, data)    → Promise<{name: pushId}>
 *   rtdbPut(path, data)     → Promise<any>
 *   rtdbDelete(path)        → Promise<any>
 *   rtdbListen(path, cb, errCb, intervalMs) → unsubscribe function
 */

import { getFirebaseApp }  from './firebaseConfig.js';
import { getFirebaseAuth } from './auth.js';

// ── Helpers internos ──────────────────────────────────────────────────────

async function _buildUrl(path) {
  const app    = await getFirebaseApp();
  const auth   = await getFirebaseAuth();
  const dbUrl  = app.options.databaseURL;

  if (!dbUrl) throw new Error('[rtdbREST] databaseURL no encontrado en la config de Firebase.');
  if (!auth.currentUser) throw new Error('[rtdbREST] No hay usuario autenticado.');

  const token    = await auth.currentUser.getIdToken();
  const clean    = dbUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${clean}${cleanPath}.json?auth=${token}`;
}

// ── API pública ───────────────────────────────────────────────────────────

/**
 * Lee una ruta una vez (equivale a get/once).
 * @returns {Promise<any>} Dato en la ruta, o null si no existe.
 */
export async function rtdbGet(path) {
  const url = await _buildUrl(path);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`rtdbGet HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Escribe un nuevo nodo con clave auto-generada (equivale a push).
 * @returns {Promise<{name: pushId}>}
 */
export async function rtdbPost(path, data) {
  const url = await _buildUrl(path);
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`rtdbPost HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Sobrescribe completamente un nodo (equivale a set).
 */
export async function rtdbPut(path, data) {
  const url = await _buildUrl(path);
  const res = await fetch(url, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`rtdbPut HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Elimina completamente un nodo.
 */
export async function rtdbDelete(path) {
  const url = await _buildUrl(path);
  const res = await fetch(url, {
    method:  'DELETE'
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`rtdbDelete HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Suscripción a cambios via polling.
 * Llama a `callback(data)` inmediatamente y cada `intervalMs` ms.
 * Si hay error llama a `errorCallback(err)` una vez.
 *
 * @returns {function} unsubscribe — llama para detener el polling.
 */
export function rtdbListen(path, callback, errorCallback, intervalMs = 2000) {
  let active    = true;
  let errorFired = false;

  async function poll() {
    if (!active) return;
    try {
      const data = await rtdbGet(path);
      if (active) callback(data);
      errorFired = false; // reset: si falla y luego funciona, volver a reportar
    } catch (err) {
      console.error('[rtdbListen] poll error:', err.message);
      if (active && !errorFired && errorCallback) {
        errorFired = true;
        errorCallback(err);
      }
    }
    if (active) setTimeout(poll, intervalMs);
  }

  // Arrancar inmediatamente
  poll();

  return () => { active = false; };
}
