import { System } from 'ape-ecs';
import { AppManifest } from '../components/AppManifest.js';
import { ProcessState } from '../components/ProcessState.js';
import { WindowTransform } from '../components/WindowTransform.js';

// ── Importar las apps nativas ──────────────────────────────────────────────
import { mountCameraApp,   unmountCameraApp   } from '../../../apps/camera/CameraApp.js';
import { mountMessagesApp, unmountMessagesApp } from '../../../apps/messages/MessagesApp.js';
import { mountGalleryApp,  unmountGalleryApp  } from '../../../apps/gallery/GalleryApp.js';

const APP_MOUNTS = {
  camera:   { mount: mountCameraApp,   unmount: unmountCameraApp   },
  messages: { mount: mountMessagesApp, unmount: unmountMessagesApp },
  gallery:  { mount: mountGalleryApp,  unmount: unmountGalleryApp  },
};

/**
 * WindowManagerSystem — tick 'render'
 *
 * Monitorea entidades con ProcessState.
 * - state === 'RUNNING' → abre ventana fullscreen, oculta dock + status bar
 * - state === 'STOPPED' → cierra ventana, restaura dock + status bar
 */
export class WindowManagerSystem extends System {
  init(uid) {
    this.uid = uid;

    this.appQuery = this.createQuery()
      .fromAll(AppManifest, ProcessState, WindowTransform)
      .persist();

    // Caché de ventanas montadas: appId → HTMLElement
    this.mountedWindows = new Map();
  }

  update(tick) {
    const container = document.getElementById('window-manager');
    if (!container) return;

    const entities = this.appQuery.execute();

    for (const entity of entities) {
      const manifest  = entity.c.AppManifest;
      const proc      = entity.c.ProcessState;
      const win       = entity.c.WindowTransform;
      const appId     = manifest.id;
      const isRunning = proc.state === 'RUNNING';

      if (isRunning && !this.mountedWindows.has(appId)) {
        // ── ABRIR VENTANA ──────────────────────────────────────────
        win.update({ isOpen: true });

        const windowEl = this._createWindowShell(appId, manifest.name, proc, container);
        this.mountedWindows.set(appId, windowEl);

        // Montar el contenido de la app si existe un handler
        const handler = APP_MOUNTS[appId];
        if (handler) {
          const contentEl = windowEl.querySelector('.app-content');
          handler.mount(contentEl, this.uid);
        }

        // Animar entrada (doble rAF garantiza que la transición CSS se dispara)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => windowEl.classList.add('app-window--open'))
        );

      } else if (!isRunning && this.mountedWindows.has(appId)) {
        // ── CERRAR VENTANA ─────────────────────────────────────────
        win.update({ isOpen: false });
        this._closeWindow(appId);
      }
    }

    // ── Sincronizar visibilidad del Shell con ventanas abiertas ────────────
    this._syncShellVisibility(container);
  }

  // ── Shell visibility (dock, status bar, window-manager z-index) ────────────

  _syncShellVisibility(container) {
    const hasOpenWindows = this.mountedWindows.size > 0;
    const dock      = document.getElementById('dock-container');
    const statusBar = document.getElementById('status-bar-container');

    if (hasOpenWindows) {
      // Elevar el window-manager por encima del dock (z-40) y status bar (z-50)
      container.style.pointerEvents = 'auto';
      container.style.zIndex        = '60';

      // Ocultar dock y status bar para no bloquear la app
      if (dock)      dock.style.display      = 'none';
      if (statusBar) statusBar.style.display = 'none';
    } else {
      // Restaurar estado idle del shell
      container.style.pointerEvents = 'none';
      container.style.zIndex        = '30';

      if (dock)      dock.style.display      = '';
      if (statusBar) statusBar.style.display = '';
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _createWindowShell(appId, appName, procComponent, container) {
    const el = document.createElement('div');
    el.id = `window-${appId}`;
    el.className = 'app-window';
    el.dataset.appId = appId;
    el.innerHTML = `
      <div class="app-window__header">
        <span class="app-window__title">${appName}</span>
        <button
          id="close-btn-${appId}"
          class="app-window__close-btn"
          aria-label="Cerrar ${appName}"
        >✕</button>
      </div>
      <div class="app-content"></div>
    `;

    // Botón de cierre → ProcessState STOPPED
    el.querySelector(`#close-btn-${appId}`).addEventListener('click', () => {
      procComponent.update({ state: 'STOPPED' });
    });

    container.appendChild(el);
    return el;
  }

  _closeWindow(appId) {
    const el = this.mountedWindows.get(appId);
    if (!el) return;

    // Limpiar streams/listeners de la app
    const handler = APP_MOUNTS[appId];
    if (handler) handler.unmount(el.querySelector('.app-content'));

    // Animar salida y remover del DOM
    el.classList.remove('app-window--open');

    const onEnd = () => el.remove();
    el.addEventListener('transitionend', onEnd, { once: true });

    // Fallback: si la transición no dispara (ej. no hay tiempo de frame)
    setTimeout(onEnd, 400);

    this.mountedWindows.delete(appId);
  }
}
