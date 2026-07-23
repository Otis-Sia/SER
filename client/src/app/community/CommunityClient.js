"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import blogStyles from "../blog/blog.module.css";

export default function CommunityClient({ posts }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={activeTab === 'overview' ? 'btn btn-accent' : 'btn'}
          style={{ cursor: 'pointer' }}
        >
          Community Overview
        </button>
        <button 
          onClick={() => setActiveTab('blog')} 
          className={activeTab === 'blog' ? 'btn btn-accent' : 'btn'}
          style={{ cursor: 'pointer' }}
        >
          Blog Posts
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <section className="community-pillars">
            <h2>What Our Community Does</h2>
            <div className="product-grid">
              <div className="product-card">
                <div className="product-card-info">
                  <h3>Knowledge Sharing</h3>
                  <p>
                    Members exchange resources, emergency tips, training materials, and lessons learned from the field.
                  </p>
                </div>
              </div>

              <div className="product-card">
                <div className="product-card-info">
                  <h3>Volunteer Engagement</h3>
                  <p>
                    Connect with like-minded volunteers and take part in SER trainings, drills, and outreach programs.
                  </p>
                </div>
              </div>

              <div className="product-card">
                <div className="product-card-info">
                  <h3>Storytelling &amp; Impact</h3>
                  <p>
                    Read and share stories from Scouts and communities whose lives have been strengthened through preparedness and action.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="community-cta text-center">
            <h2>Be Part of the Action</h2>
            <p>
              Whether you&apos;re looking to volunteer, learn, or collaborate, the SER Community welcomes you.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/projects" className="btn">Explore Projects</Link>
              <Link href="/contact" className="btn">Get in Touch</Link>
              <Link href="/login/signup" className="btn btn-accent">Register</Link>
            </div>
          </section>
        </>
      )}

      {activeTab === 'blog' && (
        <section className="community-blog" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 className="text-center" style={{ marginBottom: '2rem' }}>Community Blog</h2>
          <div className={blogStyles.grid}>
            {posts.length === 0 ? (
              <div className={blogStyles.emptyState}>No posts available yet. Check back soon!</div>
            ) : (
              posts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id} className={blogStyles.card}>
                  {post.cover_url && (
                    <div className={blogStyles.imageWrapper}>
                      <img src={post.cover_url} alt={post.title} className={blogStyles.image} />
                    </div>
                  )}
                  <div className={blogStyles.content}>
                    <h2 className={blogStyles.postTitle}>{post.title}</h2>
                    <div className={blogStyles.meta}>
                      <FiCalendar /> {new Date(post.published_at).toLocaleDateString()}
                    </div>
                    <div className={blogStyles.readMore}>
                      Read article <FiArrowRight />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}
