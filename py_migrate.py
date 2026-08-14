import re

with open('client/src/app/admin/actions.js', 'r') as f:
    text = f.read()

# Imports
text = re.sub(r'import \{ getAdminDb, getAdminAuth \} from "@/lib/firebaseAdmin";', 'import { supabaseAdmin } from "@/lib/supabaseAdmin";', text)

# db/auth init lines
text = re.sub(r'\s*const db = getAdminDb\(\);\s*(if \(!db\) return \[\];\s*)?', '', text)
text = re.sub(r'\s*const auth = getAdminAuth\(\);\s*', '', text)
text = re.sub(r'\s*if \(!db\) return null;\s*', '', text)
text = re.sub(r'\s*if \(!db\) throw new Error\(\"Firebase Admin not initialized\"\);\s*', '', text)
text = re.sub(r'\s*if \(!auth \|\| !db\) throw new Error\(\"Firebase Admin not initialized\"\);\s*', '', text)
text = re.sub(r'\s*if \(db\) \{\s*', '', text)

# members add
text = re.sub(r'const docRef = await db\.collection\(\"members\"\)\.add\(memberData\);\s*memberData\.id = docRef\.id;', 
    'const { data: inserted, error } = await supabaseAdmin.from(\"members\").insert([memberData]).select(\"id\").single();\n    if (error) throw error;\n    memberData.id = inserted.id;', text)

# members flag/update/delete
text = re.sub(r'await db\.collection\(\"members\"\)\.doc\(id\)\.update\(\{\s*flagged: flagged,\s*flaggedByEmail: flagged \? byEmail : null\s*\}\);',
    'const { error } = await supabaseAdmin.from(\"members\").update({ flagged: flagged, flagged_by_email: flagged ? byEmail : null }).eq(\"id\", id);\n      if (error) throw error;', text)
text = re.sub(r'await db\.collection\(\"members\"\)\.doc\(id\)\.update\(payload\);',
    'const { error } = await supabaseAdmin.from(\"members\").update(payload).eq(\"id\", id);\n      if (error) throw error;', text)
text = re.sub(r'await db\.collection\(\"members\"\)\.doc\(id\)\.delete\(\);',
    'const { error } = await supabaseAdmin.from(\"members\").delete().eq(\"id\", id);\n      if (error) throw error;', text)

# posts get
text = re.sub(r'const snapshot = await db\.collection\(\"posts\"\)\.orderBy\(\"createdAt\", \"desc\"\)\.get\(\);\s*return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);',
    'const { data, error } = await supabaseAdmin.from(\"posts\").select(\"*\").order(\"created_at\", { ascending: false });\n    if (error) throw error;\n    return data || [];', text)

# posts slug limit 1
text = re.sub(r'const existing = await db\.collection\(\"posts\"\)\.where\(\"slug\", \"==\", safeSlug\)\.limit\(1\)\.get\(\);\s*if \(!existing\.empty\) throw new Error\(\"A post with that slug already exists\"\);',
    'const { data: existing, error: existError } = await supabaseAdmin.from(\"posts\").select(\"id\").eq(\"slug\", safeSlug).maybeSingle();\n    if (existError) throw existError;\n    if (existing) throw new Error(\"A post with that slug already exists\");', text)

# posts add
text = re.sub(r'const docRef = await db\.collection\(\"posts\"\)\.add\(postData\);\s*revalidatePath\(\"/community\"\);\s*return \{ success: true, data: \{ id: docRef\.id, \.\.\.postData \} \};',
    'const { data: inserted, error: insertError } = await supabaseAdmin.from(\"posts\").insert([postData]).select(\"id\").single();\n    if (insertError) throw insertError;\n    revalidatePath(\"/community\");\n    return { success: true, data: { id: inserted.id, ...postData } };', text)

