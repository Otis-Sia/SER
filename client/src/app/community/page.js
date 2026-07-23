import Link from 'next/link';

import CommunityClient from './CommunityClient';

import { getAdminDb } from "@/lib/firebaseAdmin";

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

export const metadata = {
  title: 'Community & Network | Scouts Emergency Response',
  description: 'Connect with Scouts, emergency responders, volunteers, and community leaders dedicated to safety, knowledge sharing, and emergency preparedness.',
  openGraph: {
    title: 'Community & Network | Scouts Emergency Response',
    description: 'Connect with Scouts, emergency responders, volunteers, and community leaders dedicated to safety, knowledge sharing, and emergency preparedness.',
    url: '/community',
  },
  alternates: {
    canonical: '/community',
  },
};

export default async function Community() {
  const posts = await getPosts();

  return (
    <>
      <section className="community-intro page-hero">
        <h1>Join the SER Community</h1>
        <p>
          The SER Community brings together Scouts, volunteers, responders, and partners who share a passion for service, preparedness, and saving lives. This is where experiences are shared, ideas grow, and impact begins.
        </p>
      </section>

      <CommunityClient posts={posts} />
    </>
  );
}
