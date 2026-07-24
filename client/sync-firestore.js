const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const possiblePaths = [
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "..", "server", "serviceAccountKey.json"),
    path.join(process.cwd(), "src", "data", "serviceAccountKey.json"),
];

let sa = null;
for(let p of possiblePaths) {
  if (fs.existsSync(p)) { sa = JSON.parse(fs.readFileSync(p, 'utf8')); break; }
}

if (!sa) { console.error("No service account found"); process.exit(1); }

const app = initializeApp({ credential: cert(sa) });
const db = getFirestore(app);

(async () => {
  const docRef = db.collection('site_content').doc('main');
  const snap = await docRef.get();
  if(!snap.exists) { console.error("Document not found"); process.exit(1); }
  let data = snap.data();
  
  let modified = false;
  if(data.siteMeta && data.siteMeta.osns) {
      if(!data.contact) data.contact = {};
      data.contact.osns = data.siteMeta.osns;
      delete data.siteMeta.osns;
      modified = true;
  }
  
  if(!data.shop) {
      data.shop = {
        title: 'Welcome to the SER Shop',
        description: 'Support SER through official merchandise and essential safety items.',
        items: []
      };
      modified = true;
  }
  
  if(modified) {
      data._updatedAt = new Date().toISOString();
      await docRef.set(data);
      console.log('Successfully updated Firestore with shop and osns changes.');
  } else {
      console.log('No updates needed in Firestore.');
  }
})();