# posts slug limit 1 existing != id
text = re.sub(r'const existing = await db\.collection\(\"posts\"\)\.where\(\"slug\", \"==\", safeSlug\)\.limit\(1\)\.get\(\);\s*if \(!existing\.empty && existing\.docs\[0\]\.id !== id\) throw new Error\(\"A post with that slug already exists\"\);',
    'const { data: existing, error: existError } = await supabaseAdmin.from(\"posts\").select(\"id\").eq(\"slug\", safeSlug).neq(\"id\", id).maybeSingle();\n    if (existError) throw existError;\n    if (existing) throw new Error(\"A post with that slug already exists\");', text)

# posts update
text = re.sub(r'const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\s*const docSnap = await docRef\.get\(\);\s*if \(!docSnap\.exists\) throw new Error\(\"Post not found\"\);\s*const existingPublishedAt = docSnap\.data\(\)\.publishedAt;\s*const now = new Date\(\)\.toISOString\(\);\s*const updateData = \{\s*title,\s*slug: safeSlug,\s*author: author \|\| \"Admin\",\s*coverUrl: cover_url \|\| null,\s*body: body_md,\s*published: isPublished,\s*publishedAt: isPublished \? \(existingPublishedAt \|\| now\) : null,\s*updatedAt: now,\s*\};\s*await docRef\.update\(updateData\);\s*revalidatePath\(\"/community\"\);\s*revalidatePath\(\`/blog/\$\{safeSlug\}\`\);\s*const oldUrls = extractS3Urls\(docSnap\.data\(\)\);',
    'const { data: docSnap, error: getError } = await supabaseAdmin.from(\"posts\").select(\"*\").eq(\"id\", id).single();\n    if (getError) throw new Error(\"Post not found\");\n    const existingPublishedAt = docSnap.published_at;\n    const now = new Date().toISOString();\n    const updateData = {\n      title,\n      slug: safeSlug,\n      author: author || \"Admin\",\n      cover_url: cover_url || null,\n      body_md,\n      published: isPublished,\n      published_at: isPublished ? (existingPublishedAt || now) : null,\n      updated_at: now,\n    };\n    const { error: updateError } = await supabaseAdmin.from(\"posts\").update(updateData).eq(\"id\", id);\n    if (updateError) throw updateError;\n    revalidatePath(\"/community\");\n    revalidatePath(`/blog/${safeSlug}`);\n    const oldUrls = extractS3Urls(docSnap);', text)

# posts delete
text = re.sub(r'const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\s*const docSnap = await docRef\.get\(\);\s*await docRef\.delete\(\);\s*revalidatePath\(\"/community\"\);\s*if \(docSnap\.exists\) \{\s*const urls = extractS3Urls\(docSnap\.data\(\)\);',
    'const { data: docSnap, error: getError } = await supabaseAdmin.from(\"posts\").select(\"*\").eq(\"id\", id).maybeSingle();\n    const { error: deleteError } = await supabaseAdmin.from(\"posts\").delete().eq(\"id\", id);\n    if (deleteError) throw deleteError;\n    revalidatePath(\"/community\");\n    if (docSnap) {\n      const urls = extractS3Urls(docSnap);', text)

# toggle hide
text = re.sub(r'const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\s*await docRef\.update\(updateData\);',
    'const { error } = await supabaseAdmin.from(\"posts\").update(updateData).eq(\"id\", id);\n    if (error) throw error;', text)

# generic collection get
text = re.sub(r'snapshot = await db\.collection\(collectionName\)\.orderBy\(orderByField, orderDirection\)\.get\(\);',
    'const { data, error } = await supabaseAdmin.from(collectionName).select(\"*\").order(orderByField, { ascending: orderDirection == \"asc\" });\n      if (error) throw error;\n      snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };', text)
text = re.sub(r'snapshot = await db\.collection\(collectionName\)\.get\(\);',
    'const { data, error } = await supabaseAdmin.from(collectionName).select(\"*\");\n      if (error) throw error;\n      snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };', text)

# generic delete
text = re.sub(r'const docRef = db\.collection\(collectionName\)\.doc\(id\);\s*await docRef\.delete\(\);',
    'const { error } = await supabaseAdmin.from(collectionName).delete().eq(\"id\", id);\n    if (error) throw error;', text)

