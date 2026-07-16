'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteContent } from '../admin/actions';

export default function FAQ() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    async function loadData() {
      const content = await getSiteContent();
      setSiteContent(content);
    }
    loadData();
  }, []);

  if (!siteContent) return <div>Loading...</div>;

  return (
    <>
      <section className="faq-intro page-hero text-center">
        <h1>{siteContent.faq.title}</h1>
        <p className="intro-text">
          {siteContent.faq.description}
        </p>
        <div className="mt-1">
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
        </div>
      </section>

      <section className="faq-content intro-text">
        {siteContent.faq.questions.map((item, index) => (
          <div className="faq-item" key={index}>
            <h2>{item.q}</h2>
            <p>{item.a}</p>
          </div>
        ))}
      </section>

      <section className="faq-cta text-center">
        <h2>Still Have Questions?</h2>
        <p className="intro-text">
          If you want to volunteer, request training, or partner with SER, contact us and we&apos;ll respond.
        </p>

        <div className="cta-actions">
          <Link href="/contact" className="btn btn-accent">Contact Us</Link>
          <Link href="/events" className="btn">View Events</Link>
        </div>
      </section>
    </>
  );
}
