import { db } from "../utils/firebase.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, "../../../client/src/data/siteContent.json");

async function seedFirestore() {
  if (!db) {
    console.error("Firestore database instance is not initialized. Check your credentials.");
    process.exit(1);
  }

  console.log("Starting Firestore NoSQL Seeding from siteContent.json...");

  try {
    const rawData = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(rawData);

    // 1. Seed Site Content Documents
    console.log("--> Seeding collection: 'site_content'...");
    
    await db.collection("site_content").doc("metadata").set({
      siteMeta: data.siteMeta || {},
      navigation: data.navigation || [],
      updatedAt: new Date().toISOString()
    });

    await db.collection("site_content").doc("home").set({
      ...data.home,
      updatedAt: new Date().toISOString()
    });

    await db.collection("site_content").doc("about").set({
      ...data.about,
      updatedAt: new Date().toISOString()
    });

    await db.collection("site_content").doc("contact").set({
      ...data.contact,
      updatedAt: new Date().toISOString()
    });

    await db.collection("site_content").doc("faq_meta").set({
      title: data.faq?.title || "Frequently Asked Questions (FAQs)",
      description: data.faq?.description || "",
      updatedAt: new Date().toISOString()
    });

    // 2. Seed Projects Collection
    if (data.projects && data.projects.items) {
      console.log("--> Seeding collection: 'projects'...");
      const batch = db.batch();
      data.projects.items.forEach((project) => {
        const docRef = db.collection("projects").doc(project.id || db.collection("projects").doc().id);
        batch.set(docRef, {
          title: project.title,
          focus: project.focus || "",
          description: project.description || "",
          link: project.link || "",
          linkText: project.linkText || "",
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // 3. Seed Events Collection
    if (data.events && data.events.items) {
      console.log("--> Seeding collection: 'events'...");
      const batch = db.batch();
      data.events.items.forEach((event) => {
        const docRef = db.collection("events").doc(event.id || db.collection("events").doc().id);
        batch.set(docRef, {
          title: event.title,
          eventDate: event.date || "",
          location: event.location || "",
          description: event.description || "",
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // 4. Seed Gallery Collection
    if (data.gallery && data.gallery.items) {
      console.log("--> Seeding collection: 'gallery'...");
      const batch = db.batch();
      data.gallery.items.forEach((item, index) => {
        const docRef = db.collection("gallery").doc(`item_${index + 1}`);
        batch.set(docRef, {
          title: item.title,
          imageUrl: item.image,
          alt: item.alt || "",
          description: item.description || "",
          featured: false,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // 5. Seed FAQs Collection
    if (data.faq && data.faq.questions) {
      console.log("--> Seeding collection: 'faqs'...");
      const batch = db.batch();
      data.faq.questions.forEach((faqItem, index) => {
        const docRef = db.collection("faqs").doc(`faq_${index + 1}`);
        batch.set(docRef, {
          question: faqItem.q,
          answer: faqItem.a,
          order: index + 1,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // 6. Seed Initial Sample Products Collection
    console.log("--> Seeding collection: 'products'...");
    const sampleProducts = [
      {
        id: "prod_1",
        name: "Official SER First Aid Kit",
        priceKes: 2500,
        imageUrl: "https://via.placeholder.com/300?text=First+Aid+Kit",
        description: "Compact emergency response first aid kit containing essential medical supplies.",
        featured: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "prod_2",
        name: "SER Branded T-Shirt",
        priceKes: 1200,
        imageUrl: "https://via.placeholder.com/300?text=SER+T-Shirt",
        description: "High-quality cotton t-shirt with official Scouts Emergency Response logo.",
        featured: true,
        createdAt: new Date().toISOString()
      }
    ];

    const productBatch = db.batch();
    sampleProducts.forEach((prod) => {
      const docRef = db.collection("products").doc(prod.id);
      productBatch.set(docRef, prod);
    });
    await productBatch.commit();

    console.log("[SUCCESS] Firestore NoSQL Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Error seeding Firestore database:", error);
    process.exit(1);
  }
}

seedFirestore();
