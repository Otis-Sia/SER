"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import blogStyles from "../blog/blog.module.css";
import JoinForm from './JoinForm';

export default function CommunityClient({ posts }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingPdfUrl, setViewingPdfUrl] = useState(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState("");

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
              posts.map((post) => {
                const isPdf = post.body_md && post.body_md.startsWith('pdf:');
                const cardContent = (
                  <>
                    {post.cover_url && (
                      <div className={blogStyles.imageWrapper}>
                        <img src={post.cover_url} alt={post.title} className={blogStyles.image} />
                      </div>
                    )}
                    <div className={blogStyles.content}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <h2 className={blogStyles.postTitle}>{post.title}</h2>
                        {isPdf && (
                          <span style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}>
                            PDF
                          </span>
                        )}
                      </div>
                      <div className={blogStyles.meta}>
                        <FiCalendar /> {new Date(post.published_at).toLocaleDateString()}
                      </div>
                      <div className={blogStyles.readMore}>
                        {isPdf ? 'View PDF' : 'Read article'} <FiArrowRight />
                      </div>
                    </div>
                  </>
                );

                if (isPdf) {
                  return (
                    <button 
                      onClick={() => {
                        setViewingPdfUrl(post.body_md.substring(4));
                        setViewingPdfTitle(post.title);
                      }} 
                      key={post.id} 
                      className={blogStyles.card}
                      style={{ 
                        display: 'block', 
                        width: '100%', 
                        textAlign: 'left', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit'
                      }}
                    >
                      {cardContent}
                    </button>
                  );
                }

                return (
                  <Link href={`/blog/${post.slug}`} key={post.id} className={blogStyles.card}>
                    {cardContent}
                  </Link>
                );
              })
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
                <p>You&apos;ll be welcomed into SER as an active member of the organization.</p>
              </div>
            </div>
          </section>
        </>
      )}

      {viewingPdfUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'var(--white-color, #fff)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '1000px',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{viewingPdfTitle}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a 
                  href={viewingPdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn"
                  style={{ 
                    fontSize: '0.85rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    padding: '0.4rem 0.8rem',
                    margin: 0,
                    textDecoration: 'none',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#334155',
                    fontWeight: 500
                  }}
                >
                  Open in New Tab
                </a>
                <button 
                  onClick={() => setViewingPdfUrl(null)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: '1.75rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    lineHeight: 1
                  }}
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', backgroundColor: '#f1f5f9' }}>
              <iframe 
                src={`${viewingPdfUrl}#toolbar=0&navpanes=0`}
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                title={viewingPdfTitle}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
