export class AppStore {
  constructor() {
    this.name = "AppStore";
  }
  start() {
    console.log("AppStore iniciada");
  }
  
  async installApp(appId) {
    console.log(`Instalando app: ${appId} desde Firebase...`);
    // Simular descarga
    return true;
  }
}
