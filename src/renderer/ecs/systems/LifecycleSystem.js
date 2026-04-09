export class LifecycleSystem {
  constructor() {
    this.name = "LifecycleSystem";
  }
  
  update(dt) {
    // Lógica para procesar transiciones de estado de las apps
  }

  register(bundle, manifest) {
    console.log(`Registrando app: ${manifest.name}`);
    // Añadir AppEntity al world
  }
}
