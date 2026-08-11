import { getSiteContent } from './admin/actions';
import { config } from '@/lib/config';

const slugify = (value) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

export default async function sitemap() {
  const baseUrl = (config.siteUrl || 'https://www.seresponse.org').replace(/\/$/, '');
  const currentDate = new Date().toISOString();

  const routes = [
    ['', 'weekly', 1.0],
    ['/about', 'monthly', 0.9],
    ['/projects', 'weekly', 0.8],
    ['/events', 'weekly', 0.8],
    ['/community', 'weekly', 0.8],
    ['/blog', 'weekly', 0.8],
    ['/contact', 'monthly', 0.7],
    ['/shop', 'weekly', 0.5],
  ].map(([path, changeFrequency, priority]) => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency,
    priority,
  }));

  try {
    const siteContent = await getSiteContent();
    const team = siteContent.about?.team || [];
    for (const member of team) {
      if (member.name && member.name.trim() && member.name !== member.role) {
        const slug = slugify(member.name);
        if (slug) {
          routes.push({
            url: `${baseUrl}/about/${slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to add team pages to sitemap:', error);
  }

  try {
    const res = await fetch(`${config.apiUrl}/api/posts`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const posts = await res.json();
      for (const post of posts) {
        if (post.slug && post.published !== false) {
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
    console.error('Failed to add blog posts to sitemap:', error);
  }

  // Remove duplicate URLs before returning the sitemap.
  return Array.from(new Map(routes.map((route) => [route.url, route])).values());
}
