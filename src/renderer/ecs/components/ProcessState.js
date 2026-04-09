import { APP_STATES } from '../../../shared/AppStates.js'; // Ajustar ruta luego si es necesario

export class ProcessState {
  constructor(initialState = 'BOOTING') { // Simular enum
    this.state = initialState;
  }
}
