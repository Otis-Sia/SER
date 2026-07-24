"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

// Helper to generate a trusted admin token for API calls
function getAdminToken() {
  return jwt.sign(
    { id: "nextjs-server-action", email: "admin@server-action", role: "admin" },
    process.env.JWT_SECRET || "change-me-please",
    { expiresIn: "1h" }
  );
}

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";

// Define the path to the content JSON file
const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");

export async function getSiteContent() {
  try {
    const db = getAdminDb();
    if (db) {
      const docRef = db.collection("site_content").doc("main");
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        if (data._updatedAt) delete data._updatedAt;
        return data;
      } else {
        // Seed Firestore if document doesn't exist yet
        const fileContents = await fs.readFile(contentFilePath, "utf8");
        const jsonContent = JSON.parse(fileContents);
        await docRef.set({
          ...jsonContent,
          _updatedAt: new Date().toISOString(),
        });
        console.log("Seeded Firestore site_content/main document from local JSON.");
        return jsonContent;
      }
    }
  } catch (error) {
    console.error("Firestore read warning (falling back to JSON):", error.message);
  }

  // Local JSON fallback
  try {
    const fileContents = await fs.readFile(contentFilePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading site content:", error);
    throw new Error("Failed to read site content");
  }
}

export async function updateSiteContent(newData) {
  try {
    if (typeof newData !== "object" || newData === null) {
      throw new Error("Invalid data format");
    }

    const oldData = await getSiteContent();

    const db = getAdminDb();
    if (db) {
      const docRef = db.collection("site_content").doc("main");
      await docRef.set({
        ...newData,
        _updatedAt: new Date().toISOString(),
      });
      console.log("Successfully updated Firestore site_content/main document.");
    }

    // Backup write to local file
    await fs.writeFile(contentFilePath, JSON.stringify(newData, null, 2), "utf8");
    revalidatePath("/", "layout");

    // Delete orphaned S3 images after successful update
    const oldUrls = extractS3Urls(oldData);
    const newUrls = extractS3Urls(newData);
    const missingUrls = oldUrls.filter(url => !newUrls.includes(url));
    for (const url of missingUrls) {
      await deleteFromS3(url);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating site content:", error);
    return { success: false, message: error.message };
  }
}


export async function uploadImage(formData) {
  try {
    const file = formData.get("file");
    if (!file) {
      return { success: false, message: "No file provided" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || "";
    const key = `SER-${randomUUID()}${ext}`;
    const bucket = process.env.APP_AWS_S3_BUCKET_NAME || "juj4-shop-assets-2026";
    const region = process.env.APP_AWS_REGION || "eu-north-1";

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    });

    await s3Client.send(command);

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { success: true, url, key };
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return { success: false, message: error.message };
  }
}

const extractS3Urls = (obj) => {
  let urls = [];
  if (typeof obj === "string") {
    if (obj.includes("amazonaws.com/SER-")) {
      urls.push(obj);
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      urls = urls.concat(extractS3Urls(item));
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      urls = urls.concat(extractS3Urls(obj[key]));
    }
  }
  return urls;
};

async function deleteFromS3(url) {
  try {
    const urlObj = new URL(url);
    const bucket = process.env.APP_AWS_S3_BUCKET_NAME || "juj4-shop-assets-2026";
    // Key is everything after the first slash
    const key = urlObj.pathname.substring(1); 
    
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`Deleted orphaned S3 object: ${key}`);
  } catch (error) {
    console.error("Error deleting from S3:", error);
  }
}

export async function submitMemberRegistration(formData) {
  try {
    const memberData = {
      ...formData,
      name: formData.name || `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
      firstName: formData.firstName || (formData.name ? formData.name.split(" ")[0] : ""),
      lastName: formData.lastName || (formData.name ? formData.name.split(" ").slice(1).join(" ") : ""),
      middleName: formData.middleName || "",
      county: formData.county || formData.currentAddress || "",
      subCounty: formData.subCounty || "",
      crew: formData.crew || formData.crewDetails || "",
      bloodType: formData.bloodType || "",
      email: formData.email || "",
      whatsapp: formData.whatsapp || formData.phone || "",
      createdAt: new Date().toISOString(),
    };

    if (!memberData.email || (!memberData.name && !memberData.firstName)) {
      return { success: false, message: "Missing required fields" };
    }

    const db = getAdminDb();
    if (db) {
      const docRef = await db.collection("members").add(memberData);
      memberData.id = docRef.id;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
      await fetch(`${API_BASE}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: memberData.firstName,
          middle_name: memberData.middleName,
          last_name: memberData.lastName,
          county: memberData.county,
          sub_county: memberData.subCounty,
          crew: memberData.crew,
          blood_type: memberData.bloodType,
          email: memberData.email,
          whatsapp: memberData.whatsapp,
        }),
      }).catch(() => {});
    } catch (_) {}

    return { success: true, data: memberData };
  } catch (error) {
    console.error("Error submitting member registration:", error);
    return { success: false, message: error.message };
  }
}

