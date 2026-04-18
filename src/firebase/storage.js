// src/firebase/storage.js
// Firebase Storage — activo desde Fase 4.
// Las fotos de la Cámara se guardan como dataURL en RTDB (no en Storage)
// para simplicidad y para evitar reglas de Storage adicionales.
// Este módulo queda disponible para uso futuro (ej. subir archivos grandes).

import { getStorage }    from 'firebase/storage';
import { getFirebaseApp } from './firebaseConfig.js';

let _storage = null;

export async function getFirebaseStorage() {
  if (_storage) return _storage;
  const app  = await getFirebaseApp();
  _storage   = getStorage(app);
  return _storage;
}
