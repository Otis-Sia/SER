"use server";

import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import jwt from "jsonwebtoken";

function cleanEnv(val) {
  if (!val) return "";
  let s = String(val).trim();
  // Strip surrounding double or single quotes if present
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function getS3Client() {
  const accessKeyId = cleanEnv(
    process.env.APP_AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_KEY_ID ||
    process.env.S3_ACCESS_KEY_ID ||
    process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID
  );

  const secretAccessKey = cleanEnv(
    process.env.APP_AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  );

  const region = cleanEnv(
    process.env.APP_AWS_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    process.env.S3_REGION ||
    "eu-north-1"
  );

  const bucketName = cleanEnv(
    process.env.APP_AWS_S3_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    process.env.AWS_BUCKET ||
    "juj4-shop-assets-2026"
  );

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials missing. Please set APP_AWS_ACCESS_KEY_ID and APP_AWS_SECRET_ACCESS_KEY in your Vercel Project Settings > Environment Variables, and ensure you trigger a new deployment for changes to take effect."
    );
  }

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucketName, region };
}

const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");

function getAdminToken() {
  const secret = process.env.JWT_SECRET || config.jwtSecret || "change-me-please";
  return jwt.sign({ role: "admin", username: "admin" }, secret, { expiresIn: "1h" });
}

// -------------------------------------------------------------
// MEMBERS
// -------------------------------------------------------------