export async function getMemberRegistrations() {
  try {
    const members = [];
    const db = getAdminDb();

    if (db) {
      const snapshot = await db.collection("members").orderBy("createdAt", "desc").get();
      snapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
    }

    if (members.length === 0) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
        const res = await fetch(`${API_BASE}/api/members`, { cache: "no-store" });
        if (res.ok) {
          const apiMembers = await res.json();
          apiMembers.forEach((m) => {
            members.push({
              id: m.id ? String(m.id) : randomUUID(),
              firstName: m.first_name || "",
              middleName: m.middle_name || "",
              lastName: m.last_name || "",
              county: m.county || "",
              subCounty: m.sub_county || "",
              crew: m.crew || "",
              bloodType: m.blood_type || "",
              email: m.email || "",
              whatsapp: m.whatsapp || "",
              createdAt: m.created_at || new Date().toISOString(),
            });
          });
        }
      } catch (_) {}
    }

    return members;
  } catch (error) {
    console.error("Error fetching member registrations:", error);
    return [];
  }
}

export async function deleteMemberRegistration(id) {
  try {
    const db = getAdminDb();
    if (db && id) {
      await db.collection("members").doc(id).delete();
      return { success: true };
    }
    return { success: false, message: "Could not delete record" };
  } catch (error) {
    console.error("Error deleting member registration:", error);
    return { success: false, message: error.message };
  }
}

export async function flagMemberRegistration(id, flagged, byEmail) {
  try {
    const db = getAdminDb();
    if (db && id) {
      await db.collection("members").doc(id).update({
        flagged: flagged,
        flaggedByEmail: flagged ? byEmail : null
      });
      return { success: true };
    }
    return { success: false, message: "Could not flag record" };
  } catch (error) {
    console.error("Error flagging member registration:", error);
    return { success: false, message: error.message };
  }
}

export async function updateMemberRegistration(id, updatedData) {
  try {
    const db = getAdminDb();
    if (db && id) {
      // Remove restricted fields before updating
      const dataToUpdate = { ...updatedData };
      delete dataToUpdate.id;
      
      await db.collection("members").doc(id).update(dataToUpdate);
      return { success: true };
    }
    return { success: false, message: "Could not update record" };
  } catch (error) {
    console.error("Error updating member registration:", error);
    return { success: false, message: error.message };
  }
}

export async function getAdminPosts() {
  try {
    const db = getAdminDb();
    if (!db) return [];
    
    const snapshot = await db.collection("posts").orderBy("created_at", "desc").get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString?.() ?? data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString?.() ?? data.updated_at ?? new Date().toISOString(),
        published_at: data.published_at?.toDate?.()?.toISOString?.() ?? data.published_at ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function createPost(data) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Database not initialized");

    const { title, slug, cover_url, body_md, published, author, created_by_email } = data;
    if (!title || !body_md) throw new Error("Title and body are required");

    const isPublished = published !== false;
    const safeSlug = (slug && String(slug).trim())
      ? String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await db.collection("posts").where("slug", "==", safeSlug).limit(1).get();
    if (!existing.empty) throw new Error("A post with that slug already exists");

    const now = new Date().toISOString();
    const postData = {
      title,
      slug: safeSlug,
      author: author || "Admin",
      cover_url: cover_url || null,
      body_md,
      published: isPublished,
      published_at: isPublished ? now : null,
      created_by_email: created_by_email || null,
      created_at: now,
      updated_at: now,
    };

    const docRef = await db.collection("posts").add(postData);
    revalidatePath("/community");
    
    return { success: true, data: { id: docRef.id, ...postData } };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: error.message };
  }
}

