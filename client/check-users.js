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
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (err) {
        // ignore
      }
    }
  }
  return null;
}

async function checkUsers() {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    console.log("No serviceAccountKey.json found.");
    return;
  }

  const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
  const db = getFirestore(app);
  const auth = getAuth(app);

  try {
    const listUsersResult = await auth.listUsers(1000);
    console.log("--- Users in Firebase Auth ---");
    listUsersResult.users.forEach((userRecord) => {
      console.log(userRecord.email + " (UID: " + userRecord.uid + ")");
    });

    const snapshot = await db.collection("admin_users").get();
    console.log("\n--- Users in Firestore admin_users ---");
    snapshot.forEach(doc => {
      console.log(doc.id + " => " + JSON.stringify(doc.data()));
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
checkUsers();
