import { System } from 'ape-ecs';
import { AppManifest } from '../components/AppManifest.js';
import { ProcessState } from '../components/ProcessState.js';
import { WindowTransform } from '../components/WindowTransform.js';

// Las apps ahora se cargan dinámicamente. Eliminamos imports estáticos.
// Se mantendrá un caché en memoria de los módulos cargados.
const LOADED_MODULES = new Map();

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
        // ── ABRIR VENTANA (PRIMERA VEZ) ────────────────────────────────
        win.update({ isOpen: true });

        const windowEl = this._createWindowShell(appId, manifest.name, proc, container);
        this.mountedWindows.set(appId, windowEl);

        // Animar entrada básica
        requestAnimationFrame(() =>
          requestAnimationFrame(() => windowEl.classList.add('app-window--open'))
        );

        // Carga asíncrona del módulo de la app
        this._loadAndMountApp(appId, windowEl);

      } else if (isRunning && this.mountedWindows.has(appId)) {
        // ── RESTAURAR VENTANA (DESDE PAUSED) ───────────────────────────
        const windowEl = this.mountedWindows.get(appId);
        if (windowEl && !win.isOpen) {
          win.update({ isOpen: true });
          windowEl.style.display = 'flex'; // Restaurar del minimizado
          requestAnimationFrame(() => {
            windowEl.classList.add('app-window--open');
            windowEl.classList.remove('app-window--paused');
          });
        }
      } else if (proc.state === 'PAUSED' && this.mountedWindows.has(appId)) {
        // ── MINIMIZAR VENTANA (PAUSED) ─────────────────────────────────
        const windowEl = this.mountedWindows.get(appId);
        if (win.isOpen) {
          win.update({ isOpen: false });
          windowEl.classList.remove('app-window--open');
          windowEl.classList.add('app-window--paused');
          
          // Dar tiempo a la animación CSS de salida y luego ocultar visibilidad (display area)
          setTimeout(() => {
             if (proc.state === 'PAUSED') windowEl.style.display = 'none';
          }, 350);
        }
      } else if (proc.state === 'STOPPED' && this.mountedWindows.has(appId)) {
        // ── CERRAR VENTANA DEFINITIVAMENTE ─────────────────────────────
        win.update({ isOpen: false });
        this._closeWindow(appId);
      }
    }

    // ── Sincronizar visibilidad del Shell con ventanas abiertas ────────────
    this._syncShellVisibility(container);
  }

  // ── Shell visibility (dock, status bar, window-manager z-index) ────────────

  _syncShellVisibility(container) {
    // Solo contar ventanas que no estén STOPPED o PAUSED
    let hasRunningWindows = false;
    for (const [, windowEl] of this.mountedWindows) {
      if (windowEl.classList.contains('app-window--open')) {
        hasRunningWindows = true;
        break;
      }
    }

    const dock      = document.getElementById('dock-container');
    const statusBar = document.getElementById('status-bar-container');

    if (hasRunningWindows) {
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
        <div class="app-window__actions">
          <button
            id="min-btn-${appId}"
            class="app-window__header-btn app-window__min-btn"
            aria-label="Minimizar ${appName}"
          >—</button>
          <button
            id="close-btn-${appId}"
            class="app-window__header-btn app-window__close-btn"
            aria-label="Cerrar ${appName}"
          >✕</button>
        </div>
      </div>
      <div class="app-content">
         <div class="app-loading-spinner" style="display:flex;justify-content:center;align-items:center;height:100%;color:rgba(255,255,255,0.5);">Cargando módulo...</div>
      </div>
    `;

    // Botón de Minimizar → ProcessState PAUSED
    el.querySelector(`#min-btn-${appId}`).addEventListener('click', () => {
      procComponent.update({ state: 'PAUSED' });
    });

    // Botón de Cierre → ProcessState STOPPED
    el.querySelector(`#close-btn-${appId}`).addEventListener('click', () => {
      procComponent.update({ state: 'STOPPED' });
    });

    container.appendChild(el);
    return el;
  }

  async _loadAndMountApp(appId, windowEl) {
    const contentEl = windowEl.querySelector('.app-content');
    
    try {
      let module;
      if (LOADED_MODULES.has(appId)) {
        module = LOADED_MODULES.get(appId);
      } else {
        // Dynamic import
        let appFileName = appId.charAt(0).toUpperCase() + appId.slice(1) + 'App.js';
        module = await import(`../../../apps/${appId}/${appFileName}`);
        LOADED_MODULES.set(appId, module);
      }
      
      const mountFnName = `mount${appId.charAt(0).toUpperCase() + appId.slice(1)}App`;
      if (typeof module[mountFnName] === 'function') {
        const result = module[mountFnName](contentEl, this.uid);
        if (result instanceof Promise) {
           await result;
        }
      } else {
        throw new Error(`Método ${mountFnName} no exportado.`);
      }
    } catch (err) {
      console.error(`[WindowManager] Error cargando módulo para ${appId}:`, err);
      contentEl.innerHTML = `<div style="padding:20px;color:red;">Error de módulo: ${err.message}</div>`;
    }
  }

  _closeWindow(appId) {
    const el = this.mountedWindows.get(appId);
    if (!el) return;

    // Limpiar streams/listeners si el módulo fue cargado
    if (LOADED_MODULES.has(appId)) {
      const module = LOADED_MODULES.get(appId);
      const unmountFnName = `unmount${appId.charAt(0).toUpperCase() + appId.slice(1)}App`;
      if (typeof module[unmountFnName] === 'function') {
        module[unmountFnName](el.querySelector('.app-content'));
      }
    }

    // Animar salida y remover del DOM
    el.classList.remove('app-window--open');

    const onEnd = () => el.remove();
    el.addEventListener('transitionend', onEnd, { once: true });

    // Fallback: si la transición no dispara (ej. no hay tiempo de frame)
    setTimeout(onEnd, 400);

    this.mountedWindows.delete(appId);
  }
}