export async function updatePost(id, data) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Database not initialized");

    const { title, slug, cover_url, body_md, published, author } = data;
    if (!title || !body_md) throw new Error("Title and body are required");

    const isPublished = published !== false;
    const safeSlug = (slug && String(slug).trim())
      ? String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await db.collection("posts").where("slug", "==", safeSlug).limit(1).get();
    if (!existing.empty && existing.docs[0].id !== id) {
      throw new Error("A post with that slug already exists");
    }

    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error("Post not found");

    const existing_published_at = docSnap.data().published_at;
    const now = new Date().toISOString();

    const updateData = {
      title,
      slug: safeSlug,
      author: author || "Admin",
      cover_url: cover_url || null,
      body_md,
      published: isPublished,
      published_at: isPublished ? (existing_published_at || now) : null,
      updated_at: now,
    };

    await docRef.update(updateData);
    revalidatePath("/community");
    revalidatePath(`/blog/${safeSlug}`);
    
    const oldUrls = extractS3Urls(docSnap.data());
    const newUrls = extractS3Urls(updateData);
    const missingUrls = oldUrls.filter(url => !newUrls.includes(url));
    for (const url of missingUrls) {
      await deleteFromS3(url);
    }

    return { success: true, data: { id, ...docSnap.data(), ...updateData } };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, message: error.message };
  }
}

export async function deletePost(id) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Database not initialized");

    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();
    
    await docRef.delete();
    
    revalidatePath("/community");
    
    if (docSnap.exists) {
      const urls = extractS3Urls(docSnap.data());
      for (const url of urls) {
        await deleteFromS3(url);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, message: error.message };
  }
}

export async function toggleHidePost(id, hidden, email) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Database not initialized");

    const docRef = db.collection("posts").doc(id);
    const updateData = {
      hidden: hidden,
      hiddenByEmail: hidden ? email : null
    };

    await docRef.update(updateData);
    
    revalidatePath("/community");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Error toggling hide post:", error);
    return { success: false, message: error.message };
  }
}

export async function addAdminUser(name, email, password, role) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) throw new Error("Firebase Admin not initialized");

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role });

    await db.collection("admin_users").doc(email).set({
      uid: userRecord.uid,
      name,
      email,
      role,
      mustChangePassword: true,
      createdAt: new Date().toISOString()
    });

    return { success: true, user: { name, email, role, uid: userRecord.uid } };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function getAdminUsers() {
  try {
    const db = getAdminDb();
    if (!db) return [];
    
    const snapshot = await db.collection("admin_users").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

export async function deleteAdminUser(email, uid) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) throw new Error("Firebase Admin not initialized");

    if (uid) {
      await auth.deleteUser(uid);
    }
    
    await db.collection("admin_users").doc(email).delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function updateAdminEmail(oldEmail, newEmail, uid) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) throw new Error("Firebase Admin not initialized");

    if (!newEmail || !newEmail.includes("@")) throw new Error("Invalid new email address");

    // 1. Update email in Firebase Auth
    if (uid) {
      await auth.updateUser(uid, { email: newEmail });
    }

    // 2. Fetch old user document
    const oldDocRef = await db.collection("admin_users").doc(oldEmail).get();
    if (!oldDocRef.exists) throw new Error("User document not found");
    const userData = oldDocRef.data();

    // 3. Create new document and delete old document
    await db.collection("admin_users").doc(newEmail).set({
      ...userData,
      email: newEmail
    });
    await db.collection("admin_users").doc(oldEmail).delete();

    return { success: true };
  } catch (error) {
    console.error("Error updating admin email:", error);
    return { success: false, message: error.message };
  }
}

export async function flagAdminUser(email, flagged, byEmail) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Firebase Admin not initialized");
    
    await db.collection("admin_users").doc(email).update({ 
      flagged: flagged,
      flaggedByEmail: flagged ? byEmail : null
    });
    return { success: true };
  } catch (error) {
    console.error("Error flagging admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function getAdminRole(email) {
  try {
    if (!email) return null;
    const db = getAdminDb();
    if (!db) return null;

    const docRef = await db.collection("admin_users").doc(email).get();
    if (docRef.exists) {
      return docRef.data().role;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin role:", error);
    return null;
  }
}
export async function updateAdminRole(email, uid, newRole) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) throw new Error("Firebase Admin not initialized");

    if (uid) {
      await auth.setCustomUserClaims(uid, { role: newRole });
    }
    
    await db.collection("admin_users").doc(email).update({ role: newRole });

    return { success: true };
  } catch (error) {
    console.error("Error updating admin role:", error);
    return { success: false, message: error.message };
  }
}

