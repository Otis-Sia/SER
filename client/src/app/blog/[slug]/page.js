import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../blog.module.css";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";

import { getAdminDb } from "@/lib/firebaseAdmin";

async function getPostBySlug(slug) {
  try {
    if (!slug) return null;
    const db = getAdminDb();
    if (!db) return null;

    const snapshot = await db.collection("posts")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString?.() ?? data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString?.() ?? data.updated_at ?? new Date().toISOString(),
      published_at: data.published_at?.toDate?.()?.toISOString?.() ?? data.published_at ?? null,
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
  
  return {
    title: `${post.title} | SER Blog`,
    description: post.body_md ? post.body_md.substring(0, 150) + "..." : "",
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
          <img 
            src={post.cover_url} 
            alt={post.title} 
            className={styles.postCover} 
          />
        )}

        <div 
          className={styles.postBody} 
          dangerouslySetInnerHTML={{ __html: post.body_md?.replace(/&nbsp;/g, ' ') || '' }} 
        />
      </article>
    </div>
  );
}
