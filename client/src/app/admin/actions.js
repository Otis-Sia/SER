"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: process.env.APP_AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

import { getAdminDb } from "@/lib/firebaseAdmin";

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

