import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "../blog.module.css";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getPostBySlug(slug) {
  try {
    if (!slug) return null;

    const { data: doc, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .limit(1)
      .maybeSingle();

    if (error || !doc) return null;
    
    return {
      ...doc,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      published_at: doc.published_at,
    };
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found | SER" };
  
  const description = post.body_md ? post.body_md.substring(0, 155).replace(/[#*_\n]/g, '') + "..." : "Read this article on the Scouts Emergency Response blog.";

  return {
    title: `${post.title} | Scouts Emergency Response Blog`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      url: `/blog/${post.slug}`,
      type: 'article',
      images: [
        {
          url: post.cover_url || '/assets/images/backgrounds/scouts_hero_bg.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className={styles.postContainer}>
      <Link href="/community" className={styles.backLink}>
        <FiArrowLeft /> Back to Community
      </Link>

      <article>
        <header className={styles.postHeader}>
          <h1 className={styles.postTitleLarge}>{post.title}</h1>
          <div className={styles.postMeta}>
            <FiCalendar /> Published on {new Date(post.published_at).toLocaleDateString()}
          </div>
        </header>

        {post.cover_url && (
          <div style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden' }}>
            <Image 
              src={post.cover_url} 
              alt={post.title || "Blog cover"} 
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              quality={80}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div 
          className={styles.postBody} 
          dangerouslySetInnerHTML={{ __html: post.body_md?.replace(/&nbsp;/g, ' ') || '' }} 
        />
      </article>
    </div>
  );
}
