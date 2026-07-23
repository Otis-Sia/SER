const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

async function check() {
  const db = getFirestore();
  const collections = await db.listCollections();
  console.log("Collections:", collections.map(c => c.id));
}
check().catch(console.error);
