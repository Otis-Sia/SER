const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function update() {
  const docRef = db.collection("site_content").doc("main");
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const data = docSnap.data();
    
    // Read the new JSON
    const contentFilePath = path.join(__dirname, "src", "data", "siteContent.json");
    const jsonContent = JSON.parse(fs.readFileSync(contentFilePath, "utf8"));

    if (!data.home.onTheGroundMoments) {
      console.log("Adding onTheGroundMoments to Firestore...");
      data.home.onTheGroundMoments = jsonContent.home.onTheGroundMoments;
      await docRef.set(data);
      console.log("Successfully updated Firestore!");
    } else {
      console.log("onTheGroundMoments already exists in Firestore.");
    }
  } else {
    console.log("Document doesn't exist.");
  }
}

update().catch(console.error);
