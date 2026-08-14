const fs = require('fs');

let content = fs.readFileSync('client/src/app/admin/actions.js', 'utf8');

// Fix 1: remaining `db.collection` at line 329
content = content.replace(
  'const snapshot = await db.collection("members").where("idNumber", "==", String(idNumber)).get();\n    if (snapshot.empty) return { success: false, message: "No match found" };',
  'const { data: snapshotData, error: snapError } = await supabaseAdmin.from("members").select("*").eq("id_number", String(idNumber));\n    if (snapError) throw snapError;\n    if (!snapshotData || snapshotData.length === 0) return { success: false, message: "No match found" };\n    const snapshot = { docs: snapshotData.map(d => ({ id: d.id, data: () => ({ ...d, idNumber: d.id_number, firstName: d.first_name, lastName: d.last_name, email: d.email, phone: d.phone, whatsapp: d.whatsapp, nationality: d.nationality, idType: d.id_type }) })) };'
);

// Fix 2: snapshot.forEach at line 335
content = content.replace(
  '    snapshot.forEach((doc) => {',
  '    snapshot.docs.forEach((doc) => {'
);

// Fix 3: stray closing brace at line 370
content = content.replace(
  '    const snapshot = { empty: !data || data.length === 0, docs: (data||[]).map(d => ({ id: d.id, data: () => d })) };\n      snapshot.forEach((doc) => {\n        members.push({ id: doc.id, ...doc.data() });\n      });\n    }',
  '    if (data && data.length > 0) {\n      data.forEach((doc) => {\n        members.push({ id: doc.id, ...doc });\n      });\n    }'
);

fs.writeFileSync('client/src/app/admin/actions.js', content);
console.log('Fixed actions.js');
