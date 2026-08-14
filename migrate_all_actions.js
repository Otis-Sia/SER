const fs = require('fs');
let text = fs.readFileSync('client/src/app/admin/actions.js', 'utf8');

// Imports
text = text.replace(/import \{ getAdminDb, getAdminAuth \} from \"@\/lib\/firebaseAdmin\";/, 'import { supabaseAdmin } from "@/lib/supabaseAdmin";');

// Remove initializations
text = text.replace(/const db = getAdminDb\(\);/g, '');
text = text.replace(/const auth = getAdminAuth\(\);/g, '');
text = text.replace(/if \(\!db\) return \[\];/g, '');
text = text.replace(/if \(\!db\) return null;/g, '');
text = text.replace(/if \(\!db\) throw new Error\(\"Firebase Admin not initialized\"\);/g, '');
text = text.replace(/if \(\!auth \|\| \!db\) throw new Error\(\"Firebase Admin not initialized\"\);/g, '');
text = text.replace(/if \(db\) \{/g, '');

// members add
text = text.replace(/const docRef = await db\.collection\(\"members\"\)\.add\(memberData\);\n\s*memberData\.id = docRef\.id;/g,
  `const { data: inserted, error } = await supabaseAdmin.from("members").insert([memberData]).select('id').single();
    if (error) throw error;
    memberData.id = inserted.id;`
);

// members where
text = text.replace(/const snapshot = await db\.collection\(\"members\"\)\.where\(\"idNumber\", \"==\", String\(idNumber\)\)\.get\(\);/g,
  `const { data: snapshot, error } = await supabaseAdmin.from("members").select('*').eq("id_number", String(idNumber));
    if (error) throw error;`
);
text = text.replace(/if \(snapshot\.empty\)/g, 'if (!snapshot || snapshot.length === 0)');

// members loop inside findMemberRegistration
text = text.replace(/snapshot\.forEach\(\(doc\) => \{\n\s*const data = doc\.data\(\);/g, 'snapshot.forEach((data) => {');
text = text.replace(/id: doc\.id,/g, 'id: data.id,');

// members orderBy
text = text.replace(/const snapshot = await db\.collection\(\"members\"\)\.orderBy\(\"createdAt\", \"desc\"\)\.get\(\);\n\s*if \(\!snapshot\.empty\) \{\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*const data = doc\.data\(\);\n\s*members\.push\(\{\n\s*id: doc\.id,\n\s*\.\.\.data\n\s*\}\);\n\s*\}\);\n\s*\}/g,
  `const { data, error } = await supabaseAdmin.from("members").select('*').order("created_at", { ascending: false });
    if (error) throw error;
    if (data) {
      data.forEach((row) => {
        members.push({ id: row.id, ...row });
      });
    }`
);

// generic collection get
text = text.replace(/snapshot = await db\.collection\(collectionName\)\.orderBy\(orderByField, orderDirection\)\.get\(\);/g,
  `const { data, error } = await supabaseAdmin.from(collectionName).select('*').order(orderByField, { ascending: orderDirection === 'asc' });
      if (error) throw error;
      snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };`
);
text = text.replace(/snapshot = await db\.collection\(collectionName\)\.get\(\);/g,
  `const { data, error } = await supabaseAdmin.from(collectionName).select('*');
      if (error) throw error;
      snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };`
);

// generic delete
text = text.replace(/const docRef = db\.collection\(collectionName\)\.doc\(id\);\n\s*await docRef\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from(collectionName).delete().eq('id', id);
    if (error) throw error;`
);

// generic add
text = text.replace(/const docRef = db\.collection\(collectionName\)\.doc\(\);\n\s*await docRef\.set\(\{ \.\.\.data, createdAt: new Date\(\)\.toISOString\(\) \}\);\n\s*return docRef\.id;/g,
  `const { data: inserted, error } = await supabaseAdmin.from(collectionName).insert([{ ...data, created_at: new Date().toISOString() }]).select('id').single();
    if (error) throw error;
    return inserted.id;`
);

// generic update
text = text.replace(/const docRef = db\.collection\(collectionName\)\.doc\(id\);\n\s*await docRef\.update\(data\);/g,
  `const { error } = await supabaseAdmin.from(collectionName).update(data).eq('id', id);
    if (error) throw error;`
);

// member flag
text = text.replace(/await db\.collection\(\"members\"\)\.doc\(id\)\.update\(\{\n\s*flagged: flagged,\n\s*flaggedByEmail: flagged \? byEmail : null\n\s*\}\);/g,
  `const { error } = await supabaseAdmin.from("members").update({ flagged: flagged, flagged_by_email: flagged ? byEmail : null }).eq("id", id);
      if (error) throw error;`
);
// member update
text = text.replace(/await db\.collection\(\"members\"\)\.doc\(id\)\.update\(payload\);/g,
  `const { error } = await supabaseAdmin.from("members").update(payload).eq("id", id);
      if (error) throw error;`
);
// member delete
text = text.replace(/await db\.collection\(\"members\"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("members").delete().eq("id", id);
      if (error) throw error;`
);

// posts get
text = text.replace(/const snapshot = await db\.collection\(\"posts\"\)\.orderBy\(\"createdAt\", \"desc\"\)\.get\(\);\n\s*return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/g,
  `const { data, error } = await supabaseAdmin.from("posts").select('*').order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];`
);

// posts slug check
text = text.replace(/const existing = await db\.collection\(\"posts\"\)\.where\(\"slug\", \"==\", safeSlug\)\.limit\(1\)\.get\(\);\n\s*if \(\!existing\.empty\) throw new Error\(\"A post with that slug already exists\"\);/g,
  `const { data: existing, error: existError } = await supabaseAdmin.from("posts").select('id').eq('slug', safeSlug).maybeSingle();
    if (existError) throw existError;
    if (existing) throw new Error("A post with that slug already exists");`
);

text = text.replace(/const docRef = await db\.collection\(\"posts\"\)\.add\(postData\);\n\s*revalidatePath\(\"\/community\"\);\n\s*return \{ success: true, data: \{ id: docRef\.id, \.\.\.postData \} \};/g,
  `const { data: inserted, error: insertError } = await supabaseAdmin.from("posts").insert([postData]).select('id').single();
    if (insertError) throw insertError;
    revalidatePath("/community");
    return { success: true, data: { id: inserted.id, ...postData } };`
);

text = text.replace(/const existing = await db\.collection\(\"posts\"\)\.where\(\"slug\", \"==\", safeSlug\)\.limit\(1\)\.get\(\);\n\s*if \(\!existing\.empty && existing\.docs\[0\]\.id \!\=\= id\) throw new Error\(\"A post with that slug already exists\"\);/g,
  `const { data: existing, error: existError } = await supabaseAdmin.from("posts").select('id').eq('slug', safeSlug).neq('id', id).maybeSingle();
    if (existError) throw existError;
    if (existing) throw new Error("A post with that slug already exists");`
);

text = text.replace(/const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\n\s*const docSnap = await docRef\.get\(\);\n\s*if \(\!docSnap\.exists\) throw new Error\(\"Post not found\"\);\n\s*const existingPublishedAt = docSnap\.data\(\)\.publishedAt;\n\s*const now = new Date\(\)\.toISOString\(\);\n\s*const updateData = \{\n\s*title,\n\s*slug: safeSlug,\n\s*author: author \|\| \"Admin\",\n\s*coverUrl: cover_url \|\| null,\n\s*body: body_md,\n\s*published: isPublished,\n\s*publishedAt: isPublished \? \(existingPublishedAt \|\| now\) : null,\n\s*updatedAt: now,\n\s*\};\n\s*await docRef\.update\(updateData\);\n\s*revalidatePath\(\"\/community\"\);\n\s*revalidatePath\(\`\/blog\/\$\{safeSlug\}\`\);\n\s*const oldUrls = extractS3Urls\(docSnap\.data\(\)\);/g,
  `const { data: docSnap, error: getError } = await supabaseAdmin.from("posts").select('*').eq('id', id).single();
    if (getError) throw new Error("Post not found");
    const existingPublishedAt = docSnap.published_at;
    const now = new Date().toISOString();
    const updateData = {
      title,
      slug: safeSlug,
      author: author || "Admin",
      cover_url: cover_url || null,
      body_md,
      published: isPublished,
      published_at: isPublished ? (existingPublishedAt || now) : null,
      updated_at: now,
    };
    const { error: updateError } = await supabaseAdmin.from("posts").update(updateData).eq('id', id);
    if (updateError) throw updateError;
    revalidatePath("/community");
    revalidatePath(\`/blog/\${safeSlug}\`);
    const oldUrls = extractS3Urls(docSnap);`
);

text = text.replace(/const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\n\s*const docSnap = await docRef\.get\(\);\n\s*await docRef\.delete\(\);\n\s*revalidatePath\(\"\/community\"\);\n\s*if \(docSnap\.exists\) \{\n\s*const urls = extractS3Urls\(docSnap\.data\(\)\);/g,
  `const { data: docSnap, error: getError } = await supabaseAdmin.from("posts").select('*').eq('id', id).maybeSingle();
    const { error: deleteError } = await supabaseAdmin.from("posts").delete().eq('id', id);
    if (deleteError) throw deleteError;
    revalidatePath("/community");
    if (docSnap) {
      const urls = extractS3Urls(docSnap);`
);

text = text.replace(/const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\n\s*await docRef\.update\(updateData\);/g,
  `const { error } = await supabaseAdmin.from("posts").update(updateData).eq('id', id);
    if (error) throw error;`
);

// Admin Auth functions (we can just replace the whole functions since they are short)
text = text.replace(/export async function addAdminUser.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function addAdminUser(name, email, password, role) {
  try {
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });
    if (createError) throw createError;
    
    const { error } = await supabaseAdmin.from("admin_users").insert([{
      uid: data.user.id,
      name,
      email,
      role,
      must_change_password: true,
      created_at: new Date().toISOString()
    }]);
    if (error) throw error;

    return { success: true, user: { name, email, role, uid: data.user.id } };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, message: error.message };
  }
}`
);

text = text.replace(/export async function getAdminUsers\(\) \{\n\s*try \{\n\s*const snapshot = await db\.collection\(\"admin_users\"\)\.orderBy\(\"createdAt\", \"desc\"\)\.get\(\);\n\s*return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);\n\s*\} catch \(error\) \{\n\s*console\.error\(\"Error fetching admin users:\", error\);\n\s*return \[\];\n\s*\}\n\s*\}/g,
  `export async function getAdminUsers() {
  try {
    const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
       id: row.email,
       ...row,
       mustChangePassword: row.must_change_password,
       createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}`
);

text = text.replace(/export async function deleteAdminUser.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function deleteAdminUser(email, uid) {
  try {
    if (uid) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (deleteError) throw deleteError;
    }
    const { error } = await supabaseAdmin.from("admin_users").delete().eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return { success: false, message: error.message };
  }
}`
);

text = text.replace(/export async function updateAdminProfile.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function updateAdminProfile(email, uid, newName, newPassword) {
  try {
    let updatePayload = {};
    if (newName) updatePayload.user_metadata = { name: newName };
    if (newPassword) updatePayload.password = newPassword;

    if (uid && Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(uid, updatePayload);
      if (updateError) throw updateError;
    }

    if (newName) {
      const { error } = await supabaseAdmin.from("admin_users").update({ name: newName }).eq("email", email);
      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return { success: false, message: error.message };
  }
}`
);

text = text.replace(/export async function updateAdminEmail.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function updateAdminEmail(oldEmail, newEmail, uid) {
  try {
    if (!newEmail || !newEmail.includes("@")) throw new Error("Invalid new email address");
    if (uid) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(uid, { email: newEmail, email_confirm: true });
      if (emailError) throw emailError;
    }
    const { error: updateError } = await supabaseAdmin.from("admin_users").update({ email: newEmail }).eq("email", oldEmail);
    if (updateError) throw updateError;
    return { success: true };
  } catch (error) {
    console.error("Error updating admin email:", error);
    return { success: false, message: error.message };
  }
}`
);

text = text.replace(/export async function flagAdminUser.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function flagAdminUser(email, flagged, byEmail) {
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
}`
);

text = text.replace(/export async function updateAdminRole.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function updateAdminRole(email, uid, newRole) {
  try {
    if (uid) {
      const { error: roleError } = await supabaseAdmin.auth.admin.updateUserById(uid, { user_metadata: { role: newRole } });
      if (roleError) throw roleError;
    }
    const { error } = await supabaseAdmin.from("admin_users").update({ role: newRole }).eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating admin role:", error);
    return { success: false, message: error.message };
  }
}`
);

text = text.replace(/export async function getAdminRole.*?return null;\n\s*\}/s,
  `export async function getAdminRole(email) {
  try {
    if (!email) return null;
    const { data, error } = await supabaseAdmin.from("admin_users").select("role").eq("email", email).maybeSingle();
    if (data) return data.role;
    return null;
  } catch (error) {
    console.error("Error fetching admin role:", error);
    return null;
  }
}`
);

text = text.replace(/export async function clearMustChangePassword.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function clearMustChangePassword(email, name, username) {
  try {
    const { error } = await supabaseAdmin.from("admin_users").update({ 
      must_change_password: false,
      name: name || ""
    }).eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error clearing mustChangePassword:", error);
    return { success: false, message: error.message };
  }
}`
);

text = text.replace(/export async function resetAdminPassword.*?return \{ success: false, message: error\.message \};\n\s*\}/s,
  `export async function resetAdminPassword(email, uid, temporaryPassword) {
  try {
    if (!uid) throw new Error("User ID is required to reset password");
    const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: temporaryPassword });
    if (passError) throw passError;
    
    const { error } = await supabaseAdmin.from("admin_users").update({ must_change_password: true }).eq("email", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error resetting admin password:", error);
    return { success: false, message: error.message };
  }
}`
);

// members find by contact generic
text = text.replace(/const emailSnap = await db\.collection\(\"members\"\)\.where\(\"email\", \"==\", email\.toLowerCase\(\)\.trim\(\)\)\.limit\(1\)\.get\(\);/g,
  `const { data: emailSnapData } = await supabaseAdmin.from("members").select('*').eq("email", email.toLowerCase().trim()).maybeSingle();
  const emailSnap = { empty: !emailSnapData, docs: emailSnapData ? [{ id: emailSnapData.id, data: () => emailSnapData }] : [] };`
);
text = text.replace(/const phoneSnap = await db\.collection\(\"members\"\)\.where\(\"phone\", \"==\", cleanPhone\)\.limit\(1\)\.get\(\);/g,
  `const { data: phoneSnapData } = await supabaseAdmin.from("members").select('*').eq("phone", cleanPhone).maybeSingle();
  const phoneSnap = { empty: !phoneSnapData, docs: phoneSnapData ? [{ id: phoneSnapData.id, data: () => phoneSnapData }] : [] };`
);
text = text.replace(/const whatsappSnap = await db\.collection\(\"members\"\)\.where\(\"whatsapp\", \"==\", cleanPhone\)\.limit\(1\)\.get\(\);/g,
  `const { data: waSnapData } = await supabaseAdmin.from("members").select('*').eq("whatsapp", cleanPhone).maybeSingle();
  const whatsappSnap = { empty: !waSnapData, docs: waSnapData ? [{ id: waSnapData.id, data: () => waSnapData }] : [] };`
);

// contacts and social_media
text = text.replace(/const snapshot = await db\.collection\(\"contacts\"\)\.orderBy\(\"order\", \"asc\"\)\.get\(\);/g,
  `const { data, error } = await supabaseAdmin.from("contacts").select('*').order("sort_order", { ascending: true });
    if (error) throw error;
    const snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };`
);
text = text.replace(/const docRef = await db\.collection\(\"contacts\"\)\.add\(contactData\);/g,
  `const { data: inserted, error } = await supabaseAdmin.from("contacts").insert([contactData]).select('id').single();
    if (error) throw error;
    const docRef = { id: inserted.id };`
);
text = text.replace(/await db\.collection\(\"contacts\"\)\.doc\(id\)\.update\(updateData\);/g,
  `const { error } = await supabaseAdmin.from("contacts").update(updateData).eq("id", id);
    if (error) throw error;`
);
text = text.replace(/await db\.collection\(\"contacts\"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
    if (error) throw error;`
);

text = text.replace(/const snapshot = await db\.collection\(\"social_media\"\)\.orderBy\(\"platform\", \"asc\"\)\.get\(\);/g,
  `const { data, error } = await supabaseAdmin.from("social_media").select('*').order("platform", { ascending: true });
    if (error) throw error;
    const snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };`
);
text = text.replace(/const docRef = await db\.collection\(\"social_media\"\)\.add\(socialData\);/g,
  `const { data: inserted, error } = await supabaseAdmin.from("social_media").insert([socialData]).select('id').single();
    if (error) throw error;
    const docRef = { id: inserted.id };`
);
text = text.replace(/await db\.collection\(\"social_media\"\)\.doc\(id\)\.update\(updateData\);/g,
  `const { error } = await supabaseAdmin.from("social_media").update(updateData).eq("id", id);
    if (error) throw error;`
);
text = text.replace(/await db\.collection\(\"social_media\"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("social_media").delete().eq("id", id);
    if (error) throw error;`
);

fs.writeFileSync('client/src/app/admin/actions.js', text);
console.log('Finished migrating actions.js with regexes');
