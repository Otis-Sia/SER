const fs = require('fs');
let content = fs.readFileSync('client/src/app/admin/actions.js', 'utf8');

// Replace imports
content = content.replace(/import \{ getAdminDb, getAdminAuth \} from \"@\/lib\/firebaseAdmin\";/g, 'import { supabaseAdmin } from "@/lib/supabaseAdmin";');

// Remove `const db = getAdminDb();` and `if (db) {` blocks
content = content.replace(/const db = getAdminDb\(\);\n\s*if \(db\) \{/g, '');
// For the places with `if (!db)`
content = content.replace(/const db = getAdminDb\(\);\n\s*if \(\!db\) return \[\];/g, '');
content = content.replace(/const db = getAdminDb\(\);\n\s*if \(\!db\) return null;/g, '');
content = content.replace(/const auth = getAdminAuth\(\);\n\s*const db = getAdminDb\(\);\n\s*if \(\!auth \|\| \!db\) throw new Error\(\"Firebase Admin not initialized\"\);/g, '');

// members.add
content = content.replace(/const docRef = await db\.collection\(\"members\"\)\.add\(memberData\);\n\s*memberData\.id = docRef\.id;\n\s*\}/g,
  `const { data: inserted, error } = await supabaseAdmin.from("members").insert([memberData]).select('id').single();
    if (error) throw error;
    memberData.id = inserted.id;`
);

// members.where(idNumber)
content = content.replace(/const snapshot = await db\.collection\(\"members\"\)\.where\(\"idNumber\", \"==\", String\(\idNumber\)\)\.get\(\);/g, 
  `const { data: snapshot, error } = await supabaseAdmin.from("members").select('*').eq("id_number", String(idNumber));
    if (error) throw error;`
);
content = content.replace(/if \(snapshot\.empty\)/g, 'if (!snapshot || snapshot.length === 0)');

content = content.replace(/snapshot\.forEach\(\(doc\) => \{\n\s*const data = doc\.data\(\);/g, 'snapshot.forEach((data) => {');
content = content.replace(/id: doc\.id,/g, 'id: data.id,');

// members.orderBy
content = content.replace(/const snapshot = await db\.collection\(\"members\"\)\.orderBy\(\"createdAt\", \"desc\"\)\.get\(\);\n\s*if \(\!snapshot\.empty\) \{\n\s*snapshot\.forEach\(\(doc\) => \{\n\s*const data = doc\.data\(\);\n\s*members\.push\(\{\n\s*id: doc\.id,\n\s*\.\.\.data\n\s*\}\);\n\s*\}\);\n\s*\}/g,
  `const { data, error } = await supabaseAdmin.from("members").select('*').order("created_at", { ascending: false });
    if (error) throw error;
    if (data) {
      data.forEach((row) => {
        members.push({ id: row.id, ...row });
      });
    }`
);

// members delete
content = content.replace(/await db\.collection\(\"members\"\)\.doc\(id\)\.delete\(\);/g,
  `const { error } = await supabaseAdmin.from("members").delete().eq("id", id);
      if (error) throw error;`
);

// members flag
content = content.replace(/await db\.collection\(\"members\"\)\.doc\(id\)\.update\(\{\n\s*flagged: flagged,\n\s*flaggedByEmail: flagged \? byEmail : null\n\s*\}\);/g,
  `const { error } = await supabaseAdmin.from("members").update({
        flagged: flagged,
        flagged_by_email: flagged ? byEmail : null
      }).eq("id", id);
      if (error) throw error;`
);

// members update
content = content.replace(/await db\.collection\(\"members\"\)\.doc\(id\)\.update\(payload\);/g,
  `const { error } = await supabaseAdmin.from("members").update(payload).eq("id", id);
      if (error) throw error;`
);

// posts fetch
content = content.replace(/const snapshot = await db\.collection\(\"posts\"\)\.orderBy\(\"createdAt\", \"desc\"\)\.get\(\);\n\s*return snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/g,
  `const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];`
);

// posts exist check
content = content.replace(/const existing = await db\.collection\(\"posts\"\)\.where\(\"slug\", \"==\", safeSlug\)\.get\(\);\n\s*if \(\!existing\.empty\) throw new Error\(\"A post with that slug already exists\"\);/g,
  `const { data: existing, error: existError } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).maybeSingle();
    if (existError) throw existError;
    if (existing) throw new Error("A post with that slug already exists");`
);

// posts insert
content = content.replace(/const docRef = await db\.collection\(\"posts\"\)\.add\(postData\);\n\s*revalidatePath\(\"\/community\"\);\n\s*return \{ success: true, data: \{ id: docRef\.id, \.\.\.postData \} \};/g,
  `const { data: inserted, error: insertError } = await supabaseAdmin.from("posts").insert([postData]).select("id").single();
    if (insertError) throw insertError;
    revalidatePath("/community");
    return { success: true, data: { id: inserted.id, ...postData } };`
);

// update post exist check
content = content.replace(/const existing = await db\.collection\(\"posts\"\)\.where\(\"slug\", \"==\", safeSlug\)\.get\(\);\n\s*if \(\!existing\.empty && existing\.docs\[0\]\.id \!\=\= id\) throw new Error\(\"A post with that slug already exists\"\);/g,
  `const { data: existing, error: existError } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).neq("id", id).maybeSingle();
    if (existError) throw existError;
    if (existing) throw new Error("A post with that slug already exists");`
);

// fetch single post
content = content.replace(/const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\n\s*const docSnap = await docRef\.get\(\);\n\s*if \(\!docSnap\.exists\) throw new Error\(\"Post not found\"\);/g,
  `const { data: docSnap, error: getError } = await supabaseAdmin.from("posts").select("*").eq("id", id).single();
    if (getError) throw new Error("Post not found");`
);

content = content.replace(/const existingPublishedAt = docSnap\.data\(\)\.publishedAt;/g, 'const existingPublishedAt = docSnap.published_at;');

// update post
content = content.replace(/await docRef\.update\(updateData\);/g,
  `const { error: updateError } = await supabaseAdmin.from("posts").update(updateData).eq("id", id);
    if (updateError) throw updateError;`
);

// docSnap access
content = content.replace(/const oldUrls = extractS3Urls\(docSnap\.data\(\)\);/g, 'const oldUrls = extractS3Urls(docSnap);');

// delete post
content = content.replace(/const docRef = db\.collection\(\"posts\"\)\.doc\(id\);\n\s*const docSnap = await docRef\.get\(\);\n\s*await docRef\.delete\(\);/g,
  `const { data: docSnap, error: getError } = await supabaseAdmin.from("posts").select("*").eq("id", id).maybeSingle();
    const { error: deleteError } = await supabaseAdmin.from("posts").delete().eq("id", id);
    if (deleteError) throw deleteError;`
);

content = content.replace(/if \(docSnap\.exists\) \{\n\s*const urls = extractS3Urls\(docSnap\.data\(\)\);/g,
  `if (docSnap) {
      const urls = extractS3Urls(docSnap);`
);

// toggle hide post
content = content.replace(/await db\.collection\(\"posts\"\)\.doc\(id\)\.update\(updateData\);/g,
  `const { error } = await supabaseAdmin.from("posts").update(updateData).eq("id", id);
    if (error) throw error;`
);

fs.writeFileSync('client/src/app/admin/actions.js', content);
console.log('Migrated actions.js DB successfully!');
