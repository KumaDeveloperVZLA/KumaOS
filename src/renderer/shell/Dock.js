export function renderDock(container) {
  container.style.position = 'absolute';
  container.style.bottom = '10px';
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.width = '90%';
  container.style.height = '80px';
  container.style.borderRadius = '24px';
  container.classList.add('glass-panel'); // Usa la clase CSS de main.css

  container.innerHTML = `
    <div style="display: flex; justify-content: space-around; align-items: center; height: 100%; padding: 0 10px;">
      <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 12px;"></div>
      <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 12px;"></div>
      <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 12px;"></div>
      <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.5); border-radius: 12px;"></div>
    </div>
  `;
}
