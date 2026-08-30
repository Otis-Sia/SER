const fs = require('fs');
const text = fs.readFileSync('gp-test.html', 'utf-8');
const regex = /\["(https:\/\/[a-zA-Z0-9\-\.]+\.googleusercontent\.com\/[a-zA-Z0-9\-_]+)",[0-9]+,[0-9]+/g;
let match;
let s = new Set();
while ((match = regex.exec(text))) {
  s.add(match[1]);
}
console.log('Found:', s.size);
console.log(Array.from(s).slice(0, 3));
