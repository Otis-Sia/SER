const fs = require('fs');
const filePath = 'client/src/app/admin/actions.js';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// We know line 291-292 has:
//       memberData.id = docRef.id;
//     }
// Let's remove the `}` that follows `memberData.id = docRef.id;`
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('memberData.id = docRef.id;')) {
    if (lines[i + 1] && lines[i + 1].trim() === '}') {
      lines[i + 1] = ''; // Remove the stray bracket
      console.log('Removed stray bracket at line ' + (i + 2));
    }
  }

  // Remove `if (!db)` lines
  if (lines[i].includes('if (!db)')) {
    console.log('Removed db check at line ' + (i + 1));
    lines[i] = '';
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed actions.js syntax errors.');
