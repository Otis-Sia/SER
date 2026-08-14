const fs = require('fs');

let lines = fs.readFileSync('client/src/app/admin/actions.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  let l = lines[i];

  if (l.includes('const db = getAdminDb();')) {
    lines[i] = '';
  }
  else if (l.includes('const auth = getAdminAuth();')) {
    lines[i] = '';
  }
  else if (l.includes('if (!auth || !db) throw new Error("Firebase Admin not initialized");')) {
    lines[i] = '';
  }
  else if (l.includes('if (!db) throw new Error("Firebase Admin not initialized");')) {
    lines[i] = '';
  }
  else if (l.includes('if (!db) return [];')) {
    lines[i] = '';
  }
  else if (l.includes('if (!db) return null;')) {
    lines[i] = '';
  }
  else if (l.includes('if (db) {')) {
    lines[i] = '';
  }

  // db.collection().add
  else if (l.includes('const docRef = await db.collection("members").add(memberData);')) {
    lines[i] = 'const { data: inserted, error } = await supabaseAdmin.from("members").insert([memberData]).select("id").single(); if (error) throw error; const docRef = { id: inserted.id };';
  }
  else if (l.includes('const docRef = await db.collection("posts").add(postData);')) {
    lines[i] = 'const { data: inserted, error } = await supabaseAdmin.from("posts").insert([postData]).select("id").single(); if (error) throw error; const docRef = { id: inserted.id };';
  }
  else if (l.includes('const docRef = await db.collection("contacts").add(contactData);')) {
    lines[i] = 'const { data: inserted, error } = await supabaseAdmin.from("contacts").insert([contactData]).select("id").single(); if (error) throw error; const docRef = { id: inserted.id };';
  }
  else if (l.includes('const docRef = await db.collection("social_media").add(socialData);')) {
    lines[i] = 'const { data: inserted, error } = await supabaseAdmin.from("social_media").insert([socialData]).select("id").single(); if (error) throw error; const docRef = { id: inserted.id };';
  }

  // db.collection().orderBy().get()
  else if (l.includes('const snapshot = await db.collection("members").orderBy("createdAt", "desc").get();')) {
    lines[i] = 'const { data, error } = await supabaseAdmin.from("members").select("*").order("created_at", { ascending: false }); if (error) throw error; const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };';
  }
  else if (l.includes('const snapshot = await db.collection("posts").orderBy("createdAt", "desc").get();')) {
    lines[i] = 'const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false }); if (error) throw error; const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };';
  }
  else if (l.includes('const snapshot = await db.collection("posts").orderBy("created_at", "desc").get();')) {
    lines[i] = 'const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false }); if (error) throw error; const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };';
  }
  else if (l.includes('const snapshot = await db.collection("admin_users").orderBy("createdAt", "desc").get();')) {
    lines[i] = 'const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false }); if (error) throw error; const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.email, data: () => ({...d, createdAt: d.created_at}) })) };';
  }
  else if (l.includes('const snapshot = await db.collection("contacts").orderBy("order", "asc").get();')) {
    lines[i] = 'const { data, error } = await supabaseAdmin.from("contacts").select("*").order("sort_order", { ascending: true }); if (error) throw error; const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => ({...d, order: d.sort_order}) })) };';
  }
  else if (l.includes('const snapshot = await db.collection("social_media").orderBy("platform", "asc").get();')) {
    lines[i] = 'const { data, error } = await supabaseAdmin.from("social_media").select("*").order("platform", { ascending: true }); if (error) throw error; const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };';
  }

  // db.collection().doc().get()
  else if (l.includes('const docRef = await db.collection("admin_users").doc(email).get();')) {
    lines[i] = 'const { data: drData } = await supabaseAdmin.from("admin_users").select("*").eq("email", email).maybeSingle(); const docRef = { exists: !!drData, data: () => drData };';
  }
  else if (l.includes('const oldDocRef = await db.collection("admin_users").doc(oldEmail).get();')) {
    lines[i] = 'const { data: drData } = await supabaseAdmin.from("admin_users").select("*").eq("email", oldEmail).maybeSingle(); const oldDocRef = { exists: !!drData, data: () => drData };';
  }
  else if (l.includes('const docSnap = await docRef.get();')) {
    if (lines[i-1] && lines[i-1].includes('posts')) {
      lines[i] = 'const { data: dsData } = await supabaseAdmin.from("posts").select("*").eq("id", id).maybeSingle(); const docSnap = { exists: !!dsData, data: () => dsData };';
    } else {
      lines[i] = 'const { data: dsData } = await supabaseAdmin.from(collectionName).select("*").eq("id", id).maybeSingle(); const docSnap = { exists: !!dsData, data: () => dsData };';
    }
  }

  // db.collection().where().get()
  else if (l.includes('const snapshot = await db.collection("members").where("idNumber", "==", String(idNumber)).get();')) {
    lines[i] = 'const { data: wData } = await supabaseAdmin.from("members").select("*").eq("id_number", String(idNumber)); const snapshot = { empty: !wData || wData.length === 0, docs: (wData||[]).map(d => ({ id: d.id, data: () => ({...d, idNumber: d.id_number, firstName: d.first_name, lastName: d.last_name, middleName: d.middle_name, bloodType: d.blood_type, idType: d.id_type, subCounty: d.sub_county, createdAt: d.created_at}) })) };';
  }
  else if (l.includes('const existing = await db.collection("posts").where("slug", "==", safeSlug).limit(1).get();')) {
    lines[i] = 'const { data: exData } = await supabaseAdmin.from("posts").select("id").eq("slug", safeSlug).limit(1); const existing = { empty: !exData || exData.length === 0, docs: (exData||[]).map(d => ({ id: d.id })) };';
  }
  else if (l.includes('const emailSnap = await db.collection("members").where("email", "==", email.toLowerCase().trim()).limit(1).get();')) {
    lines[i] = 'const { data: eData } = await supabaseAdmin.from("members").select("id").eq("email", email.toLowerCase().trim()).limit(1); const emailSnap = { empty: !eData || eData.length === 0 };';
  }
  else if (l.includes('const phoneSnap = await db.collection("members").where("phone", "==", cleanPhone).limit(1).get();')) {
    lines[i] = 'const { data: pData } = await supabaseAdmin.from("members").select("id").eq("phone", cleanPhone).limit(1); const phoneSnap = { empty: !pData || pData.length === 0 };';
  }
  else if (l.includes('const whatsappSnap = await db.collection("members").where("whatsapp", "==", cleanPhone).limit(1).get();')) {
    lines[i] = 'const { data: wData } = await supabaseAdmin.from("members").select("id").eq("whatsapp", cleanPhone).limit(1); const whatsappSnap = { empty: !wData || wData.length === 0 };';
  }

  // snapshot = await db.collection(collectionName).orderBy/get
  else if (l.includes('snapshot = await db.collection(collectionName).orderBy(orderByField, orderDirection).get();')) {
    lines[i] = 'const { data: cData } = await supabaseAdmin.from(collectionName).select("*").order(orderByField, { ascending: orderDirection === "asc" }); snapshot = { empty: !cData || cData.length===0, docs: (cData||[]).map(d => ({ id: d.id, data: () => d })) };';
  }
  else if (l.includes('snapshot = await db.collection(collectionName).get();')) {
    lines[i] = 'const { data: cData } = await supabaseAdmin.from(collectionName).select("*"); snapshot = { empty: !cData || cData.length===0, docs: (cData||[]).map(d => ({ id: d.id, data: () => d })) };';
  }

  // db.collection().doc() 
  else if (l.includes('const docRef = db.collection(collectionName).doc();')) {
    lines[i] = 'const docRef = { id: undefined };';
  }
  else if (l.includes('const docRef = db.collection(collectionName).doc(id);')) {
    lines[i] = 'const docRef = { id };';
  }
  else if (l.includes('const docRef = db.collection("posts").doc(id);')) {
    lines[i] = 'const docRef = { id };';
  }

  // await db.collection().doc().set/update/delete
  else if (l.includes('await db.collection("members").doc(id).update({')) {
    let buf = 'const { error } = await supabaseAdmin.from("members").update({';
    lines[i] = buf;
    while (!lines[i].includes('});')) {
      i++;
      if(lines[i].includes('flaggedByEmail: flagged ? byEmail : null')) {
        lines[i] = lines[i].replace('flaggedByEmail', 'flagged_by_email');
      }
      if(lines[i].includes('});')) {
        lines[i] = lines[i].replace('});', '}).eq("id", id); if (error) throw error;');
      }
    }
  }
  else if (l.includes('await db.collection("members").doc(id).update(payload);')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("members").update(payload).eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await db.collection("members").doc(id).update(dataToUpdate);')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("members").update(dataToUpdate).eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await db.collection("members").doc(id).delete();')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("members").delete().eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await db.collection("admin_users").doc(email).set({')) {
    let buf = 'const { error } = await supabaseAdmin.from("admin_users").insert([{ email, ';
    lines[i] = buf;
    while (!lines[i].includes('});')) {
      i++;
      if (lines[i].includes('uid: userRecord.uid,')) buf += 'uid: userRecord.uid, ';
      if (lines[i].includes('name,')) buf += 'name, ';
      if (lines[i].includes('role,')) buf += 'role, ';
      if (lines[i].includes('mustChangePassword: true,')) buf += 'must_change_password: true, ';
      if (lines[i].includes('createdAt: new Date().toISOString()')) buf += 'created_at: new Date().toISOString() ';
      if(lines[i].includes('});')) {
        lines[i] = buf + '}]); if (error) throw error;';
      }
    }
  }
  else if (l.includes('await db.collection("admin_users").doc(newEmail).set({')) {
    let buf = 'const { error } = await supabaseAdmin.from("admin_users").insert([{ ...oldDocRef.data(), email: newEmail ';
    lines[i] = buf;
    while (!lines[i].includes('});')) {
      i++;
      if(lines[i].includes('});')) {
        lines[i] = buf + '}]); if (error) throw error;';
      }
    }
  }
  else if (l.includes('await db.collection("admin_users").doc(email).delete();')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("admin_users").delete().eq("email", email); if (error) throw error;';
  }
  else if (l.includes('await db.collection("admin_users").doc(oldEmail).delete();')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("admin_users").delete().eq("email", oldEmail); if (error) throw error;';
  }
  else if (l.includes('await db.collection("admin_users").doc(email).update({ name: newName });')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("admin_users").update({ name: newName }).eq("email", email); if (error) throw error;';
  }
  else if (l.includes('await db.collection("admin_users").doc(email).update({ role: newRole });')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("admin_users").update({ role: newRole }).eq("email", email); if (error) throw error;';
  }
  else if (l.includes('await db.collection("admin_users").doc(email).update({ mustChangePassword: true });')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("admin_users").update({ must_change_password: true }).eq("email", email); if (error) throw error;';
  }
  else if (l.includes('await db.collection("admin_users").doc(email).update({')) {
    let buf = 'const { error } = await supabaseAdmin.from("admin_users").update({';
    lines[i] = buf;
    while (!lines[i].includes('});')) {
      i++;
      if (lines[i].includes('mustChangePassword: false,')) lines[i] = lines[i].replace('mustChangePassword', 'must_change_password');
      if (lines[i].includes('flaggedByEmail: flagged ? byEmail : null')) lines[i] = lines[i].replace('flaggedByEmail', 'flagged_by_email');
      if(lines[i].includes('});')) {
        lines[i] = lines[i].replace('});', '}).eq("email", email); if (error) throw error;');
      }
    }
  }
  else if (l.includes('await db.collection("contacts").doc(id).update(updateData);')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("contacts").update(updateData).eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await db.collection("contacts").doc(id).delete();')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await db.collection("social_media").doc(id).update(updateData);')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("social_media").update(updateData).eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await db.collection("social_media").doc(id).delete();')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("social_media").delete().eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await docRef.set({ ...data, createdAt: new Date().toISOString() });')) {
    lines[i] = 'const { data: inserted, error } = await supabaseAdmin.from(collectionName).insert([{ ...data, created_at: new Date().toISOString() }]).select("id").single(); if (error) throw error; docRef.id = inserted.id;';
  }
  else if (l.includes('await docRef.update(data);')) {
    lines[i] = 'const { error } = await supabaseAdmin.from(collectionName).update(data).eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await docRef.update(updateData);')) {
    lines[i] = 'const { error } = await supabaseAdmin.from("posts").update(updateData).eq("id", id); if (error) throw error;';
  }
  else if (l.includes('await docRef.delete();')) {
    if (lines[i-1] && lines[i-1].includes('docSnap')) {
      lines[i] = 'const { error } = await supabaseAdmin.from("posts").delete().eq("id", id); if (error) throw error;';
    } else {
      lines[i] = 'const { error } = await supabaseAdmin.from(collectionName).delete().eq("id", id); if (error) throw error;';
    }
  }

  // edge cases
  else if (l.includes('const existingPublishedAt = docSnap.data().publishedAt;')) {
    lines[i] = 'const existingPublishedAt = docSnap.data().published_at;';
  }
  else if (l.includes('const snap = await db.collection("members")')) {
    lines[i] = 'const { data: snapData } = await supabaseAdmin.from("members").select("*")';
  }
}

fs.writeFileSync('client/src/app/admin/actions.js', lines.join('\n'));
console.log('Fixed actions.js database logic.');
