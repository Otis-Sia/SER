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
        console.error("Error reading serviceAccountKey at " + p + ":", err);
      }
    }
  }
  return null;
}

async function seedSuperAdmin() {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    console.error("No serviceAccountKey.json found. Cannot seed admin.");
    process.exit(1);
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore(app);
  const auth = getAuth(app);

  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node seed-admin.js <email> <password>");
    process.exit(1);
  }

  try {
    let uid;
    try {
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
      console.log("User already exists in Firebase Auth. Updating role...");
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        const userRecord = await auth.createUser({
          email,
          password,
        });
        uid = userRecord.uid;
        console.log("User created in Firebase Auth.");
      } else {
        throw e;
      }
    }

    await auth.setCustomUserClaims(uid, { role: "Super Admin" });

    await db.collection("admin_users").doc(email).set({
      uid,
      email,
      role: "Super Admin",
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log("Successfully seeded Super Admin: " + email);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
