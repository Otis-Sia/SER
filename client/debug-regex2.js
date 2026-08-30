const fs = require('fs');
const text = fs.readFileSync('gp-test.html', 'utf-8');

// Simplest regex just looking for the structure
const regex = /\["(https:\/\/[^"]+)",\d+,\d+/g;
let match;
let s = new Set();
while ((match = regex.exec(text))) {
  s.add(match[1]);
}
console.log('Found simple:', s.size);
console.log(Array.from(s).slice(0, 3));
