const fs = require('fs');
const text = fs.readFileSync('gp-test.html', 'utf-8');
const urls = new Set();
const regex = /https:\/\/[a-zA-Z0-9.\-]+\/[a-zA-Z0-9\-_]{20,}/g;
let match;
while ((match = regex.exec(text)) !== null) {
  urls.add(match[0]);
}
console.log('Found large URLs:', urls.size);
console.log(Array.from(urls).slice(0, 10));
