/**
 * Centralized client configuration.
 * All environment-dependent values live here — no hardcoded secrets or URLs in components.
 */

export const config = {
  // Site
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.seresponse.org",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000",

  // SplitForms
  splitformsAccessKey: process.env.NEXT_PUBLIC_SPLITFORMS_ACCESS_KEY || "",
  splitformsApiUrl:
    process.env.NEXT_PUBLIC_SPLITFORMS_API_URL ||
    "https://splitforms.com/api/submit",

  // Auth (Server actions only, but good to have a default fallback instead of throwing for local dev)
  jwtSecret: process.env.JWT_SECRET || "ser-jwt-secret-key-change-me",

  // AWS S3
  aws: {
    region: process.env.APP_AWS_REGION || "eu-north-1",
    bucketName: process.env.APP_AWS_S3_BUCKET_NAME || "juj4-shop-assets-2026",
  },

  // Firebase Client SDK
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "seresponse-f4bb2.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "seresponse-f4bb2",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "seresponse-f4bb2.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  },
};
