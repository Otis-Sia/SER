import { config } from '@/lib/config';

export default function robots() {
  const baseUrl = config.siteUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
