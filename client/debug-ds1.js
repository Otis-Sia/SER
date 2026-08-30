const fs = require('fs');
const text = fs.readFileSync('gp-test.html', 'utf-8');
const match = text.match(/key: 'ds:1', isError:  false , hash: '[^']+', data:(.*)}\);<\/script>/);
if (match) {
  const dataStr = match[1].substring(0, 1500);
  console.log(dataStr);
} else {
  // try different format
  const match2 = text.match(/key: 'ds:1'.*?data:function\(\){return (.*)}\);<\/script>/);
  if (match2) {
    console.log(match2[1].substring(0, 1500));
  } else {
    const match3 = text.match(/key: 'ds:1'[\s\S]*?data:([\s\S]*?)}\);<\/script>/);
    if(match3) console.log(match3[1].substring(0,1500));
    else console.log('Not found');
  }
}
