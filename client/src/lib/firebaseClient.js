import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// If you want analytics in the future
// import { getAnalytics } from "firebase/analytics";

import { config } from "@/lib/config";

const firebaseConfig = config.firebase;

// Initialize Firebase only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { app, auth };
