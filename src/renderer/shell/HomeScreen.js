export function renderHomeScreen(container) {
  // Un grid sencillo para los íconos de las apps
  container.innerHTML = `
    <style>
      .home-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 40px 20px;
        height: 100%;
      }
      .app-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }
      .app-icon-img {
        width: 60px;
        height: 60px;
        background: rgba(255,255,255,0.2);
        border-radius: 14px;
        margin-bottom: 5px;
      }
      .app-icon-label {
        color: white;
        font-size: 11px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }
    </style>
    <div class="home-grid">
      <!-- Mocks de apps -->
      <div class="app-icon" onclick="console.log('App clikeada')">
        <div class="app-icon-img" style="background:#ff3b30"></div>
        <span class="app-icon-label">Camera</span>
      </div>
      <div class="app-icon">
        <div class="app-icon-img" style="background:#34c759"></div>
        <span class="app-icon-label">Messages</span>
      </div>
       <div class="app-icon">
        <div class="app-icon-img" style="background:#007aff"></div>
        <span class="app-icon-label">Store</span>
      </div>
    </div>
  `;
}
