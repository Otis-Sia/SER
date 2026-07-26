export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seresponse.org';
  const currentDate = new Date().toISOString();

  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/update-details`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamically add blog post URLs
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    const res = await fetch(`${API_BASE}/api/posts`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const posts = await res.json();
      for (const post of posts) {
        if (post.slug) {
          routes.push({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updated_at || post.created_at || currentDate,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    }
  } catch (error) {
    // Blog posts fetch failed — continue with static routes only
  }

  return routes;
}