# generic add
text = re.sub(r'const docRef = db\.collection\(collectionName\)\.doc\(\);\s*await docRef\.set\(\{ \.\.\.data, createdAt: new Date\(\)\.toISOString\(\) \}\);\s*return docRef\.id;',
    'const { data: inserted, error } = await supabaseAdmin.from(collectionName).insert([{ ...data, created_at: new Date().toISOString() }]).select(\"id\").single();\n    if (error) throw error;\n    return inserted.id;', text)

# generic update
text = re.sub(r'const docRef = db\.collection\(collectionName\)\.doc\(id\);\s*await docRef\.update\(data\);',
    'const { error } = await supabaseAdmin.from(collectionName).update(data).eq(\"id\", id);\n    if (error) throw error;', text)

# Auth functions (whole function replacement via regex)
text = re.sub(r'export async function addAdminUser\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function addAdminUser(name, email, password, role) {
  try {
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });
    if (createError) throw createError;
    
    const { error } = await supabaseAdmin.from(\"admin_users\").insert([{
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
    console.error(\"Error creating admin user:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function getAdminUsers\(.*?\).*?console\.error\(\"Error fetching admin users:\", error\);\s*return \[\];\s*\}',
    '''export async function getAdminUsers() {
  try {
    const { data, error } = await supabaseAdmin.from(\"admin_users\").select(\"*\").order(\"created_at\", { ascending: false });
    if (error) throw error;
    return (data || []).map(row => ({
       id: row.email,
       ...row,
       mustChangePassword: row.must_change_password,
       createdAt: row.created_at
    }));
  } catch (error) {
    console.error(\"Error fetching admin users:\", error);
    return [];
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function deleteAdminUser\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function deleteAdminUser(email, uid) {
  try {
    if (uid) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (deleteError) throw deleteError;
    }
    const { error } = await supabaseAdmin.from(\"admin_users\").delete().eq(\"email\", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(\"Error deleting admin user:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function updateAdminProfile\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function updateAdminProfile(email, uid, newName, newPassword) {
  try {
    let updatePayload = {};
    if (newName) updatePayload.user_metadata = { name: newName };
    if (newPassword) updatePayload.password = newPassword;

    if (uid && Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(uid, updatePayload);
      if (updateError) throw updateError;
    }

    if (newName) {
      const { error } = await supabaseAdmin.from(\"admin_users\").update({ name: newName }).eq(\"email\", email);
      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(\"Error updating admin profile:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function updateAdminEmail\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function updateAdminEmail(oldEmail, newEmail, uid) {
  try {
    if (!newEmail || !newEmail.includes(\"@\")) throw new Error(\"Invalid new email address\");
    if (uid) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(uid, { email: newEmail, email_confirm: true });
      if (emailError) throw emailError;
    }
    const { error: updateError } = await supabaseAdmin.from(\"admin_users\").update({ email: newEmail }).eq(\"email\", oldEmail);
    if (updateError) throw updateError;
    return { success: true };
  } catch (error) {
    console.error(\"Error updating admin email:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function flagAdminUser\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function flagAdminUser(email, flagged, byEmail) {
  try {
    const { error } = await supabaseAdmin.from(\"admin_users\").update({ 
      flagged: flagged,
      flagged_by_email: flagged ? byEmail : null
    }).eq(\"email\", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(\"Error flagging admin user:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function updateAdminRole\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function updateAdminRole(email, uid, newRole) {
  try {
    if (uid) {
      const { error: roleError } = await supabaseAdmin.auth.admin.updateUserById(uid, { user_metadata: { role: newRole } });
      if (roleError) throw roleError;
    }
    const { error } = await supabaseAdmin.from(\"admin_users\").update({ role: newRole }).eq(\"email\", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(\"Error updating admin role:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function getAdminRole\(.*?\).*?return null;\s*\}',
    '''export async function getAdminRole(email) {
  try {
    if (!email) return null;
    const { data, error } = await supabaseAdmin.from(\"admin_users\").select(\"role\").eq(\"email\", email).maybeSingle();
    if (data) return data.role;
    return null;
  } catch (error) {
    console.error(\"Error fetching admin role:\", error);
    return null;
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function clearMustChangePassword\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function clearMustChangePassword(email, name, username) {
  try {
    const { error } = await supabaseAdmin.from(\"admin_users\").update({ 
      must_change_password: false,
      name: name || \"\"
    }).eq(\"email\", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(\"Error clearing mustChangePassword:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'export async function resetAdminPassword\(.*?\).*?\{ success: false, message: error\.message \};\s*\}',
    '''export async function resetAdminPassword(email, uid, temporaryPassword) {
  try {
    if (!uid) throw new Error(\"User ID is required to reset password\");
    const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: temporaryPassword });
    if (passError) throw passError;
    
    const { error } = await supabaseAdmin.from(\"admin_users\").update({ must_change_password: true }).eq(\"email\", email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(\"Error resetting admin password:\", error);
    return { success: false, message: error.message };
  }
}''', text, flags=re.DOTALL)

text = re.sub(r'await db\.collection\(\"members\"\)\.doc\(id\)\.update\(dataToUpdate\);',
    'const { error } = await supabaseAdmin.from(\"members\").update(dataToUpdate).eq(\"id\", id);\n      if (error) throw error;', text)

# Handle contacts and social media
text = re.sub(r'const snapshot = await db\.collection\(\"contacts\"\)\.orderBy\(\"order\", \"asc\"\)\.get\(\);',
    'const { data, error } = await supabaseAdmin.from(\"contacts\").select(\"*\").order(\"sort_order\", { ascending: true });\n    if (error) throw error;\n    const snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };', text)
text = re.sub(r'const docRef = await db\.collection\(\"contacts\"\)\.add\(contactData\);',
    'const { data: inserted, error } = await supabaseAdmin.from(\"contacts\").insert([contactData]).select(\"id\").single();\n    if (error) throw error;\n    const docRef = { id: inserted.id };', text)
text = re.sub(r'await db\.collection\(\"contacts\"\)\.doc\(id\)\.update\(updateData\);',
    'const { error } = await supabaseAdmin.from(\"contacts\").update(updateData).eq(\"id\", id);\n    if (error) throw error;', text)
text = re.sub(r'await db\.collection\(\"contacts\"\)\.doc\(id\)\.delete\(\);',
    'const { error } = await supabaseAdmin.from(\"contacts\").delete().eq(\"id\", id);\n    if (error) throw error;', text)

text = re.sub(r'const snapshot = await db\.collection\(\"social_media\"\)\.orderBy\(\"platform\", \"asc\"\)\.get\(\);',
    'const { data, error } = await supabaseAdmin.from(\"social_media\").select(\"*\").order(\"platform\", { ascending: true });\n    if (error) throw error;\n    const snapshot = { docs: data.map(d => ({ id: d.id, data: () => d })) };', text)
text = re.sub(r'const docRef = await db\.collection\(\"social_media\"\)\.add\(socialData\);',
    'const { data: inserted, error } = await supabaseAdmin.from(\"social_media\").insert([socialData]).select(\"id\").single();\n    if (error) throw error;\n    const docRef = { id: inserted.id };', text)
text = re.sub(r'await db\.collection\(\"social_media\"\)\.doc\(id\)\.update\(updateData\);',
    'const { error } = await supabaseAdmin.from(\"social_media\").update(updateData).eq(\"id\", id);\n    if (error) throw error;', text)
text = re.sub(r'await db\.collection\(\"social_media\"\)\.doc\(id\)\.delete\(\);',
    'const { error } = await supabaseAdmin.from(\"social_media\").delete().eq(\"id\", id);\n    if (error) throw error;', text)

text = re.sub(r'const snapshot = await db\.collection\(\"members\"\)\.where\(\"idNumber\", \"==\", String\(idNumber\)\)\.get\(\);',
    'const { data: snapshot, error } = await supabaseAdmin.from(\"members\").select(\"*\").eq(\"id_number\", String(idNumber));\n    if (error) throw error;', text)
text = re.sub(r'if \(snapshot\.empty\)', 'if (!snapshot || len(snapshot) == 0)', text)

with open('client/src/app/admin/actions.js', 'w') as f:
    f.write(text)
print('Migration complete')
