import { Component } from 'ape-ecs';

// Componente ECS que describe el estado visual de la ventana de una app.
// Dado que KumaOS es un simulador móvil, todas las ventanas son fullscreen.
export class WindowTransform extends Component {}
WindowTransform.properties = {
  isOpen:     false,  // ¿Está la ventana visible?
  zIndex:     10,     // Orden en el eje Z dentro del window-manager
  fullscreen: true,   // Siempre true en el simulador móvil
};
