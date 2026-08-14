const fs = require('fs');
let content = fs.readFileSync('client/src/app/admin/ChangePasswordScreen.js', 'utf8');

// Replace imports
content = content.replace(
  'import { updatePassword } from "firebase/auth";',
  'import { supabase } from "@/lib/supabaseClient";'
);

// Replace updatePassword
content = content.replace(
  'await updatePassword(user, newPassword);',
  'const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });\n      if (updateError) throw updateError;'
);

fs.writeFileSync('client/src/app/admin/ChangePasswordScreen.js', content);
console.log('Replaced Firebase Auth with Supabase in ChangePasswordScreen.js');
