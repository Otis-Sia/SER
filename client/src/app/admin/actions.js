"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { config } from "@/lib/config";

// Helper to generate a trusted admin token for API calls
function getAdminToken() {
  return jwt.sign(
    { id: "nextjs-server-action", email: "admin@server-action", role: "admin" },
    config.jwtSecret,
    { expiresIn: "1h" }
  );
}

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";

const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");

let siteContentCache = null;

export const getSiteContent = cache(async () => {
  if (siteContentCache) {
    return siteContentCache;
  }

  let data = {};
  
  // 1. Read local JSON for the bulk of the content
  try {
    const fileContents = await fs.readFile(contentFilePath, "utf8");
    data = JSON.parse(fileContents);
    siteContentCache = data;
  } catch (error) {
    console.error("Error reading siteContent.json:", error);
    // If it fails, data is just an empty object
  }

  // Removed communications (embeds) DB fetch since they are now managed in the social_media collection.

  if (data._updatedAt) delete data._updatedAt;
  
  // Removed legacy home.hero.bgImage injection because it is now managed in SiteMeta

  if (data.home && Array.isArray(data.home.partners)) {
    data.home.partners = data.home.partners.map(partner => {
      if (typeof partner === 'string') {
        return { name: partner, logo: "" };
      }
      return partner;
    });
  }

  if (data.about && Array.isArray(data.about.team)) {
    data.about.team.forEach((member, idx) => {
      if (member.position === undefined) {
        member.position = (idx + 1).toString();
      }
    });
  }

  if (!data.siteMeta) data.siteMeta = {};

  // MIGRATION: Move data.contact.osns (social profiles) into data.siteMeta.socialProfiles
  if (data.contact && data.contact.osns) {
    data.siteMeta.socialProfiles = data.contact.osns;
    delete data.contact.osns;
  }

  const bgDefaults = [
    "homeHeroBgImage", "aboutHeroBgImage", "communityHeroBgImage", 
    "contactHeroBgImage", "eventsHeroBgImage", "loginHeroBgImage", 
    "projectsHeroBgImage", "shopHeroBgImage"
  ];
  bgDefaults.forEach(field => {
    if (data.siteMeta[field] === undefined) {
      data.siteMeta[field] = "/assets/images/backgrounds/scouts_hero_bg.jpg";
    }
  });

  if (data.home && !data.home.impactInMotion) {
    data.home.impactInMotion = [
      {
        number: "120+",
        title: "Community Drills",
        description: "Hands-on trainings that keep neighborhoods ready for any emergency."
      },
      {
        number: "45",
        title: "Youth-Led Teams",
        description: "Rapid response groups coordinating relief and safety awareness."
      },
      {
        number: "3000+",
        title: "Lives Reached",
        description: "Preparedness workshops supporting families across our region."
      }
    ];
  }

  if (data.home && !data.home.exploreOrganization) {
    data.home.exploreOrganization = [
      {
        title: "History of Scouting",
        description: "Discover the origins and growth of the Scouting movement.",
        linkText: "Read More",
        linkUrl: "/about"
      },
      {
        title: "Scouts & SDGs",
        description: "How Scouts contribute to global sustainable development.",
        linkText: "See Our Impact",
        linkUrl: "/projects"
      },
      {
        title: "Our Leaders",
        description: "Meet the leadership guiding SER initiatives.",
        linkText: "View Leaders",
        linkUrl: "/about"
      },
      {
        title: "Jasiri Rover Scouts",
        description: "Learn about our active Rover Scout community.",
        linkText: "Learn More",
        linkUrl: "/community"
      }
    ];
  }

  if (data.home && !data.home.storiesOnTheMove) {
    data.home.storiesOnTheMove = [
      {
        title: "Emergency Prep Hubs",
        description: "Mobile kits and first aid stations deployed across local events."
      },
      {
        title: "Volunteer Spotlight",
        description: "Rover Scouts leading drills, fire safety lessons, and rapid response."
      },
      {
        title: "Community Partnerships",
        description: "Collaborations that keep resources and training moving year-round."
      }
    ];
  }

  // Communications defaults removed.
  
  if (data.contact && data.contact.adminEmail === undefined) {
    data.contact.adminEmail = "admin@seresponse.org";
  }

  return data;
});

export async function updateSiteContent(newData) {
  try {
    if (typeof newData !== "object" || newData === null) {
      throw new Error("Invalid data format");
    }

    const oldData = await getSiteContent();

    // Save to local JSON
    await fs.writeFile(contentFilePath, JSON.stringify(newData, null, 2), "utf8");
    siteContentCache = null;
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
    const bucket = config.aws.bucketName;
    const region = config.aws.region;

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
    const bucket = config.aws.bucketName;
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
      const API_BASE = config.apiUrl;
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

export async function findMemberRegistration(idNumber, contactStr, nationality, idType) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "Database not initialized" };

    if (!idNumber || !contactStr) {
      return { success: false, message: "Missing search criteria" };
    }

    // Query for the ID number
    const snapshot = await db.collection("members").where("idNumber", "==", String(idNumber)).get();
    if (snapshot.empty) return { success: false, message: "No match found" };

    let matchedDoc = null;
    const searchContact = String(contactStr).toLowerCase().trim();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const emailMatch = data.email && data.email.toLowerCase().trim() === searchContact;
      const phoneMatch = data.phone && data.phone.replace(/\s+/g, '') === searchContact.replace(/\s+/g, '');
      const waMatch = data.whatsapp && data.whatsapp.replace(/\s+/g, '') === searchContact.replace(/\s+/g, '');

      const nationalityMatch = !nationality || !data.nationality || data.nationality === nationality;
      const idTypeMatch = !idType || !data.idType || data.idType === idType;

      if ((emailMatch || phoneMatch || waMatch) && nationalityMatch && idTypeMatch) {
        matchedDoc = { id: doc.id, ...data };
      }
    });

    if (matchedDoc) {
      return { success: true, data: matchedDoc };
    } else {
      return { success: false, message: "No match found" };
    }
  } catch (error) {
    console.error("Error finding member registration:", error);
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
        const API_BASE = config.apiUrl;
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

export async function updateAdminProfile(email, uid, newName, newPassword) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) throw new Error("Firebase Admin not initialized");

    let updatePayload = {};
    if (newName) updatePayload.displayName = newName;
    if (newPassword) updatePayload.password = newPassword;

    if (uid && Object.keys(updatePayload).length > 0) {
      await auth.updateUser(uid, updatePayload);
    }

    if (newName) {
      await db.collection("admin_users").doc(email).update({ name: newName });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating admin profile:", error);
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

export const getEvents = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, { cache: "no-store" });
    if (!res.ok) return [];
    const events = await res.json();
    return events.map(e => ({
      ...e,
      eventDate: e.event_date ? new Date(e.event_date).toISOString().split('T')[0] : ''
    }));
  } catch (err) {
    console.error("Error fetching events from API:", err);
    return [];
  }
};

