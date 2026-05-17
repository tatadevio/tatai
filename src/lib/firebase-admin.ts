import { getApps, initializeApp, cert } from "firebase-admin/app";

export function initializeAdminApp() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID not set");

    if (clientEmail && privateKey) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } else {
      // Minimal init — token verification via REST API fallback will be used
      initializeApp({ projectId });
    }
  }
}
