const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");
const path = require("path");

function getServiceAccount() {
  const possiblePaths = [
    path.join(__dirname, "serviceAccountKey.json"),
    path.join(__dirname, "..", "server", "serviceAccountKey.json"),
    path.join(__dirname, "src", "data", "serviceAccountKey.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (err) {}
    }
  }
  return null;
}

async function fixUser() {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return;
  const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
  const db = getFirestore(app);
  const auth = getAuth(app);

  const email = "sia.elvis@yahoo.com";
  try {
    const userRecord = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(userRecord.uid, { role: "Super Admin" });
    await db.collection("admin_users").doc(email).set({
      uid: userRecord.uid,
      email: email,
      role: "Super Admin",
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log("Successfully synced " + email + " to admin_users collection!");
  } catch(e) {
    console.error(e);
  }
}
fixUser();
