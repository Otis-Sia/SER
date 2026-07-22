import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve(__dirname, "../../serviceAccountKey.json");

let serviceAccount;

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
  }
}

let app;
if (serviceAccount && !getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized successfully for project:", serviceAccount.project_id);
} else if (getApps().length) {
  app = getApps()[0];
} else {
  console.warn("Firebase Admin SDK warning: No service account credentials found.");
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export default app;
