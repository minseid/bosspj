import * as admin from 'firebase-admin';

function getAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (() => {
          const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
          console.log("Loaded FIREBASE_PRIVATE_KEY (first 50 chars):", privateKey?.substring(0, 50));
          console.log("Loaded FIREBASE_PRIVATE_KEY (last 50 chars):", privateKey?.substring(privateKey.length - 50));
          return privateKey;
        })(),
      }),
    });
  }
  return admin;
}

export const adminAuth = getAdminApp().auth();
export const adminDb = getAdminApp().firestore();
