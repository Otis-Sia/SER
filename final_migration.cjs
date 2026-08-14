const fs = require('fs');

let content = fs.readFileSync('client/src/app/admin/actions.js', 'utf8');

// 1. Remove all Firebase DB initializations
content = content.replace(/const db = getAdminDb\(\);\n/g, '');
content = content.replace(/if \(!db\) throw new Error\("Firebase Admin not initialized"\);\n/g, '');
content = content.replace(/if \(!db\) throw new Error\("Database not initialized"\);\n/g, '');
content = content.replace(/if \(!db\) return \{ success: false, message: "Database not initialized" \};\n/g, '');
content = content.replace(/if \(!db\) return \{ success: false, message: "DB not initialized" \};\n/g, '');
content = content.replace(/if \(!db\) return \[\];\n/g, '');
content = content.replace(/if \(!db\) return null;\n/g, '');
content = content.replace(/if \(!auth \|\| !db\) throw new Error\("Firebase Admin not initialized"\);\n/g, '');

// 2. Remove `if (db) {` and its matching `}`.
// Instead of complex parsing, let's replace the whole `if (db) { ... }` in submitMemberRegistration
content = content.replace(
  /if \(db\) \{\n\s*const docRef = await db\.collection\("members"\)\.add\(memberData\);\n\s*memberData\.id = docRef\.id;\n\s*\}/g,
  `const { data: inserted, error } = await supabaseAdmin.from("members").insert([memberData]).select("id").single();
    if (error) throw error;
    memberData.id = inserted.id;`
);

// 3. Fix queries (findMemberRegistration)
content = content.replace(
  /const snapshot = await db\.collection\("members"\)\.where\("idNumber", "==", String\(idNumber\)\)\.get\(\);\n\s*if \(snapshot\.empty\) return \{ success: false, message: "No match found" \};\n\n\s*let matchedDoc = null;\n\s*const searchContact = String\(contactStr\)\.toLowerCase\(\)\.trim\(\);\n\n\s*snapshot\.forEach\(\(doc\) => \{/g,
  `const { data: snapshotData, error: snapError } = await supabaseAdmin.from("members").select("*").eq("id_number", String(idNumber));
    if (snapError) throw snapError;
    if (!snapshotData || snapshotData.length === 0) return { success: false, message: "No match found" };

    let matchedDoc = null;
    const searchContact = String(contactStr).toLowerCase().trim();

    snapshotData.forEach((docData) => {
      const data = { ...docData, idNumber: docData.id_number, firstName: docData.first_name, lastName: docData.last_name, email: docData.email, phone: docData.phone, whatsapp: docData.whatsapp, nationality: docData.nationality, idType: docData.id_type };
      const doc = { id: docData.id, data: () => data };`
);

// 4. Fix getMemberRegistrations
content = content.replace(
  /const snapshot = await db\.collection\("members"\)\.orderBy\("createdAt", "desc"\)\.get\(\);\n\s*if \(!snapshot\.empty\) \{\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*members\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n\s*\}\);\n\s*\}/g,
  `const { data, error } = await supabaseAdmin.from("members").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      data.forEach((doc) => {
        members.push({ id: doc.id, ...doc, firstName: doc.first_name, middleName: doc.middle_name, lastName: doc.last_name, county: doc.county, subCounty: doc.sub_county, bloodType: doc.blood_type, createdAt: doc.created_at });
      });
    }`
);

// 5. updateMemberRegistrationStatus
content = content.replace(
  /await db\.collection\("members"\)\.doc\(id\)\.update\(\{\n\s*flagged: flagged,\n\s*flaggedByEmail: flagged \? byEmail : null,\n\s*\}\);/g,
  `const { error } = await supabaseAdmin.from("members").update({
      flagged: flagged,
      flagged_by_email: flagged ? byEmail : null,
    }).eq("id", id);
    if (error) throw error;`
);

