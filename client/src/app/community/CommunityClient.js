"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import blogStyles from "../blog/blog.module.css";
import JoinForm from './JoinForm';

export default function CommunityClient({ posts }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const hash = window.location.hash;

      if (tabParam === 'join' || params.get('register') === 'true' || hash === '#join') {
        setActiveTab('join');
        setTimeout(() => {
          document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (tabParam === 'blog' || tabParam === 'updates' || hash === '#blog' || hash === '#updates') {
        setActiveTab('blog');
      } else if (tabParam === 'overview' || hash === '#overview') {
        setActiveTab('overview');
      }
    }
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={activeTab === 'overview' ? 'btn btn-accent' : 'btn'}
          style={{ cursor: 'pointer' }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('blog')} 
          className={activeTab === 'blog' ? 'btn btn-accent' : 'btn'}
          style={{ cursor: 'pointer' }}
        >
          Updates
        </button>
        <button 
          onClick={() => setActiveTab('join')} 
          className={activeTab === 'join' ? 'btn btn-accent' : 'btn'}
          style={{ cursor: 'pointer' }}
        >
          Join SER
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
              <button onClick={() => setActiveTab('join')} className="btn btn-accent">Register</button>
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

      {activeTab === 'join' && (
        <>
          <section className="join-form-section" id="join" style={{ paddingTop: '1rem' }}>
            <div className="container">
              <JoinForm />
            </div>
          </section>

          <section className="join-info text-center" style={{ marginTop: '4rem' }}>
            <h2>What Happens Next?</h2>
            <div className="join-steps">
              <div className="join-step">
                <span className="join-step-number">1</span>
                <h3>Apply</h3>
                <p>Fill in the registration form above with your details.</p>
              </div>
              <div className="join-step">
                <span className="join-step-number">2</span>
                <h3>Review</h3>
                <p>Our team reviews your application and verifies your details.</p>
              </div>
              <div className="join-step">
                <span className="join-step-number">3</span>
                <h3>Welcome</h3>
                <p>You&apos;ll be welcomed into SER and connected with your crew.</p>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
