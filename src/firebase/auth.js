import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from './firebaseConfig.js';

let _auth = null;

export async function getFirebaseAuth() {
  if (_auth) return _auth;
  const app = await getFirebaseApp();
  _auth = getAuth(app);
  return _auth;
}