// 6. deleteMemberRegistration
content = content.replace(
  /await db\.collection\("members"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("members").delete().eq("id", id);
    if (error) throw error;`
);

// 7. getPosts
content = content.replace(
  /const snapshot = await db\.collection\("posts"\)\.orderBy\("created_at", "desc"\)\.get\(\);\n\s*if \(!snapshot\.empty\) \{\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*posts\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n\s*\}\);\n\s*\}/g,
  `const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      data.forEach((doc) => {
        posts.push({ id: doc.id, ...doc });
      });
    }`
);

// 8. getPostBySlug
content = content.replace(
  /const snapshot = await db\.collection\("posts"\)\.where\("slug", "==", slug\)\.limit\(1\)\.get\(\);\n\s*if \(snapshot\.empty\) return null;\n\s*const doc = snapshot\.docs\[0\];\n\s*return \{ id: doc\.id, \.\.\.doc\.data\(\) \};/g,
  `const { data, error } = await supabaseAdmin.from("posts").select("*").eq("slug", slug).limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return null;
    const doc = data[0];
    return { id: doc.id, ...doc };`
);

// 9. submitPost
content = content.replace(
  /const existing = await db\.collection\("posts"\)\.where\("slug", "==", safeSlug\)\.limit\(1\)\.get\(\);\n\s*if \(!existing\.empty\) \{\n\s*return \{ success: false, message: "A post with this slug already exists" \};\n\s*\}/g,
  `const { data: existing, error: exError } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).limit(1);
    if (exError) throw exError;
    if (existing && existing.length > 0) {
      return { success: false, message: "A post with this slug already exists" };
    }`
);
content = content.replace(
  /const docRef = await db\.collection\("posts"\)\.add\(postData\);\n\s*return \{ success: true, id: docRef\.id, slug: safeSlug \};/g,
  `const { data: inserted, error } = await supabaseAdmin.from("posts").insert([postData]).select("id").single();
    if (error) throw error;
    return { success: true, id: inserted.id, slug: safeSlug };`
);

// 10. updatePost
content = content.replace(
  /const docRef = db\.collection\("posts"\)\.doc\(id\);\n\s*const docSnap = await docRef\.get\(\);\n\n\s*if \(!docSnap\.exists\) \{\n\s*return \{ success: false, message: "Post not found" \};\n\s*\}/g,
  `const { data: docSnap, error: snapError } = await supabaseAdmin.from("posts").select("*").eq("id", id).maybeSingle();
    if (snapError) throw snapError;
    if (!docSnap) {
      return { success: false, message: "Post not found" };
    }`
);
content = content.replace(
  /const existingPublishedAt = docSnap\.data\(\)\.publishedAt;/g,
  `const existingPublishedAt = docSnap.published_at;`
);
content = content.replace(
  /const existing = await db\.collection\("posts"\)\.where\("slug", "==", safeSlug\)\.limit\(1\)\.get\(\);\n\s*if \(!existing\.empty && existing\.docs\[0\]\.id !== id\) \{\n\s*return \{ success: false, message: "Another post with this slug already exists" \};\n\s*\}/g,
  `const { data: existing, error: exError } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).limit(1);
    if (exError) throw exError;
    if (existing && existing.length > 0 && existing[0].id !== id) {
      return { success: false, message: "Another post with this slug already exists" };
    }`
);
content = content.replace(
  /await docRef\.update\(updateData\);/g,
  `const { error: updateError } = await supabaseAdmin.from("posts").update(updateData).eq("id", id);
    if (updateError) throw updateError;`
);

// 11. deletePost
content = content.replace(
  /await docRef\.delete\(\);/g,
  `const { error: delError } = await supabaseAdmin.from("posts").delete().eq("id", id);
    if (delError) throw delError;`
);

// 12. getAdminUsers
content = content.replace(
  /const snapshot = await db\.collection\("admin_users"\)\.orderBy\("createdAt", "desc"\)\.get\(\);\n\s*const users = \[\];\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*users\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n\s*\}\);\n\s*return users;/g,
  `const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const users = [];
    if (data && data.length > 0) {
      data.forEach((doc) => {
        users.push({ id: doc.email, ...doc, createdAt: doc.created_at, mustChangePassword: doc.must_change_password });
      });
    }
    return users;`
);

// 13. addAdminUser DB part
content = content.replace(
  /await db\.collection\("admin_users"\)\.doc\(email\)\.set\(\{\n\s*email,\n\s*name,\n\s*role,\n\s*uid: userRecord\.uid,\n\s*mustChangePassword: true,\n\s*createdAt: new Date\(\)\.toISOString\(\),\n\s*\}\);/g,
  `const { error: dbError } = await supabaseAdmin.from("admin_users").insert([{ email, name, role, uid: userRecord.uid, must_change_password: true, created_at: new Date().toISOString() }]);
    if (dbError) throw dbError;`
);

// 14. deleteAdminUser DB part
content = content.replace(
  /await db\.collection\("admin_users"\)\.doc\(email\)\.delete\(\);/g,
  `const { error: delErrorDb } = await supabaseAdmin.from("admin_users").delete().eq("email", email);
    if (delErrorDb) throw delErrorDb;`
);

// 15. updateAdminProfile DB part
content = content.replace(
  /await db\.collection\("admin_users"\)\.doc\(email\)\.update\(\{\n\s*name: newName \|\| "",\n\s*mustChangePassword: false,\n\s*\}\);/g,
  `const { error: dbError } = await supabaseAdmin.from("admin_users").update({ name: newName || "", must_change_password: false }).eq("email", email);
    if (dbError) throw dbError;`
);

// 16. updateAdminEmail DB part
content = content.replace(
  /const oldDocRef = await db\.collection\("admin_users"\)\.doc\(oldEmail\)\.get\(\);\n\n\s*if \(!oldDocRef\.exists\) \{\n\s*return \{ success: false, message: "Admin user record not found" \};\n\s*\}/g,
  `const { data: oldDoc, error: oldDocError } = await supabaseAdmin.from("admin_users").select("*").eq("email", oldEmail).maybeSingle();
    if (oldDocError) throw oldDocError;
    if (!oldDoc) {
      return { success: false, message: "Admin user record not found" };
    }`
);
content = content.replace(
  /await db\.collection\("admin_users"\)\.doc\(newEmail\)\.set\(\{\n\s*\.\.\.oldDocRef\.data\(\),\n\s*email: newEmail,\n\s*\}\);\n\n\s*await db\.collection\("admin_users"\)\.doc\(oldEmail\)\.delete\(\);/g,
  `const { error: newDocError } = await supabaseAdmin.from("admin_users").insert([{ ...oldDoc, email: newEmail }]);
    if (newDocError) throw newDocError;

    const { error: deleteOldError } = await supabaseAdmin.from("admin_users").delete().eq("email", oldEmail);
    if (deleteOldError) throw deleteOldError;`
);

// 17. updateAdminRole DB part
content = content.replace(
  /const docRef = await db\.collection\("admin_users"\)\.doc\(email\)\.get\(\);\n\s*if \(!docRef\.exists\) \{\n\s*return \{ success: false, message: "Admin user record not found" \};\n\s*\}/g,
  `const { data: adminDoc, error: adminDocError } = await supabaseAdmin.from("admin_users").select("*").eq("email", email).maybeSingle();
    if (adminDocError) throw adminDocError;
    if (!adminDoc) {
      return { success: false, message: "Admin user record not found" };
    }`
);
content = content.replace(
  /await db\.collection\("admin_users"\)\.doc\(email\)\.update\(\{ role: newRole \}\);/g,
  `const { error: dbError } = await supabaseAdmin.from("admin_users").update({ role: newRole }).eq("email", email);
    if (dbError) throw dbError;`
);

// 18. resetAdminPassword DB part
content = content.replace(
  /await db\.collection\("admin_users"\)\.doc\(email\)\.update\(\{ mustChangePassword: true \}\);/g,
  `const { error: dbError } = await supabaseAdmin.from("admin_users").update({ must_change_password: true }).eq("email", email);
    if (dbError) throw dbError;`
);

// 19. checkEmailExists
content = content.replace(
  /const emailSnap = await db\.collection\("members"\)\.where\("email", "==", email\.toLowerCase\(\)\.trim\(\)\)\.limit\(1\)\.get\(\);\n\s*if \(!emailSnap\.empty\) \{\n\s*return \{ exists: true, message: "Email is already registered" \};\n\s*\}/g,
  `const { data: emailSnap } = await supabaseAdmin.from("members").select("id").eq("email", email.toLowerCase().trim()).limit(1);
    if (emailSnap && emailSnap.length > 0) {
      return { exists: true, message: "Email is already registered" };
    }`
);

// 20. checkPhoneExists
content = content.replace(
  /const phoneSnap = await db\.collection\("members"\)\.where\("phone", "==", cleanPhone\)\.limit\(1\)\.get\(\);\n\s*if \(!phoneSnap\.empty\) \{\n\s*return \{ exists: true, message: "Phone number is already registered" \};\n\s*\}/g,
  `const { data: phoneSnap } = await supabaseAdmin.from("members").select("id").eq("phone", cleanPhone).limit(1);
    if (phoneSnap && phoneSnap.length > 0) {
      return { exists: true, message: "Phone number is already registered" };
    }`
);
content = content.replace(
  /const whatsappSnap = await db\.collection\("members"\)\.where\("whatsapp", "==", cleanPhone\)\.limit\(1\)\.get\(\);\n\s*if \(!whatsappSnap\.empty\) \{\n\s*return \{ exists: true, message: "WhatsApp number is already registered" \};\n\s*\}/g,
  `const { data: whatsappSnap } = await supabaseAdmin.from("members").select("id").eq("whatsapp", cleanPhone).limit(1);
    if (whatsappSnap && whatsappSnap.length > 0) {
      return { exists: true, message: "WhatsApp number is already registered" };
    }`
);

// 21. CMS contacts / social media
content = content.replace(
  /const snapshot = await db\.collection\("contacts"\)\.orderBy\("order", "asc"\)\.get\(\);\n\s*const contacts = \[\];\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*contacts\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n\s*\}\);\n\s*return contacts;/g,
  `const { data, error } = await supabaseAdmin.from("contacts").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    const contacts = [];
    if (data && data.length > 0) {
      data.forEach((doc) => {
        contacts.push({ id: doc.id, ...doc, order: doc.sort_order });
      });
    }
    return contacts;`
);

content = content.replace(
  /const docRef = await db\.collection\("contacts"\)\.add\(contactData\);\n\s*return \{ success: true, id: docRef\.id \};/g,
  `const { data: inserted, error } = await supabaseAdmin.from("contacts").insert([contactData]).select("id").single();
    if (error) throw error;
    return { success: true, id: inserted.id };`
);

content = content.replace(
  /await db\.collection\("contacts"\)\.doc\(id\)\.update\(updateData\);/g,
  `const { error } = await supabaseAdmin.from("contacts").update(updateData).eq("id", id);
    if (error) throw error;`
);

content = content.replace(
  /await db\.collection\("contacts"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
    if (error) throw error;`
);

