import { initializeApp } from 'firebase/app';

let _app = null;

// Initializes Firebase using config received securely from the main process via IPC.
// Credentials never appear in source code or in bundle.js.
export async function getFirebaseApp() {
  if (_app) return _app;
  const config = await window.kumaAPI.firebase.getConfig();
  _app = initializeApp(config);
  return _app;
}
