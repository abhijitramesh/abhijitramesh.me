import admin from 'firebase-admin';

let db = null;

try {
  if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: process.env.FIREBASE_PROJECT_ID || 'leerob-blog'
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://abhijitramesh-me-301907-default-rtdb.firebaseio.com/'
    });
    db = admin.database();
  }
} catch (error) {
  console.log('Firebase admin initialization error:', error.message);
}

export default db;
