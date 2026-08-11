import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// If you want analytics in the future
// import { getAnalytics } from "firebase/analytics";

import { config } from "@/lib/config";

const firebaseConfig = config.firebase;

let app;
let auth;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} else {
  console.warn("Firebase config is missing apiKey. Skipping initialization (likely during build).");
  // Provide a mock auth object so components don't crash when importing it
  auth = {
    onAuthStateChanged: () => () => {},
    currentUser: null,
  };
}

export { app, auth };
