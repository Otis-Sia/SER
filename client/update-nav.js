const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const saPath = path.join(process.cwd(), "serviceAccountKey.json");
if (!fs.existsSync(saPath)) { console.error("No service account found"); process.exit(1); }
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

const app = initializeApp({ credential: cert(sa) });
const db = getFirestore(app);

const jsonPath = path.join(process.cwd(), "src", "data", "siteContent.json");
const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

(async () => {
  const docRef = db.collection('site_content').doc('main');
  await docRef.set({
    ...jsonContent,
    _updatedAt: new Date().toISOString(),
  });
  console.log('Successfully synced Firestore with siteContent.json!');
})();
