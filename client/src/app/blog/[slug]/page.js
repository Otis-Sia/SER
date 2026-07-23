import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../blog.module.css";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";

async function getPostBySlug(slug) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
    const res = await fetch(`${API_BASE}/api/posts/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found | SER" };
  
  return {
    title: `${post.title} | SER Blog`,
    description: post.body_md.substring(0, 150) + "...",
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className={styles.postContainer}>
      <Link href="/blog" className={styles.backLink}>
        <FiArrowLeft /> Back to Blog
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

        <div className={styles.postBody}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body_md}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