export async function resetAdminPassword(email, uid, temporaryPassword) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) throw new Error("Firebase Admin not initialized");

    if (!uid) throw new Error("User ID is required to reset password");
    
    // Update password in Firebase Auth
    await auth.updateUser(uid, { password: temporaryPassword });
    
    // Flag user to change password again
    await db.collection("admin_users").doc(email).update({ mustChangePassword: true });

    return { success: true };
  } catch (error) {
    console.error("Error resetting admin password:", error);
    return { success: false, message: error.message };
  }
}

export async function getAdminUserData(email) {
  try {
    if (!email) return null;
    const db = getAdminDb();
    if (!db) return null;

    const docRef = await db.collection("admin_users").doc(email).get();
    if (docRef.exists) {
      return docRef.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin user data:", error);
    return null;
  }
}

export async function clearMustChangePassword(email, name, username) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Firebase Admin not initialized");
    
    await db.collection("admin_users").doc(email).update({ 
      mustChangePassword: false,
      name: name || "",
      username: username || ""
    });
    return { success: true };
  } catch (error) {
    console.error("Error clearing mustChangePassword:", error);
    return { success: false, message: error.message };
  }
}

// --- Dynamic Collection CRUD Operations ---

async function fetchCollection(collectionName, orderByField = "createdAt", orderDirection = "desc") {
  try {
    const db = getAdminDb();
    if (!db) return [];
    
    let snapshot;
    try {
      snapshot = await db.collection(collectionName).orderBy(orderByField, orderDirection).get();
    } catch (e) {
      // Fallback if index doesn't exist
      snapshot = await db.collection(collectionName).get();
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

async function addDocument(collectionName, data) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const docRef = db.collection(collectionName).doc();
    await docRef.set({ ...data, createdAt: new Date().toISOString() });
    
    revalidatePath("/", "layout");
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}

async function updateDocument(collectionName, id, data) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    
    await docRef.update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    revalidatePath("/", "layout");
    
    if (docSnap.exists) {
      const oldUrls = extractS3Urls(docSnap.data());
      const newUrls = extractS3Urls(data);
      const missingUrls = oldUrls.filter(url => !newUrls.includes(url));
      for (const url of missingUrls) {
        await deleteFromS3(url);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating ${collectionName}/${id}:`, error);
    return { success: false, message: error.message };
  }
}

async function deleteDocument(collectionName, id) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    
    await docRef.delete();
    revalidatePath("/", "layout");
    
    if (docSnap.exists) {
      const urls = extractS3Urls(docSnap.data());
      for (const url of urls) {
        await deleteFromS3(url);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id}:`, error);
    return { success: false, message: error.message };
  }
}

// Collection-specific Exports
export const getProjects = async () => fetchCollection("projects");
export const addProject = async (data) => addDocument("projects", data);
export const updateProject = async (id, data) => updateDocument("projects", id, data);
export const deleteProject = async (id) => deleteDocument("projects", id);

export const getEvents = async () => fetchCollection("events");
export const addEvent = async (data) => addDocument("events", data);
export const updateEvent = async (id, data) => updateDocument("events", id, data);
export const deleteEvent = async (id) => deleteDocument("events", id);

export const getGalleryItems = async () => fetchCollection("gallery");
export const addGalleryItem = async (data) => addDocument("gallery", data);
export const updateGalleryItem = async (id, data) => updateDocument("gallery", id, data);
export const deleteGalleryItem = async (id) => deleteDocument("gallery", id);

export const getFaqs = async () => fetchCollection("faqs", "order", "asc");
export const addFaq = async (data) => addDocument("faqs", data);
export const updateFaq = async (id, data) => updateDocument("faqs", id, data);
export const deleteFaq = async (id) => deleteDocument("faqs", id);

export const getProducts = async () => fetchCollection("products");
export const addProduct = async (data) => addDocument("products", data);
export const updateProduct = async (id, data) => updateDocument("products", id, data);
export const deleteProduct = async (id) => deleteDocument("products", id);

export async function getDashboardStats() {
  try {
    const db = getAdminDb();
    if (!db) return {};

    const collectionsMap = {
      blogs: "posts",
      admin_users: "admin_users",
      events: "events",
      projects: "projects",
      member_registrations: "members",
      products: "products"
    };

    const stats = {};

    await Promise.all(
      Object.entries(collectionsMap).map(async ([stateKey, collectionName]) => {
        try {
          const snapshot = await db.collection(collectionName).count().get();
          stats[stateKey] = snapshot.data().count;
        } catch (e) {
          // If the collection doesn't exist or error occurs, default to 0
          stats[stateKey] = 0;
        }
      })
    );

    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {};
  }
}
