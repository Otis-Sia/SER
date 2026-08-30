const fs = require('fs');
const text = fs.readFileSync('gp-test.html', 'utf-8');
const regex = /key: 'ds:([0-9]+)'/g;
let match;
while ((match = regex.exec(text))) {
  console.log('Found ds:', match[1]);
}
