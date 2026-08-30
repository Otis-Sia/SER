const https = require('https');

async function extractPhotos(url) {
  try {
    const res1 = await fetch(url);
    const text = await res1.text();
    
    // Look for image arrays
    const regex = /\["(https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9\-_]+)",([0-9]+),([0-9]+)\]/g;
    let match;
    let urls = new Set();
    while ((match = regex.exec(text)) !== null) {
      // The base URL can be appended with =w...-h... for size
      urls.add(match[1]);
    }
    console.log('Found:', urls.size);
    console.log(Array.from(urls).slice(0, 3));
  } catch (e) {
    console.error(e);
  }
}

// Example URL (I need a public shared album URL to test, or just rely on the logic)
extractPhotos('https://photos.app.goo.gl/9yLzB1s2xQ4K1yUv8');
