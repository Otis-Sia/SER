/**
 * Centralized server configuration.
 * All magic numbers and environment-dependent values live here.
 */
import dotenv from "dotenv";
dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // Server
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST || undefined,

  // Auth
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  // Rate limiting
  rateLimitWindowMs:
    Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,

  // File uploads
  maxFileUploadBytes:
    Number(process.env.MAX_FILE_UPLOAD_BYTES) || 10 * 1024 * 1024,

  // S3
  s3KeyPrefix: process.env.S3_KEY_PREFIX || "SER-",

  // Google Calendar
  timezone: process.env.APP_TIMEZONE || "Africa/Nairobi",
  googleCalendarMaxResults:
    Number(process.env.GOOGLE_CALENDAR_MAX_RESULTS) || 50,
  defaultEventDurationMs:
    Number(process.env.DEFAULT_EVENT_DURATION_MS) || 60 * 60 * 1000,
  googleCredentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || undefined,

  // Firestore collection names
  firestoreCollections: {
    posts: process.env.FIRESTORE_POSTS_COLLECTION || "posts",
    siteContent:
      process.env.FIRESTORE_SITE_CONTENT_COLLECTION || "site_content",
    projects: process.env.FIRESTORE_PROJECTS_COLLECTION || "projects",
    events: process.env.FIRESTORE_EVENTS_COLLECTION || "events",
    gallery: process.env.FIRESTORE_GALLERY_COLLECTION || "gallery",
    faqs: process.env.FIRESTORE_FAQS_COLLECTION || "faqs",
    products: process.env.FIRESTORE_PRODUCTS_COLLECTION || "products",
  },
};
