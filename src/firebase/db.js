import { getDatabase } from 'firebase/database';
import { getFirebaseApp } from './firebaseConfig.js';

let _db = null;

export async function getFirebaseDB() {
  if (_db) return _db;
  const app = await getFirebaseApp();
  _db = getDatabase(app);
  return _db;
}
