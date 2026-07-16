'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function TiktokEmbed({ url }) {
  const cleanUrl = url?.split('?')[0];
  
  // Return early if no valid URL
  if (!cleanUrl) return null;
  
  // Extract username and video/photo ID
  const match = cleanUrl.match(/@([^/]+)\/(video|photo)\/([^/?]+)/);
  if (!match) return null;
  
  const [, username, , videoId] = match;

  // The TikTok embed blockquote
  const embedCode = `<blockquote class="tiktok-embed" cite="${cleanUrl}" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px; margin: 0 auto;" > <section> <a target="_blank" title="@${username}" href="https://www.tiktok.com/@${username}?refer=embed">@${username}</a> </section> </blockquote>`;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div dangerouslySetInnerHTML={{ __html: embedCode }} style={{ width: '100%', maxWidth: '605px' }} />
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}