export const addEvent = async (data) => {
  try {
    const payload = {
      title: data.title,
      event_date: data.eventDate,
      location: data.location,
      description: data.description
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || "Failed to create event");
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Error adding event:", err);
    return { success: false, message: err.message };
  }
};

export const updateEvent = async (id, data) => {
  try {
    const payload = {
      title: data.title,
      event_date: data.eventDate,
      location: data.location,
      description: data.description,
      google_event_id: data.google_event_id
    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || "Failed to update event");
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Error updating event:", err);
    return { success: false, message: err.message };
  }
};

export const deleteEvent = async (id) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getAdminToken()}`
      }
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || "Failed to delete event");
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, message: err.message };
  }
};

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
    const [blogs, admin_users, events, projects, member_registrations, products] = await Promise.all([
      getAdminPosts(),
      getAdminUsers(),
      getEvents(),
      getProjects(),
      getMemberRegistrations(),
      getProducts()
    ]);

    return {
      blogs: blogs ? blogs.length : 0,
      admin_users: admin_users ? admin_users.length : 0,
      events: events ? events.length : 0,
      projects: projects ? projects.length : 0,
      member_registrations: member_registrations ? member_registrations.length : 0,
      products: products ? products.length : 0
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {};
  }
}

export async function checkDuplicateMember(email, phone, nationality, idType, idNumber) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "Database not initialized" };

    if (email) {
      const emailSnap = await db.collection("members").where("email", "==", email.toLowerCase().trim()).limit(1).get();
      if (!emailSnap.empty) {
        return { duplicate: true, field: "Email Address", message: "A member with this email address already exists." };
      }
    }

    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const phoneSnap = await db.collection("members").where("phone", "==", cleanPhone).limit(1).get();
      if (!phoneSnap.empty) {
        return { duplicate: true, field: "Phone Number", message: "A member with this phone number already exists." };
      }
      const whatsappSnap = await db.collection("members").where("whatsapp", "==", cleanPhone).limit(1).get();
      if (!whatsappSnap.empty) {
        return { duplicate: true, field: "Phone Number", message: "A member with this phone number already exists." };
      }
    }

    if (idNumber && idNumber !== "0000" && idType && idType !== "N/A" && nationality) {
      const snap = await db.collection("members")
        .where("idNumber", "==", String(idNumber))
        .where("idType", "==", idType)
        .where("nationality", "==", nationality)
        .limit(1).get();
      if (!snap.empty) {
        return { duplicate: true, field: "Identity Details", message: "A member with these identity details (Nationality, ID Type, and ID Number) already exists." };
      }
    }

    return { duplicate: false };
  } catch (error) {
    console.error("Error checking duplicate member:", error);
    return { success: false, message: error.message };
  }
}
// NEW CRUD for Contacts and Socials

export async function getContacts() {
  try {
    const db = getAdminDb();
    if (!db) return [];
    const snapshot = await db.collection("contacts").orderBy("order", "asc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function addContact(data) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "DB not initialized" };
    
    // Auto-set created_at
    const contactData = {
      ...data,
      created_at: new Date().toISOString()
    };
    
    const docRef = await db.collection("contacts").add(contactData);
    revalidatePath("/", "layout");
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateContact(id, data) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "DB not initialized" };
    
    // Prevent id from being written into document fields
    const updateData = { ...data };
    delete updateData.id;

    await db.collection("contacts").doc(id).update(updateData);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteContact(id) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "DB not initialized" };
    
    await db.collection("contacts").doc(id).delete();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Social Media CRUD
export const getSocialMedia = cache(async () => {
  try {
    const db = getAdminDb();
    if (!db) return [];
    const snapshot = await db.collection("social_media").orderBy("platform", "asc").get();
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Filter out Profile Links since they are managed in SiteMeta now
    return docs.filter(doc => doc.type !== "Profile Link");
  } catch (error) {
    console.error("Error fetching social media:", error);
    return [];
  }
});

export async function addSocialMedia(data) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "DB not initialized" };
    
    const socialData = {
      ...data,
      created_at: new Date().toISOString()
    };
    
    const docRef = await db.collection("social_media").add(socialData);
    revalidatePath("/", "layout");
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateSocialMedia(id, data) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "DB not initialized" };
    
    const updateData = { ...data };
    delete updateData.id;

    await db.collection("social_media").doc(id).update(updateData);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteSocialMedia(id) {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, message: "DB not initialized" };
    
    await db.collection("social_media").doc(id).delete();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
