import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

function getServiceAccount() {
  const possiblePaths = [
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "..", "server", "serviceAccountKey.json"),
    path.join(process.cwd(), "src", "data", "serviceAccountKey.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (err) {
        console.error(`Error reading serviceAccountKey at ${p}:`, err);
      }
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    }
  }

  return null;
}

let dbInstance = null;

export function getAdminDb() {
  if (dbInstance) return dbInstance;

  const serviceAccount = getServiceAccount();
  if (serviceAccount && !getApps().length) {
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    dbInstance = getFirestore(app);
    console.log("Firebase Admin initialized for project:", serviceAccount.project_id);
  } else if (getApps().length) {
    dbInstance = getFirestore(getApps()[0]);
  } else {
    console.warn("Firebase Admin: No service account credentials found.");
  }

  return dbInstance;
}
