export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seresponse.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/login/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
