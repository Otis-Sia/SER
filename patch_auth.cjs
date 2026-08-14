const fs = require('fs');
let lines = fs.readFileSync('client/src/app/admin/actions.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  let l = lines[i];

  if (l.includes('const userRecord = await auth.createUser({')) {
    let buf = '    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({ email, password, user_metadata: { name, role }, email_confirm: true });\n    if (createError) throw createError;\n    const userRecord = { uid: data.user.id };';
    lines[i] = buf;
    i++;
    while(!lines[i].includes('});')) {
      lines[i] = '';
      i++;
    }
    lines[i] = ''; // clear '});'
  }
  else if (l.includes('await auth.setCustomUserClaims(userRecord.uid, { role });')) {
    lines[i] = ''; // Custom claims handled in createUser metadata
  }
  else if (l.includes('await auth.deleteUser(uid);')) {
    lines[i] = '    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);\n    if (deleteError) throw deleteError;';
  }
  else if (l.includes('await auth.updateUser(uid, updatePayload);')) {
    let prev = lines[i-1];
    lines[i] = '    let newPayload = { user_metadata: {} }; if (updatePayload.displayName) newPayload.user_metadata.name = updatePayload.displayName; if (updatePayload.password) newPayload.password = updatePayload.password;\n    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(uid, newPayload);\n    if (updateError) throw updateError;';
  }
  else if (l.includes('await auth.updateUser(uid, { email: newEmail });')) {
    lines[i] = '    const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(uid, { email: newEmail, email_confirm: true });\n    if (emailError) throw emailError;';
  }
  else if (l.includes('await auth.setCustomUserClaims(uid, { role: newRole });')) {
    lines[i] = '    const { error: roleError } = await supabaseAdmin.auth.admin.updateUserById(uid, { user_metadata: { role: newRole } });\n    if (roleError) throw roleError;';
  }
  else if (l.includes('await auth.updateUser(uid, { password: temporaryPassword });')) {
    lines[i] = '    const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: temporaryPassword });\n    if (passError) throw passError;';
  }
}

fs.writeFileSync('client/src/app/admin/actions.js', lines.join('\n'));
console.log('Successfully patched auth in actions.js');
