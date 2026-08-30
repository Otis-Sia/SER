const fs = require('fs');
const url = 'https://photos.app.goo.gl/LMMJLJpmRPvjExWm7';
fetch(url, { redirect: 'follow' })
  .then(res => res.text())
  .then(text => {
    fs.writeFileSync('gp-test.html', text);
    console.log('Saved HTML, length:', text.length);
    const regex1 = /(?:\["(https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9\-_]+)",([0-9]+),([0-9]+)\])/g;
    let match;
    let count1 = 0;
    while((match = regex1.exec(text))) { count1++; }
    console.log('Regex 1 matches:', count1);
    
    // Alternative regex
    const regex2 = /https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9\-_]+/g;
    let s = new Set();
    while((match = regex2.exec(text))) { s.add(match[0]); }
    console.log('Regex 2 unique matches:', s.size);
    if(s.size > 0) console.log(Array.from(s).slice(0, 3));
  })
  .catch(console.error);
