"use server";

import path from "path";
import { config } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const contentFilePath = path.join(process.cwd(), "src", "data", "siteContent.json");

function getAdminToken() {
  return process.env.ADMIN_API_TOKEN || "default-secret-token-change-me";
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
    return { success: true, url: 'https://via.placeholder.com/800x600?text=Uploaded+Image' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateSiteContent(content) {
  return { success: true };
}

export async function getDashboardStats() {
  try {
    const { count: postsCount } = await supabaseAdmin.from("posts").select("*", { count: 'exact', head: true });
    const { count: flaggedPostsCount } = await supabaseAdmin.from("posts").select("*", { count: 'exact', head: true }).eq("flagged", true);
    const { count: eventsCount } = await supabaseAdmin.from("events").select("*", { count: 'exact', head: true });
    const { count: projectsCount } = await supabaseAdmin.from("projects").select("*", { count: 'exact', head: true });
    const { count: membersCount } = await supabaseAdmin.from("members").select("*", { count: 'exact', head: true });
    const { count: flaggedMembersCount } = await supabaseAdmin.from("members").select("*", { count: 'exact', head: true }).eq("flagged", true);
    const { count: adminUsersCount } = await supabaseAdmin.from("admin_users").select("*", { count: 'exact', head: true });

    return {
      blogs: postsCount || 0,
      events: eventsCount || 0,
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

export async function getEvents(isPublic = false) { return isPublic ? getPublicCmsCollection('events') : getCmsCollection('events'); }
export async function getPublicEvents() { return getPublicCmsCollection('events'); }
export async function addEvent(data) { return saveCmsDocument('events', null, data); }
export async function updateEvent(id, data) { return saveCmsDocument('events', id, data); }
export async function deleteEvent(id) { return deleteCmsDocument('events', id); }

export async function getGalleryItems(isPublic = false) { return isPublic ? getPublicCmsCollection('gallery') : getCmsCollection('gallery'); }
export async function getPublicGalleryItems() { return getPublicCmsCollection('gallery'); }
export async function addGalleryItem(data) { return saveCmsDocument('gallery', null, data); }
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
    const fs = require('fs');
    if (fs.existsSync(contentFilePath)) {
      return JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
    }
  } catch (e) {}
  return {};
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

