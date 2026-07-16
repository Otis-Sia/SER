'use client';

export default function FacebookEmbed({ url }) {
  if (!url) return null;
  
  // Facebook requires the URL to be URL-encoded for the iframe src
  const encodedUrl = encodeURIComponent(url);
  const iframeSrc = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <iframe 
        src={iframeSrc}
        width="500" 
        height="698" 
        style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }} 
        scrolling="no" 
        frameBorder="0" 
        allowFullScreen={true} 
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      ></iframe>
    </div>
  );
}
