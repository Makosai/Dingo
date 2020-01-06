// Firebase imports
import * as admin from 'firebase-admin';

// Config
import firebaseCredentials from './firebase.config.json';

const serviceAccount = firebaseCredentials as admin.ServiceAccount;

// console.log(serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
}); // Firebase Admin
export const db = admin.firestore(); // Firestore Database
