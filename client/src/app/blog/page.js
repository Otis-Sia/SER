import Link from "next/link";
import styles from "./blog.module.css";
import { FiCalendar, FiArrowRight } from "react-icons/fi";

async function getPosts() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
    const res = await fetch(`${API_BASE}/api/posts`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return [];
  }
}

export const metadata = {
  title: "Blog & Updates | Scouts Emergency Response",
  description: "Read the latest stories, training recaps, and emergency preparedness updates from the Scouts Emergency Response community.",
  openGraph: {
    title: "Blog & Updates | Scouts Emergency Response",
    description: "Read the latest stories, training recaps, and emergency preparedness updates from the SER community.",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Our Blog</h1>
        <p className={styles.subtitle}>Insights, stories, and updates from the community.</p>
      </header>

      <div className={styles.grid}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>No posts available yet. Check back soon!</div>
        ) : (
          posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} className={styles.card}>
              {post.cover_url && (
                <div className={styles.imageWrapper}>
                  <img src={post.cover_url} alt={post.title} className={styles.image} />
                </div>
              )}
              <div className={styles.content}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <div className={styles.meta}>
                  <FiCalendar /> {new Date(post.published_at).toLocaleDateString()}
                </div>
                <div className={styles.readMore}>
                  Read article <FiArrowRight />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
