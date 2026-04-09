export function renderNotificationTray(container) {
  // Inicialmente oculto o vacío. Se puede manejar más adelante con el ECS y animaciones.
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.background = 'rgba(0,0,0,0.5)';
  container.style.backdropFilter = 'blur(10px)';
  container.style.display = 'none'; // Hidden by default
  container.style.zIndex = '90'; // Just below status bar or above

  container.innerHTML = `
    <div style="padding: 60px 20px; color: white;">
      <h2>Notificaciones</h2>
      <p>No hay notificaciones nuevas</p>
    </div>
  `;
}