content = content.replace(
  /const snapshot = await db\.collection\("social_media"\)\.orderBy\("platform", "asc"\)\.get\(\);\n\s*const links = \[\];\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*links\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n\s*\}\);\n\s*return links;/g,
  `const { data, error } = await supabaseAdmin.from("social_media").select("*").order("platform", { ascending: true });
    if (error) throw error;
    const links = [];
    if (data && data.length > 0) {
      data.forEach((doc) => {
        links.push({ id: doc.id, ...doc });
      });
    }
    return links;`
);

content = content.replace(
  /const docRef = await db\.collection\("social_media"\)\.add\(socialData\);\n\s*return \{ success: true, id: docRef\.id \};/g,
  `const { data: inserted, error } = await supabaseAdmin.from("social_media").insert([socialData]).select("id").single();
    if (error) throw error;
    return { success: true, id: inserted.id };`
);

content = content.replace(
  /await db\.collection\("social_media"\)\.doc\(id\)\.update\(updateData\);/g,
  `const { error } = await supabaseAdmin.from("social_media").update(updateData).eq("id", id);
    if (error) throw error;`
);

content = content.replace(
  /await db\.collection\("social_media"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("social_media").delete().eq("id", id);
    if (error) throw error;`
);

// generic collection get
content = content.replace(
  /let snapshot;\n\n\s*if \(orderByField\) \{\n\s*snapshot = await db\.collection\(collectionName\)\.orderBy\(orderByField, orderDirection\)\.get\(\);\n\s*\} else \{\n\s*snapshot = await db\.collection\(collectionName\)\.get\(\);\n\s*\}\n\n\s*const data = \[\];\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*data\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);\n\s*\}\);\n\n\s*return data;/g,
  `let data = [];
    let query = supabaseAdmin.from(collectionName).select("*");
    if (orderByField) {
      query = query.order(orderByField, { ascending: orderDirection === "asc" });
    }
    const { data: results, error } = await query;
    if (error) throw error;
    if (results && results.length > 0) {
      results.forEach((doc) => {
        data.push({ id: doc.id, ...doc });
      });
    }
    return data;`
);

content = content.replace(
  /const docRef = id \? db\.collection\(collectionName\)\.doc\(id\) : db\.collection\(collectionName\)\.doc\(\);\n\n\s*if \(id\) \{\n\s*await docRef\.update\(data\);\n\s*\} else \{\n\s*await docRef\.set\(\{ \.\.\.data, createdAt: new Date\(\)\.toISOString\(\) \}\);\n\s*\}/g,
  `let docRef = { id };
    if (id) {
      const { error } = await supabaseAdmin.from(collectionName).update(data).eq("id", id);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await supabaseAdmin.from(collectionName).insert([{ ...data, created_at: new Date().toISOString() }]).select("id").single();
      if (error) throw error;
      docRef.id = inserted.id;
    }`
);

content = content.replace(
  /await db\.collection\(collectionName\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from(collectionName).delete().eq("id", id);
    if (error) throw error;`
);

// Imports
content = content.replace(/import \{ getAdminDb, getAdminAuth \} from "@\/lib\/firebaseAdmin";/g, 'import { supabaseAdmin } from "@/lib/supabaseAdmin";');
content = content.replace(/const auth = getAdminAuth\(\);\n/g, '');


fs.writeFileSync('client/src/app/admin/actions.js', content);
console.log('Successfully completed full migration logic.');
