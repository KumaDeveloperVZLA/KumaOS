export function renderStatusBar(container) {
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.padding = '12px 24px';
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';
  container.style.color = 'white';
  container.style.fontSize = '14px';
  container.style.fontWeight = '500';
  container.style.zIndex = '100';

  const updateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeEl = container.querySelector('.time-display');
    if (timeEl) timeEl.textContent = timeString;
  };

  container.innerHTML = `
    <div class="time-display">--:--</div>
    <div class="status-icons">
        <span style="margin-right: 5px;">📶</span>
        <span style="margin-right: 5px;">WiFi</span>
        <span>🔋 100%</span>
    </div>
  `;

  updateTime();
  setInterval(updateTime, 1000);
}
