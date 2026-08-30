async function extractPhotos(url) {
  try {
    const res1 = await fetch(url);
    const text = await res1.text();
    require('fs').writeFileSync('gp-output.html', text);
    console.log('Saved to gp-output.html');
  } catch (e) {
    console.error(e);
  }
}
extractPhotos('https://photos.app.goo.gl/9yLzB1s2xQ4K1yUv8'); // Wait, I need a valid URL. I'll search the web for one.
