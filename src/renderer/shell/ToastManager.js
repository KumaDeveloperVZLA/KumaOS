/**
 * ToastManager — Sistema centralizado de notificaciones Toast.
 *
 * Renderiza toasts en el contenedor #toast-container en el DOM.
 * Los toasts se apilan, tienen animación de entrada/salida y desaparecen
 * automáticamente después de 4 segundos.
 *
 * Uso:
 *   import { showToast } from './ToastManager.js';
 *   showToast('Mensaje nuevo de alguien');
 */

const TOAST_DURATION = 4000; // ms

export function showToast(message, type = 'info') {
  const container = _getOrCreateContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast-msg">${message}</span>`;

  container.appendChild(toast);

  // Animar entrada (pequeño delay para que el browser pinte el estado inicial)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });

  // Auto-remover
  const remove = () => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  toast.addEventListener('click', remove);
  setTimeout(remove, TOAST_DURATION);
}

function _getOrCreateContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}
