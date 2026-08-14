const fs = require('fs');
let content = fs.readFileSync('client/src/app/admin/actions.js', 'utf8');

// Remove Firebase Admin import and getAdminAuth
content = content.replace(/import \{ getAdminAuth \} from \"@\/lib\/firebaseAdmin\";\n/, '');

// Replace addAdminUser Auth
content = content.replace(
  /const auth = getAdminAuth\(\);\n\s*if \(\!auth\) throw new Error\(\"Firebase Admin not initialized\"\);\n\n\s*const userRecord = await auth\.createUser\(\{\n\s*email,\n\s*password,\n\s*displayName: name,\n\s*\}\);\n\n\s*await auth\.setCustomUserClaims\(userRecord\.uid, \{ role \}\);/g,
  `const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });
    if (createError) throw createError;
    const userRecord = { uid: data.user.id };`
);

// Replace deleteAdminUser Auth
content = content.replace(
  /const auth = getAdminAuth\(\);\n\s*if \(\!auth\) throw new Error\(\"Firebase Admin not initialized\"\);\n\n\s*if \(uid\) \{\n\s*await auth\.deleteUser\(uid\);\n\s*\}/g,
  `if (uid) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (deleteError) throw deleteError;
    }`
);

// Replace updateAdminProfile Auth
content = content.replace(
  /const auth = getAdminAuth\(\);\n\s*if \(\!auth\) throw new Error\(\"Firebase Admin not initialized\"\);\n\n\s*let updatePayload = \{\};\n\s*if \(newName\) updatePayload\.displayName = newName;\n\s*if \(newPassword\) updatePayload\.password = newPassword;\n\n\s*if \(uid && Object\.keys\(updatePayload\)\.length > 0\) \{\n\s*await auth\.updateUser\(uid, updatePayload\);\n\s*\}/g,
  `let updatePayload = {};
    if (newName) updatePayload.user_metadata = { name: newName };
    if (newPassword) updatePayload.password = newPassword;

    if (uid && Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(uid, updatePayload);
      if (updateError) throw updateError;
    }`
);

// Replace updateAdminEmail Auth
content = content.replace(
  /const auth = getAdminAuth\(\);\n\s*if \(\!auth\) throw new Error\(\"Firebase Admin not initialized\"\);\n\n\s*if \(\!newEmail \|\| \!newEmail\.includes\(\"@\"\)\) throw new Error\(\"Invalid new email address\"\);\n\n\s*\/\/ 1\. Update email in Firebase Auth\n\s*if \(uid\) \{\n\s*await auth\.updateUser\(uid, \{ email: newEmail \}\);\n\s*\}/g,
  `if (!newEmail || !newEmail.includes("@")) throw new Error("Invalid new email address");

    // 1. Update email in Supabase Auth
    if (uid) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(uid, { email: newEmail, email_confirm: true });
      if (emailError) throw emailError;
    }`
);

// Replace updateAdminRole Auth
content = content.replace(
  /const auth = getAdminAuth\(\);\n\s*if \(\!auth\) throw new Error\(\"Firebase Admin not initialized\"\);\n\n\s*if \(uid\) \{\n\s*await auth\.setCustomUserClaims\(uid, \{ role: newRole \}\);\n\s*\}/g,
  `if (uid) {
      const { error: roleError } = await supabaseAdmin.auth.admin.updateUserById(uid, { user_metadata: { role: newRole } });
      if (roleError) throw roleError;
    }`
);

// Replace resetAdminPassword Auth
content = content.replace(
  /const auth = getAdminAuth\(\);\n\s*if \(\!auth\) throw new Error\(\"Firebase Admin not initialized\"\);\n\n\s*if \(\!uid\) throw new Error\(\"User ID is required to reset password\"\);\n\s*\n\s*\/\/ Update password in Firebase Auth\n\s*await auth\.updateUser\(uid, \{ password: temporaryPassword \}\);/g,
  `if (!uid) throw new Error("User ID is required to reset password");
    
    // Update password in Supabase Auth
    const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: temporaryPassword });
    if (passError) throw passError;`
);

fs.writeFileSync('client/src/app/admin/actions.js', content);
console.log('Replaced Firebase Admin Auth with Supabase Admin Auth in actions.js');
