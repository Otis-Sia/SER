const fs = require('fs');

const extra = `

export async function getSiteContent() {
  try {
    const fs = require('fs');
    if (fs.existsSync(contentFilePath)) {
      return JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
    }
  } catch (e) {}
  return {};
}
`;

fs.appendFileSync('client/src/app/admin/actions.js', extra);
console.log('Appended getSiteContent to actions.js');
