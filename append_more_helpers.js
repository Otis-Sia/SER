const fs = require('fs');

const extra = `

export async function checkDuplicateMember(field, value) {
  try {
    if (field === 'email') return checkEmailExists(value);
    if (field === 'phone' || field === 'whatsapp') return checkPhoneExists(value);
    return { exists: false };
  } catch (e) {
    return { exists: false };
  }
}

export async function clearMustChangePassword(email) {
  try {
    const { error } = await supabaseAdmin.from('admin_users').update({ must_change_password: false }).eq('email', email);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
`;

fs.appendFileSync('client/src/app/admin/actions.js', extra);
console.log('Appended checkDuplicateMember and clearMustChangePassword to actions.js');
