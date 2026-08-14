const fs = require('fs');

let lines = fs.readFileSync('client/src/app/admin/actions.js', 'utf8').split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
  let l = lines[i];

  if (l.includes('const db = getAdminDb();')) continue;
  if (l.includes('const auth = getAdminAuth();')) continue;
  if (l.includes('if (!auth || !db) throw new Error("Firebase Admin not initialized");')) continue;
  if (l.includes('if (!db) throw new Error("Firebase Admin not initialized");')) continue;
  if (l.includes('if (!db) return [];')) continue;
  if (l.includes('if (!db) return null;')) continue;
  if (l.includes('if (db) {')) continue;
  
  if (l.includes('const docRef = await db.collection("members").add(memberData);')) {
    newLines.push('    const { data: inserted, error } = await supabaseAdmin.from("members").insert([memberData]).select("id").single();');
    newLines.push('    if (error) throw error;');
    newLines.push('    const docRef = { id: inserted.id };');
    continue;
  }
  if (l.includes('const snapshot = await db.collection("members").orderBy("createdAt", "desc").get();')) {
    newLines.push('    const { data, error } = await supabaseAdmin.from("members").select("*").order("created_at", { ascending: false });');
    newLines.push('    if (error) throw error;');
    newLines.push('    const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };');
    continue;
  }
  if (l.includes('await db.collection("members").doc(id).update({')) {
    newLines.push('    const { error } = await supabaseAdmin.from("members").update({');
    i++;
    newLines.push('      flagged: flagged,');
    i++;
    newLines.push('      flagged_by_email: flagged ? byEmail : null');
    i++;
    newLines.push('    }).eq("id", id);');
    newLines.push('    if (error) throw error;');
    continue;
  }
  if (l.includes('await db.collection("members").doc(id).update(dataToUpdate);')) {
    newLines.push('    const { error } = await supabaseAdmin.from("members").update(dataToUpdate).eq("id", id);');
    newLines.push('    if (error) throw error;');
    continue;
  }
  if (l.includes('const snapshot = await db.collection("posts").orderBy("created_at", "desc").get();')) {
    newLines.push('    const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false });');
    newLines.push('    if (error) throw error;');
    newLines.push('    const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };');
    continue;
  }
  if (l.includes('const existing = await db.collection("posts").where("slug", "==", safeSlug).limit(1).get();')) {
    newLines.push('    const { data: existingData } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).limit(1);');
    newLines.push('    const existing = { empty: !existingData || existingData.length === 0, docs: existingData };');
    continue;
  }
  if (l.includes('const docRef = await db.collection("posts").add(postData);')) {
    newLines.push('    const { data: inserted, error } = await supabaseAdmin.from("posts").insert([postData]).select("id").single();');
    newLines.push('    if (error) throw error;');
    newLines.push('    const docRef = { id: inserted.id };');
    continue;
  }
  if (l.includes('const docRef = db.collection("posts").doc(id);')) {
    newLines.push('    const docRef = { id };');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(email).set({')) {
    newLines.push('    const { error } = await supabaseAdmin.from("admin_users").insert([{ email, name, role, uid: userRecord.uid, must_change_password: true, created_at: new Date().toISOString() }]);');
    newLines.push('    if (error) throw error;');
    i += 7; // skip the lines inside .set({})
    continue;
  }
  if (l.includes('const snapshot = await db.collection("admin_users").orderBy("createdAt", "desc").get();')) {
    newLines.push('    const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false });');
    newLines.push('    if (error) throw error;');
    newLines.push('    const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.email, data: () => ({...d, createdAt: d.created_at}) })) };');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(email).delete();')) {
    newLines.push('    const { error } = await supabaseAdmin.from("admin_users").delete().eq("email", email);');
    newLines.push('    if (error) throw error;');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(email).update({ name: newName });')) {
    newLines.push('    const { error } = await supabaseAdmin.from("admin_users").update({ name: newName }).eq("email", email);');
    newLines.push('    if (error) throw error;');
    continue;
  }
  if (l.includes('const oldDocRef = await db.collection("admin_users").doc(oldEmail).get();')) {
    newLines.push('    const { data: oldDocRefData } = await supabaseAdmin.from("admin_users").select("*").eq("email", oldEmail).single();');
    newLines.push('    const oldDocRef = { exists: !!oldDocRefData, data: () => oldDocRefData };');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(newEmail).set({')) {
    newLines.push('    const { error } = await supabaseAdmin.from("admin_users").insert([{ ...oldDocRef.data(), email: newEmail }]);');
    newLines.push('    if (error) throw error;');
    i += 3;
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(oldEmail).delete();')) {
    newLines.push('    const { error: delError } = await supabaseAdmin.from("admin_users").delete().eq("email", oldEmail);');
    newLines.push('    if (delError) throw delError;');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(email).update({')) {
    if (lines[i+1].includes('flagged')) {
      newLines.push('    const { error } = await supabaseAdmin.from("admin_users").update({ flagged: flagged, flagged_by_email: flagged ? byEmail : null }).eq("email", email);');
      newLines.push('    if (error) throw error;');
      i += 3;
      continue;
    }
    if (lines[i+1].includes('mustChangePassword: false')) {
      newLines.push('    const { error } = await supabaseAdmin.from("admin_users").update({ must_change_password: false, name: name || "" }).eq("email", email);');
      newLines.push('    if (error) throw error;');
      i += 3;
      continue;
    }
  }
  if (l.includes('const docRef = await db.collection("admin_users").doc(email).get();')) {
    newLines.push('    const { data: docRefData } = await supabaseAdmin.from("admin_users").select("*").eq("email", email).maybeSingle();');
    newLines.push('    const docRef = { exists: !!docRefData, data: () => docRefData };');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(email).update({ role: newRole });')) {
    newLines.push('    const { error } = await supabaseAdmin.from("admin_users").update({ role: newRole }).eq("email", email);');
    newLines.push('    if (error) throw error;');
    continue;
  }
  if (l.includes('await db.collection("admin_users").doc(email).update({ mustChangePassword: true });')) {
    newLines.push('    const { error } = await supabaseAdmin.from("admin_users").update({ must_change_password: true }).eq("email", email);');
    newLines.push('    if (error) throw error;');
    continue;
  }
  if (l.includes('const docRef = db.collection(collectionName).doc();')) {
    newLines.push('    const docRef = { id: undefined };');
    continue;
  }
  if (l.includes('const docRef = db.collection(collectionName).doc(id);')) {
    newLines.push('    const docRef = { id };');
    continue;
  }
  if (l.includes('const snap = await db.collection("members")')) {
    newLines.push('    const { data: snapData, error } = await supabaseAdmin.from("members").select("*")');
    newLines.push('    if (error) throw error;');
    newLines.push('    const snap = { empty: !snapData || snapData.length===0, docs: (snapData||[]).map(d => ({ id: d.id, data: () => d })) };');
    i += 4; // skip the limit(1) etc on next lines for the general member query, wait, it's just one line
    // let's check what it was
    // const snap = await db.collection("members")
    //   .where("idNumber", "==", idNumber)
    //   .limit(1)
    //   .get();
    continue;
  }

  // add original line if not replaced
  newLines.push(l);
}

// Write back
fs.writeFileSync('client/src/app/admin/actions.js', newLines.join('\n'));
console.log('Successfully patched actions.js');
