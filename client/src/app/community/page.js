import Link from 'next/link';

import CommunityClient from './CommunityClient';

import { getSiteContent } from '../admin/actions';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getPosts() {
  try {
    const { data: docs, error } = await supabaseAdmin
      .from("posts")
      .select("id, title, slug, cover_url, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
      
    if (error) throw error;
    
    return (docs || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      cover_url: doc.cover_url,
      published_at: doc.published_at,
    }));
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