export async function submitMemberRegistration(memberData) {
  try {
    const { data: inserted, error } = await supabaseAdmin
      .from("members")
      .insert([{
        name: memberData.name || `${memberData.firstName || ""} ${memberData.lastName || ""}`.trim().replace(/\s+/g, ' '),
        id_number: String(memberData.idNumber || ''),
        first_name: memberData.firstName || '',
        middle_name: memberData.middleName || '',
        last_name: memberData.lastName || '',
        county: memberData.county || '',
        sub_county: memberData.subCounty || '',
        crew: memberData.crew || '',
        blood_type: memberData.bloodType || '',
        email: memberData.email || '',
        whatsapp: memberData.whatsapp || '',
        phone: memberData.phone || '',
        id_type: memberData.idType || '',
        nationality: memberData.nationality || ''
      }])
      .select("id")
      .single();

    if (error) throw error;
    memberData.id = inserted.id;

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
    if (!idNumber || !contactStr) {
      return { success: false, message: "Missing search criteria" };
    }

    const { data: snapshotData, error: snapError } = await supabaseAdmin
      .from("members")
      .select("*")
      .eq("id_number", String(idNumber));

    if (snapError) throw snapError;
    if (!snapshotData || snapshotData.length === 0) return { success: false, message: "No match found" };

    let matchedDoc = null;
    const searchContact = String(contactStr).toLowerCase().trim();

    snapshotData.forEach((docData) => {
      const data = {
        id: docData.id,
        idNumber: docData.id_number,
        firstName: docData.first_name,
        middleName: docData.middle_name,
        lastName: docData.last_name,
        email: docData.email,
        phone: docData.phone,
        whatsapp: docData.whatsapp,
        nationality: docData.nationality,
        idType: docData.id_type,
        county: docData.county,
        subCounty: docData.sub_county,
        bloodType: docData.blood_type,
        crew: docData.crew,
        createdAt: docData.created_at
      };

      const emailMatch = data.email && data.email.toLowerCase().trim() === searchContact;
      const phoneMatch = data.phone && data.phone.replace(/\s+/g, '') === searchContact.replace(/\s+/g, '');
      const waMatch = data.whatsapp && data.whatsapp.replace(/\s+/g, '') === searchContact.replace(/\s+/g, '');

      const nationalityMatch = !nationality || !data.nationality || data.nationality === nationality;
      const idTypeMatch = !idType || !data.idType || data.idType === idType;

      if ((emailMatch || phoneMatch || waMatch) && nationalityMatch && idTypeMatch) {
        matchedDoc = data;
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
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const members = (data || []).map(doc => ({
      id: doc.id,
      ...doc,
      idNumber: doc.id_number,
      firstName: doc.first_name,
      middleName: doc.middle_name,
      lastName: doc.last_name,
      county: doc.county,
      subCounty: doc.sub_county,
      bloodType: doc.blood_type,
      createdAt: doc.created_at,
      idType: doc.id_type,
      flaggedByEmail: doc.flagged_by_email
    }));

    return members;
  } catch (error) {
    console.error("Error fetching member registrations:", error);
    return [];
  }
}

export async function deleteMemberRegistration(id) {
  try {
    const { error } = await supabaseAdmin.from("members").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting member registration:", error);
    return { success: false, message: error.message };
  }
}

export async function updateMemberRegistrationStatus(id, flagged, byEmail) {
  try {
    const { error } = await supabaseAdmin.from("members").update({
      flagged: flagged,
      flagged_by_email: flagged ? byEmail : null
    }).eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating member status:", error);
    return { success: false, message: error.message };
  }
}

export async function updateMemberRegistration(id, dataToUpdate) {
  try {
    const payload = {};
    if (dataToUpdate.name !== undefined) payload.name = dataToUpdate.name;
    if (dataToUpdate.firstName !== undefined) payload.first_name = dataToUpdate.firstName;
    if (dataToUpdate.middleName !== undefined) payload.middle_name = dataToUpdate.middleName;
    if (dataToUpdate.lastName !== undefined) payload.last_name = dataToUpdate.lastName;
    if (dataToUpdate.county !== undefined) payload.county = dataToUpdate.county;
    if (dataToUpdate.subCounty !== undefined) payload.sub_county = dataToUpdate.subCounty;
    if (dataToUpdate.crew !== undefined) payload.crew = dataToUpdate.crew;
    if (dataToUpdate.bloodType !== undefined) payload.blood_type = dataToUpdate.bloodType;
    if (dataToUpdate.email !== undefined) payload.email = dataToUpdate.email;
    if (dataToUpdate.whatsapp !== undefined) payload.whatsapp = dataToUpdate.whatsapp;
    if (dataToUpdate.phone !== undefined) payload.phone = dataToUpdate.phone;
    if (dataToUpdate.nationality !== undefined) payload.nationality = dataToUpdate.nationality;
    if (dataToUpdate.idType !== undefined) payload.id_type = dataToUpdate.idType;
    if (dataToUpdate.idNumber !== undefined) payload.id_number = dataToUpdate.idNumber;

    const { error } = await supabaseAdmin.from("members").update(payload).eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating member registration:", error);
    return { success: false, message: error.message };
  }
}

// -------------------------------------------------------------
// POSTS
// -------------------------------------------------------------

export async function getPosts() {
  try {
    const { data, error } = await supabaseAdmin.from("posts").select("*").eq("published", true).order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(doc => ({ id: doc.id, ...doc, createdAt: doc.created_at }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getAdminPosts() {
  try {
    const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(doc => ({ id: doc.id, ...doc, createdAt: doc.created_at }));
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    const { data, error } = await supabaseAdmin.from("posts").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { id: data.id, ...data, createdAt: data.created_at };
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function submitPost(data) {
  try {
    const { title, slug, cover_url, body_md, published, author, created_by_email } = data;
    if (!title || !body_md) throw new Error("Title and body are required");

    const safeSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: existing } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).maybeSingle();
    if (existing) {
      return { success: false, message: "A post with this slug already exists" };
    }

    const { data: inserted, error } = await supabaseAdmin.from("posts").insert([{
      title,
      slug: safeSlug,
      cover_url: cover_url || "",
      body_md,
      published: !!published,
      author: author || "Admin",
      created_by_email: created_by_email || "",
      created_at: new Date().toISOString()
    }]).select("id").single();

    if (error) throw error;
    return { success: true, id: inserted.id, slug: safeSlug };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: error.message };
  }
}

export async function updatePost(id, data) {
  try {
    const { title, slug, cover_url, body_md, published, author } = data;
    const { data: docSnap, error: snapError } = await supabaseAdmin.from("posts").select("*").eq("id", id).maybeSingle();
    if (snapError) throw snapError;
    if (!docSnap) return { success: false, message: "Post not found" };

    let updateData = {};
    if (title !== undefined) updateData.title = title;
    if (cover_url !== undefined) updateData.cover_url = cover_url;
    if (body_md !== undefined) updateData.body_md = body_md;
    if (published !== undefined) updateData.published = published;
    if (author !== undefined) updateData.author = author;

    if (slug) {
      const safeSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { data: existing } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).maybeSingle();
      if (existing && existing.id !== id) {
        return { success: false, message: "Another post with this slug already exists" };
      }
      updateData.slug = safeSlug;
    }

    const { error: updateError } = await supabaseAdmin.from("posts").update(updateData).eq("id", id);
    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, message: error.message };
  }
}

export async function flagPost(id, flagged, byEmail) {
  try {
    const payload = {
      flagged: !!flagged,
      flagged_by_email: flagged ? (byEmail || null) : null
    };
    const { error } = await supabaseAdmin.from("posts").update(payload).eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error flagging post:", error);
    return { success: false, message: error.message };
  }
}

export async function deletePost(id) {
  try {
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, message: error.message };
  }
}

// -------------------------------------------------------------
// ADMIN USERS
// -------------------------------------------------------------

export async function getAdminUsers() {
  try {
    const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }
    return (data || []).map(doc => ({
      id: doc.email,
      ...doc,
      createdAt: doc.created_at,
      mustChangePassword: doc.must_change_password
    }));
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

export async function addAdminUser(name, email, password, role) {
  try {
    const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });
    if (authError) throw authError;

    const uid = userAuth.user.id;

    const { error: dbError } = await supabaseAdmin.from("admin_users").insert([{
      email: email.toLowerCase().trim(),
      name,
      role,
      uid,
      must_change_password: true,
      created_at: new Date().toISOString()
    }]);

    if (dbError) throw dbError;
    return { success: true };
  } catch (error) {
    console.error("Error adding admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteAdminUser(email, uid) {
  try {
    if (uid) {
      await supabaseAdmin.auth.admin.deleteUser(uid).catch(() => {});
    }
    const { error } = await supabaseAdmin.from("admin_users").delete().eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function updateAdminProfile(email, uid, newName, newPassword) {
  try {
    let updatePayload = {};
    if (newName) updatePayload.user_metadata = { name: newName };
    if (newPassword) updatePayload.password = newPassword;

    if (uid && Object.keys(updatePayload).length > 0) {
      await supabaseAdmin.auth.admin.updateUserById(uid, updatePayload).catch(() => {});
    }

    const { error } = await supabaseAdmin.from("admin_users").update({
      name: newName || "",
      must_change_password: false
    }).eq("email", email);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return { success: false, message: error.message };
  }
}

export async function updateAdminEmail(oldEmail, uid, newEmail) {
  try {
    if (!newEmail || !newEmail.includes("@")) throw new Error("Invalid new email address");

    if (uid) {
      await supabaseAdmin.auth.admin.updateUserById(uid, { email: newEmail, email_confirm: true }).catch(() => {});
    }

    const { data: oldDoc } = await supabaseAdmin.from("admin_users").select("*").eq("email", oldEmail).maybeSingle();
    if (oldDoc) {
      await supabaseAdmin.from("admin_users").insert([{ ...oldDoc, email: newEmail, id: undefined }]);
      await supabaseAdmin.from("admin_users").delete().eq("email", oldEmail);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating admin email:", error);
    return { success: false, message: error.message };
  }
}

export async function updateAdminRole(email, uid, newRole) {
  try {
    if (uid) {
      await supabaseAdmin.auth.admin.updateUserById(uid, { user_metadata: { role: newRole } }).catch(() => {});
    }

    const { error } = await supabaseAdmin.from("admin_users").update({ role: newRole }).eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating admin role:", error);
    return { success: false, message: error.message };
  }
}

export async function resetAdminPassword(email, uid, temporaryPassword) {
  try {
    if (uid) {
      await supabaseAdmin.auth.admin.updateUserById(uid, { password: temporaryPassword }).catch(() => {});
    }

    const { error } = await supabaseAdmin.from("admin_users").update({ must_change_password: true }).eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, message: error.message };
  }
}

export async function flagAdminUser(email, flagged, byEmail) {
  try {
    const { error } = await supabaseAdmin.from("admin_users").update({
      flagged: flagged,
      flagged_by_email: flagged ? byEmail : null
    }).eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error flagging admin user:", error);
    return { success: false, message: error.message };
  }
}

export async function getAdminRole(email) {
  try {
    const { data } = await supabaseAdmin.from("admin_users").select("role").eq("email", email).maybeSingle();
    return data?.role || null;
  } catch (error) {
    console.error("Error fetching admin role:", error);
    return null;
  }
}

export async function getAdminUserData(email) {
  try {
    const { data } = await supabaseAdmin.from("admin_users").select("*").eq("email", email).maybeSingle();
    if (!data) return null;
    return {
      ...data,
      mustChangePassword: data.must_change_password,
      flaggedByEmail: data.flagged_by_email
    };
  } catch (error) {
    console.error("Error fetching admin user data:", error);
    return null;
  }
}

// -------------------------------------------------------------
// CHECKS & CMS
// -------------------------------------------------------------

export async function checkEmailExists(email) {
  try {
    const { data } = await supabaseAdmin.from("members").select("id").eq("email", email.toLowerCase().trim()).limit(1);
    if (data && data.length > 0) return { exists: true, message: "Email is already registered" };
    return { exists: false };
  } catch (error) {
    return { exists: false };
  }
}

export async function checkPhoneExists(phone) {
  try {
    const cleanPhone = phone.replace(/\s+/g, "");
    const { data: pData } = await supabaseAdmin.from("members").select("id").eq("phone", cleanPhone).limit(1);
    if (pData && pData.length > 0) return { exists: true, message: "Phone number is already registered" };

    const { data: wData } = await supabaseAdmin.from("members").select("id").eq("whatsapp", cleanPhone).limit(1);
    if (wData && wData.length > 0) return { exists: true, message: "WhatsApp number is already registered" };

    return { exists: false };
  } catch (error) {
    return { exists: false };
  }
}



const CMS_FIELD_MAP = {
  eventDate: 'event_date',
  imageUrl: 'image_url',
  price: 'price_kes',
  order: 'sort_order',
  linkText: 'link_text',
  createdByEmail: 'created_by_email',
  flaggedByEmail: 'flagged_by_email',
  hiddenByEmail: 'hidden_by_email'
};

function mapCmsPayload(collectionName, data) {
  const payload = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (key === 'id') continue;
    if (key === 'type') {
      if (collectionName === 'contacts') payload.contact_type = value;
      else if (collectionName === 'social_media') payload.media_type = value;
      else payload.type = value;
    } else if (key === 'value' && collectionName === 'contacts') {
      payload.contact_value = value;
    } else {
      const dbKey = CMS_FIELD_MAP[key] || key;
      payload[dbKey] = value;
    }
  }
  return payload;
}

function mapCmsDoc(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    id: doc.id,
    eventDate: doc.event_date || doc.eventDate || "",
    imageUrl: doc.image_url || doc.imageUrl || "",
    price: doc.price_kes !== undefined ? doc.price_kes : doc.price,
    order: doc.sort_order !== undefined ? doc.sort_order : doc.order,
    type: doc.contact_type || doc.media_type || doc.type || "",
    value: doc.contact_value || doc.value || "",
    linkText: doc.link_text || doc.linkText || "",
    created_by_email: doc.created_by_email || doc.createdByEmail || "",
    flagged: !!doc.flagged,
    flaggedByEmail: doc.flagged_by_email || doc.flaggedByEmail || null,
    hidden: !!doc.hidden,
    hiddenByEmail: doc.hidden_by_email || doc.hiddenByEmail || null
  };
}

export async function getCmsCollection(collectionName, orderByField, orderDirection = "asc") {
  try {
    let query = supabaseAdmin.from(collectionName).select("*");
    if (collectionName === 'contacts') {
      query = query.neq('contact_type', '__SITE_CONTENT__');
    }
    if (orderByField) {
      const dbOrderField = CMS_FIELD_MAP[orderByField] || orderByField;
      query = query.order(dbOrderField, { ascending: orderDirection === "asc" });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapCmsDoc);
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

export async function getPublicCmsCollection(collectionName, orderByField, orderDirection = "asc") {
  try {
    const items = await getCmsCollection(collectionName, orderByField, orderDirection);
    return items.filter(item => !item.hidden && !item.flagged);
  } catch (error) {
    console.error(`Error fetching public collection ${collectionName}:`, error);
    return [];
  }
}

function revalidateCmsPaths(collectionName) {
  try {
    if (collectionName === 'gallery' || collectionName === 'projects') {
      revalidatePath('/projects');
    } else if (collectionName === 'products') {
      revalidatePath('/shop');
    } else if (collectionName === 'events') {
      revalidatePath('/events');
    }
    revalidatePath('/admin');
    revalidatePath('/');
  } catch (e) {
    // Ignore outside request context
  }
}

export async function saveCmsDocument(collectionName, id, data) {
  try {
    const payload = mapCmsPayload(collectionName, data);
    let docId = id;
    if (id) {
      const { error } = await supabaseAdmin.from(collectionName).update(payload).eq("id", id);
      if (error) throw error;
    } else {
      payload.created_at = new Date().toISOString();
      const { data: inserted, error } = await supabaseAdmin.from(collectionName).insert([payload]).select("id").single();
      if (error) throw error;
      docId = inserted.id;
    }
    revalidateCmsPaths(collectionName);
    return { success: true, id: docId };
  } catch (error) {
    console.error(`Error saving document in ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}

export async function flagCmsDocument(collectionName, id, flagged, byEmail) {
  try {
    const payload = {
      flagged: !!flagged,
      flagged_by_email: flagged ? (byEmail || null) : null
    };
    const { error } = await supabaseAdmin.from(collectionName).update(payload).eq("id", id);
    if (error) throw error;
    revalidateCmsPaths(collectionName);
    return { success: true };
  } catch (error) {
    console.error(`Error flagging document in ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}

export async function hideCmsDocument(collectionName, id, hidden, byEmail) {
  try {
    const payload = {
      hidden: !!hidden,
      hidden_by_email: hidden ? (byEmail || null) : null
    };
    const { error } = await supabaseAdmin.from(collectionName).update(payload).eq("id", id);
    if (error) throw error;
    revalidateCmsPaths(collectionName);
    return { success: true };
  } catch (error) {
    console.error(`Error hiding document in ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}

export async function deleteCmsDocument(collectionName, id) {
  try {
    const { error } = await supabaseAdmin.from(collectionName).delete().eq("id", id);
    if (error) throw error;
    revalidateCmsPaths(collectionName);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return { success: false, message: error.message };
  }
}


// -------------------------------------------------------------
// EXTRA HELPERS & COMPATIBILITY EXPORTS
// -------------------------------------------------------------

export async function uploadImage(formData) {
  try {
    const file = formData ? formData.get('file') : null;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No image file provided' };
    }

    const { client, bucketName, region } = getS3Client();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const originalName = file.name || 'upload.jpg';
    const ext = path.extname(originalName) || '.jpg';
    const cleanExt = ext.toLowerCase();
    const key = `uploads/${randomUUID()}${cleanExt}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    });

    await client.send(command);

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return { success: true, url, key };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return { success: false, message: error.message || 'Failed to upload image to S3' };
  }
}

export async function uploadFile(formData) {
  try {
    const file = formData ? formData.get('file') : null;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No file provided' };
    }

    const { client, bucketName, region } = getS3Client();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const originalName = file.name || 'upload.pdf';
    const ext = path.extname(originalName) || '.pdf';
    const cleanExt = ext.toLowerCase();
    const key = `uploads/${randomUUID()}${cleanExt}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/pdf',
    });

    await client.send(command);

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return { success: true, url, key };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return { success: false, message: error.message || 'Failed to upload file to S3' };
  }
}

export async function updateSiteContent(content) {
  try {
    if (!content || typeof content !== 'object') {
      return { success: false, message: 'Invalid site content provided' };
    }

    const jsonStr = JSON.stringify(content, null, 2);

    // 1. Save to Supabase contacts row '__SITE_CONTENT__'
    const { data: existing } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('contact_type', '__SITE_CONTENT__')
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabaseAdmin
        .from('contacts')
        .update({ contact_value: jsonStr, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('contacts')
        .insert({ contact_type: '__SITE_CONTENT__', contact_value: jsonStr, sort_order: 99999 });
      if (error) throw error;
    }

    // 2. Try writing to local file if accessible
    try {
      const fs = require('fs');
      fs.writeFileSync(contentFilePath, jsonStr, 'utf8');
    } catch (fsErr) {
      // Ephemeral on serverless, ignore
    }

    // 3. Revalidate affected paths
    try {
      revalidatePath('/about');
      revalidatePath('/about/[slug]', 'page');
      revalidatePath('/');
      revalidatePath('/projects');
      revalidatePath('/community');
      revalidatePath('/contact');
      revalidatePath('/admin');
    } catch (e) {}

    return { success: true };
  } catch (error) {
    console.error("Error updating site content:", error);
    return { success: false, message: error.message };
  }
}

export async function getDashboardStats() {
  try {
    const { count: postsCount } = await supabaseAdmin.from("posts").select("*", { count: 'exact', head: true });
    const { count: flaggedPostsCount } = await supabaseAdmin.from("posts").select("*", { count: 'exact', head: true }).eq("flagged", true);
    const { count: projectsCount } = await supabaseAdmin.from("projects").select("*", { count: 'exact', head: true });
    const { count: membersCount } = await supabaseAdmin.from("members").select("*", { count: 'exact', head: true });
    const { count: flaggedMembersCount } = await supabaseAdmin.from("members").select("*", { count: 'exact', head: true }).eq("flagged", true);
    const { count: adminUsersCount } = await supabaseAdmin.from("admin_users").select("*", { count: 'exact', head: true });

    let eventsCount = 0;
    try {
      const upcomingEvents = await getEvents(true);
      eventsCount = upcomingEvents.length;
    } catch (err) {
      console.error("Failed to fetch upcoming events for stats:", err);
    }

    return {
      blogs: postsCount || 0,
      events: eventsCount,
      projects: projectsCount || 0,
      member_registrations: membersCount || 0,
      admin_users: adminUsersCount || 0,
      flagged_items: (flaggedPostsCount || 0) + (flaggedMembersCount || 0)
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      blogs: 0,
      events: 0,
      projects: 0,
      member_registrations: 0,
      admin_users: 0,
      flagged_items: 0
    };
  }
}

export async function getFlaggedPosts() {
  try {
    const { data, error } = await supabaseAdmin.from("posts").select("*").eq("flagged", true).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching flagged posts:", error);
    return [];
  }
}

export async function flagMemberRegistration(id, flagged, byEmail) {
  return updateMemberRegistrationStatus(id, flagged, byEmail);
}

export async function createPost(data) {
  return submitPost(data);
}

export async function toggleHidePost(id, currentStatus, byEmail) {
  try {
    const nextHidden = !!currentStatus;
    const payload = {
      hidden: nextHidden,
      hidden_by_email: nextHidden ? (byEmail || null) : null
    };
    const { error } = await supabaseAdmin.from("posts").update(payload).eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error toggling post visibility:", error);
    return { success: false, message: error.message };
  }
}


// -------------------------------------------------------------
// COLLECTION MANAGERS WRAPPERS
// -------------------------------------------------------------

export async function getProjects(isPublic = false) { return isPublic ? getPublicCmsCollection('projects') : getCmsCollection('projects'); }
export async function getPublicProjects() { return getPublicCmsCollection('projects'); }
export async function addProject(data) { return saveCmsDocument('projects', null, data); }
export async function updateProject(id, data) { return saveCmsDocument('projects', id, data); }
export async function deleteProject(id) { return deleteCmsDocument('projects', id); }

export async function getEvents(isPublic = false) {
  try {
    const res = await fetch(`${config.apiUrl}/api/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    const events = await res.json();
    return events.map(e => ({
      ...e,
      eventDate: e.event_date ? e.event_date.split('T')[0] : '',
      time: e.event_date && e.event_date.includes('T') ? e.event_date.split('T')[1].substring(0, 5) : '',
    }));
  } catch (error) {
    console.error("getEvents error:", error);
    return [];
  }
}
export async function getPublicEvents() { return getEvents(true); }

export async function getPastEvents() {
  try {
    const res = await fetch(`${config.apiUrl}/api/events?past=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const events = await res.json();
    return events.map(e => ({
      ...e,
      eventDate: e.event_date ? e.event_date.split('T')[0] : '',
      time: e.event_date && e.event_date.includes('T') ? e.event_date.split('T')[1].substring(0, 5) : '',
    }));
  } catch (error) {
    console.error("getPastEvents error:", error);
    return [];
  }
}

export async function addEvent(data) {
  try {
    let event_date = data.event_date || data.eventDate;
    if (data.eventDate && data.time) {
      event_date = `${data.eventDate}T${data.time}:00`;
    }
    const payload = {
      title: data.title,
      event_date,
      location: data.location || '',
      description: data.description || ''
    };
    const res = await fetch(`${config.apiUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.error || "Failed to create event in Google Calendar" };
    }
    const created = await res.json();
    return { success: true, data: created };
  } catch (error) {
    console.error("addEvent error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateEvent(id, data) {
  try {
    let event_date = data.event_date || data.eventDate;
    if (data.eventDate && data.time) {
      event_date = `${data.eventDate}T${data.time}:00`;
    }
    const payload = {
      title: data.title,
      event_date,
      location: data.location || '',
      description: data.description || '',
      google_event_id: data.google_event_id || id
    };
    const res = await fetch(`${config.apiUrl}/api/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.error || "Failed to update event in Google Calendar" };
    }
    const updated = await res.json();
    return { success: true, data: updated };
  } catch (error) {
    console.error("updateEvent error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteEvent(id) {
  try {
    const res = await fetch(`${config.apiUrl}/api/events/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getAdminToken()}`
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.error || "Failed to delete event from Google Calendar" };
    }
    return { success: true };
  } catch (error) {
    console.error("deleteEvent error:", error);
    return { success: false, message: error.message };
  }
}

export async function getGalleryItems(isPublic = false) { return isPublic ? getPublicCmsCollection('gallery') : getCmsCollection('gallery'); }
export async function getPublicGalleryItems() { return getPublicCmsCollection('gallery'); }
export async function addGalleryItem(data) { return saveCmsDocument('gallery', null, data); }
export async function addBatchGalleryItems(items, createdByEmail = "") {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: "No images provided for batch upload" };
    }
    const payloads = items.map((item) => ({
      image_url: item.imageUrl || item.image_url || "",
      title: item.title || "",
      alt: item.alt || item.title || "",
      description: item.description || "",
      created_by_email: createdByEmail || item.created_by_email || "",
      created_at: new Date().toISOString()
    }));

    const { data: inserted, error } = await supabaseAdmin
      .from('gallery')
      .insert(payloads)
      .select('id');

    if (error) throw error;
    revalidateCmsPaths('gallery');
    try {
      revalidatePath('/projects');
      revalidatePath('/gallery');
      revalidatePath('/');
    } catch (e) {}

    return { success: true, count: inserted?.length || payloads.length };
  } catch (error) {
    console.error("Error in addBatchGalleryItems:", error);
    return { success: false, message: error.message };
  }
}
export async function updateGalleryItem(id, data) { return saveCmsDocument('gallery', id, data); }
export async function deleteGalleryItem(id) { return deleteCmsDocument('gallery', id); }

export async function getFaqs(isPublic = false) { return isPublic ? getPublicCmsCollection('faqs') : getCmsCollection('faqs'); }
export async function getPublicFaqs() { return getPublicCmsCollection('faqs'); }
export async function addFaq(data) { return saveCmsDocument('faqs', null, data); }
export async function updateFaq(id, data) { return saveCmsDocument('faqs', id, data); }
export async function deleteFaq(id) { return deleteCmsDocument('faqs', id); }

export async function getProducts(isPublic = false) { return isPublic ? getPublicCmsCollection('products') : getCmsCollection('products'); }
export async function getPublicProducts() { return getPublicCmsCollection('products'); }
export async function addProduct(data) { return saveCmsDocument('products', null, data); }
export async function updateProduct(id, data) { return saveCmsDocument('products', id, data); }
export async function deleteProduct(id) { return deleteCmsDocument('products', id); }

export async function getContacts(isPublic = false) { return isPublic ? getPublicCmsCollection('contacts') : getCmsCollection('contacts'); }
export async function getPublicContacts() { return getPublicCmsCollection('contacts'); }
export async function addContact(data) { return saveCmsDocument('contacts', null, data); }
export async function updateContact(id, data) { return saveCmsDocument('contacts', id, data); }
export async function deleteContact(id) { return deleteCmsDocument('contacts', id); }

export async function getSocialMedia(isPublic = false) { return isPublic ? getPublicCmsCollection('social_media') : getCmsCollection('social_media'); }
export async function getPublicSocialMedia() { return getPublicCmsCollection('social_media'); }
export async function addSocialMedia(data) { return saveCmsDocument('social_media', null, data); }
export async function updateSocialMedia(id, data) { return saveCmsDocument('social_media', id, data); }
export async function deleteSocialMedia(id) { return deleteCmsDocument('social_media', id); }


export async function getSiteContent() {
  try {
    const { data: dbRow } = await supabaseAdmin
      .from('contacts')
      .select('contact_value')
      .eq('contact_type', '__SITE_CONTENT__')
      .maybeSingle();

    if (dbRow?.contact_value) {
      try {
        const parsed = JSON.parse(dbRow.contact_value);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (err) {
        console.error("Error parsing site_content from db:", err);
      }
    }

    const fs = require('fs');
    if (fs.existsSync(contentFilePath)) {
      return JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
    }
  } catch (e) {
    console.error("Error fetching site content:", e);
  }
  return {};
}

export async function getHistoricMilestones() {
  try {
    const siteContent = await getSiteContent();
    if (siteContent?.events?.milestones && Array.isArray(siteContent.events.milestones) && siteContent.events.milestones.length > 0) {
      return siteContent.events.milestones;
    }
  } catch (e) {
    console.error("Error fetching historic milestones:", e);
  }
  return [
    {
      year: "1907",
      title: "First Scout Camp (Brownsea Island)",
      description: "Baden-Powell led the experimental camp on Brownsea Island, marking the birth of the Scout Movement.",
      active: false
    },
    {
      year: "1908",
      title: "First Scout Handbook published",
      description: "'Scouting for Boys' was published, igniting a worldwide youth movement.",
      active: false
    },
    {
      year: "1920",
      title: "First World Scout Jamboree",
      description: "8,000 Scouts from 34 nations gathered at Olympia, London.",
      active: false
    },
    {
      year: "February 22",
      title: "Founder's Day (Baden-Powell's Birthday)",
      description: "Scouts worldwide celebrate the vision and legacy of Robert and Olave Baden-Powell.",
      active: false
    },
    {
      year: "2024",
      title: "SER Emergency Response Initiative",
      description: "Scouts Emergency Response expands youth-led preparedness and community resilience programs across Kenya.",
      active: true
    }
  ];
}

export async function saveHistoricMilestones(milestones) {
  try {
    const siteContent = await getSiteContent();
    if (!siteContent.events) {
      siteContent.events = {
        title: "Scouting Milestones & SER Events",
        description: "Scouts Emergency Response (SER) honors key Scouting moments and organizes community-centered preparedness events. Join us to learn, serve, and strengthen local readiness."
      };
    }
    siteContent.events.milestones = milestones;
    const res = await updateSiteContent(siteContent);
    try {
      revalidatePath('/events');
    } catch (e) {}
    return res;
  } catch (e) {
    console.error("Error saving historic milestones:", e);
    return { success: false, message: e.message };
  }
}


export async function checkDuplicateMember(field, value) {
  try {
    if (field === 'email') return checkEmailExists(value);
    if (field === 'phone' || field === 'whatsapp') return checkPhoneExists(value);
    return { exists: false };
  } catch (e) {
    return { exists: false };
  }
}

export async function clearMustChangePassword(oldEmail, newEmail, name, username) {
  try {
    const payload = {
      must_change_password: false,
      name: name,
    };
    if (newEmail && newEmail.trim().toLowerCase() !== oldEmail.trim().toLowerCase()) {
      payload.email = newEmail.trim().toLowerCase();
    }
    const { error } = await supabaseAdmin.from('admin_users').update(payload).eq('email', oldEmail);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

export async function resolveEmailFromUsername(input) {
  if (!input) return input;
  const trimmed = input.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();

  try {
    const { data } = await supabaseAdmin
      .from("admin_users")
      .select("email")
      .or(`name.ilike.${trimmed},email.ilike.${trimmed}`)
      .limit(1)
      .maybeSingle();

    if (data && data.email) {
      return data.email;
    }
  } catch (error) {
    console.error("Error resolving email from username:", error);
  }
  return trimmed;
}

// -------------------------------------------------------------
// ROLE MANAGEMENT — per-user custom tab overrides
// -------------------------------------------------------------

export async function getUserCustomTabs(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("custom_tabs")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (data?.custom_tabs && Array.isArray(data.custom_tabs)) {
      return data.custom_tabs;
    }
    return null; // null = use role defaults
  } catch (error) {
    console.error("Error fetching custom tabs:", error);
    return null;
  }
}

export async function setUserCustomTabs(email, tabs) {
  try {
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({ custom_tabs: tabs })
      .eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error saving custom tabs:", error);
    return { success: false, message: error.message };
  }
}

export async function clearUserCustomTabs(email) {
  try {
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({ custom_tabs: null })
      .eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error clearing custom tabs:", error);
    return { success: false, message: error.message };
  }
}

// -------------------------------------------------------------
// EVENT REPORTS
// -------------------------------------------------------------

export async function getAdminPastEvents() {
  try {
    const res = await fetch(`${config.apiUrl}/api/events?past=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAdminReport(googleEventId) {
  if (!googleEventId) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('event_reports')
      .select('*')
      .eq('google_event_id', googleEventId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.error("Direct supabase getAdminReport failed, trying API:", err.message);
  }

  try {
    const res = await fetch(`${config.apiUrl}/api/reports/${googleEventId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("getAdminReport API error:", error);
    return null;
  }
}

export async function saveEventReport(reportData) {
  const { google_event_id, title, content_md, author } = reportData;
  if (!google_event_id || !title || !content_md) {
    return { success: false, message: "google_event_id, title, and content_md are required" };
  }

  // 1. Try Direct Supabase Upsert first (fast, reliable, no network hop)
  try {
    const { data, error } = await supabaseAdmin
      .from('event_reports')
      .upsert({
        google_event_id,
        title,
        content_md,
        author: author || "Admin",
        updated_at: new Date().toISOString()
      }, { onConflict: 'google_event_id' })
      .select()
      .single();

    if (!error && data) {
      revalidatePath(`/events/${google_event_id}`);
      revalidatePath("/events");
      return { success: true, data };
    }
    if (error) {
      console.warn("Direct Supabase save error, falling back to API:", error.message);
    }
  } catch (err) {
    console.warn("Direct Supabase save exception, falling back to API:", err.message);
  }

  // 2. Fallback to Node API
  try {
    const res = await fetch(`${config.apiUrl}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(reportData),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || `HTTP error ${res.status}` };
    }
    const data = await res.json();
    revalidatePath(`/events/${google_event_id}`);
    revalidatePath("/events");
    return { success: true, data };
  } catch (error) {
    console.error("saveEventReport error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteEventReport(googleEventId) {
  if (!googleEventId) return { success: false, message: "google_event_id is required" };

  // 1. Try Direct Supabase Delete first
  try {
    const { error } = await supabaseAdmin
      .from('event_reports')
      .delete()
      .eq('google_event_id', googleEventId);

    if (!error) {
      revalidatePath(`/events/${google_event_id}`);
      revalidatePath("/events");
      return { success: true };
    }
  } catch (err) {
    console.warn("Direct Supabase delete failed, trying API:", err.message);
  }

  // 2. Fallback to Node API
  try {
    const res = await fetch(`${config.apiUrl}/api/reports/${googleEventId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getAdminToken()}`
      }
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || `HTTP error ${res.status}` };
    }
    revalidatePath(`/events/${google_event_id}`);
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("deleteEventReport error:", error);
    return { success: false, message: error.message };
  }
}
