const fs = require('fs');
let content = fs.readFileSync('client/src/app/admin/AdminDashboard.js', 'utf8');

// Replace imports
content = content.replace(
  'import { auth } from "@/lib/firebaseClient";\nimport { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";',
  'import { supabase } from "@/lib/supabaseClient";'
);

// Replace onAuthStateChanged
content = content.replace(
  /const unsubscribe = onAuthStateChanged\(auth, async \(currentUser\) => \{/g,
  'const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {\n      const currentUser = session?.user;'
);
content = content.replace(
  /return \(\) => unsubscribe\(\);/g,
  'return () => subscription.unsubscribe();'
);

// Replace signInWithEmailAndPassword
content = content.replace(
  /await signInWithEmailAndPassword\(auth, loginEmail, loginPassword\);/g,
  'const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });\n      if (error) throw error;'
);

// Replace signOut(auth)
content = content.replace(
  /signOut\(auth\)/g,
  'supabase.auth.signOut()'
);

fs.writeFileSync('client/src/app/admin/AdminDashboard.js', content);
console.log('Replaced Firebase Auth with Supabase in AdminDashboard.js');
