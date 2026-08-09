import Link from 'next/link';

import CommunityClient from './CommunityClient';

import { getAdminDb } from "@/lib/firebaseAdmin";
import { getSiteContent } from '../admin/actions';

async function getPosts() {
  try {
    const db = getAdminDb();
    if (!db) return [];
    
    const snapshot = await db.collection("posts")
      .orderBy("published_at", "desc")
      .get();
      
    // Filter published posts in memory to avoid needing a Firestore composite index
    const docs = snapshot.docs.filter(doc => doc.data().published === true);
    
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        cover_url: data.cover_url,
        published_at: data.published_at?.toDate?.()?.toISOString?.() ?? data.published_at ?? null,
      };
    });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return [];
  }
}

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Community & Network | Scouts Emergency Response';
  const description = 'Connect with Scouts, emergency responders, volunteers, and community leaders dedicated to safety, knowledge sharing, and emergency preparedness.';
  const rawImage = siteContent.siteMeta?.communityHeroBgImage;
  const heroImage = (rawImage && (rawImage.endsWith('.jpg') || rawImage.endsWith('.png') || rawImage.startsWith('http')))
    ? rawImage
    : '/assets/images/backgrounds/scouts_hero_bg.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/community',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'SER Community & Network',
        },
      ],
    },
    alternates: {
      canonical: '/community',
    },
  };
}

export default async function Community() {
  const posts = await getPosts();
  const siteContent = await getSiteContent();

  return (
    <>
      <section 
        className="community-intro page-hero"
        style={siteContent.siteMeta?.communityHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.communityHeroBgImage})` } : {}}
      >
        <h1>Join the SER Community</h1>
        <p>
          The SER Community brings together Scouts, volunteers, responders, and partners who share a passion for service, preparedness, and saving lives. This is where experiences are shared, ideas grow, and impact begins.
        </p>
      </section>

      <CommunityClient posts={posts} />
    </>
  );
}
