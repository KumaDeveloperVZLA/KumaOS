/**
 * MessagesApp — Fase 4 (REST API)
 *
 * Chat global en tiempo real usando Firebase RTDB via REST.
 * Polling cada 2s (en lugar de onValue SDK que no conecta en Electron).
 *
 * Exports:
 *   mountMessagesApp(container, uid)
 *   unmountMessagesApp(container)
 *   startMessagesBackgroundSync(uid)
 */

import { rtdbGet, rtdbPost, rtdbListen } from '../../firebase/rtdbREST.js';
import { showToast } from '../../renderer/shell/ToastManager.js';

const MESSAGES_PATH = 'messages/global';

let _unsubscribeFg   = null;  // Polling activo dentro de la app
let _unsubscribeBg   = null;  // Polling en background para notificaciones
let _bgInitialized   = false;
let _appMounted      = false;
let _lastMsgCount    = 0;

// ── Background Sync (Toast si hay mensajes nuevos) ────────────────────────
export async function startMessagesBackgroundSync(uid) {
  if (_bgInitialized) return;
  _bgInitialized = true;

  let firstLoad = true;

  _unsubscribeBg = rtdbListen(
    MESSAGES_PATH,
    (data) => {
      const msgs  = data ? Object.values(data) : [];
      const count = msgs.length;

      if (firstLoad) {
        firstLoad     = false;
        _lastMsgCount = count;
        return;
      }

      if (_appMounted) {
        _lastMsgCount = count;
        return;
      }

      if (count > _lastMsgCount) {
        const newMsgs = msgs.slice(_lastMsgCount);
        newMsgs.forEach(msg => {
          if (msg.uid !== uid) {
            showToast(`💬 ${msg.displayName || 'Alguien'}: ${msg.text}`);
          }
        });
        _lastMsgCount = count;
      }
    },
    (err) => {
      console.error('[MessagesApp][BG] Error en background sync:', err.message);
    },
    3000 // Polling cada 3s en background (menos agresivo)
  );

  console.log('[MessagesApp] Background sync iniciado (REST polling).');
}

// ── Montar ─────────────────────────────────────────────────────────────────
export async function mountMessagesApp(container, uid) {
  _appMounted = true;
  container.innerHTML = buildMessagesUI();

  const listEl  = container.querySelector('#messages-list');
  const input   = container.querySelector('#messages-input');
  const sendBtn = container.querySelector('#messages-send-btn');

  let prevCount = -1; // Para detectar cambios y evitar re-renders innecesarios

  _unsubscribeFg = rtdbListen(
    MESSAGES_PATH,
    (data) => {
      if (!data) {
        if (prevCount !== 0) {
          listEl.innerHTML = '<p class="messages-empty">No hay mensajes aún. ¡Sé el primero!</p>';
          prevCount = 0;
        }
        return;
      }

      const messages = Object.entries(data)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      if (messages.length === prevCount) return; // Sin cambios

      prevCount         = messages.length;
      _lastMsgCount     = messages.length;

      listEl.innerHTML = messages.map(msg => `
        <div class="message-bubble ${msg.uid === uid ? 'message-bubble--own' : 'message-bubble--other'}">
          ${msg.uid !== uid ? `<span class="message-author">${msg.displayName || 'Anónimo'}</span>` : ''}
          <p class="message-text">${escapeHTML(msg.text)}</p>
          <span class="message-time">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
        </div>
      `).join('');

      listEl.scrollTop = listEl.scrollHeight;
    },
    (err) => {
      console.error('[MessagesApp] Error de RTDB:', err.message);
      listEl.innerHTML = `
        <div class="messages-rtdb-error">
          <b>🔴 Error de Firebase RTDB</b><br/>
          ${err.message}<br/>
          <small>Verifica tu conexión y las reglas de seguridad de RTDB.</small>
        </div>
      `;
    },
    2000 // Polling cada 2s dentro de la app (sensación de tiempo real)
  );

  // ── Enviar mensaje ───────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

    try {
      await rtdbPost(MESSAGES_PATH, {
        uid,
        displayName: uid.slice(0, 8),
        text,
        timestamp:   Date.now(),
      });
    } catch (err) {
      console.error('[MessagesApp] Error enviando mensaje:', err.message);
      input.value = text; // Restaurar texto si falló
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

// ── Desmontar ──────────────────────────────────────────────────────────────
export function unmountMessagesApp(container) {
  _appMounted = false;
  if (typeof _unsubscribeFg === 'function') {
    _unsubscribeFg();
    _unsubscribeFg = null;
  }
  container.innerHTML = '';
}

// ── UI Builder ─────────────────────────────────────────────────────────────
function buildMessagesUI() {
  return `
    <div class="messages-app">
      <div class="messages-header">
        <span class="messages-header-icon">💬</span>
        <span>Chat Global</span>
      </div>
      <div id="messages-list" class="messages-list">
        <p class="messages-empty">Conectando…</p>
      </div>
      <div class="messages-input-row">
        <input
          id="messages-input"
          type="text"
          class="messages-input"
          placeholder="Escribe un mensaje…"
          maxlength="500"
          autocomplete="off"
        />
        <button id="messages-send-btn" class="messages-send-btn" aria-label="Enviar">
          ➤
        </button>
      </div>
    </div>
  `;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
