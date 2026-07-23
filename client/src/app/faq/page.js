import Link from 'next/link';
import { getSiteContent } from '../admin/actions';
import JsonLd from '../../components/JsonLd';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | Scouts Emergency Response',
  description: 'Find answers to common questions about Scouts Emergency Response (SER), training programs, volunteer opportunities, and emergency response services.',
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Scouts Emergency Response',
    description: 'Find answers to common questions about Scouts Emergency Response (SER), training programs, volunteer opportunities, and emergency response services.',
    url: '/faq',
  },
  alternates: {
    canonical: '/faq',
  },
};

export default async function FAQ() {
  const siteContent = await getSiteContent();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (siteContent.faq?.questions || []).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <section className="faq-intro page-hero text-center">
        <h1>{siteContent.faq.title}</h1>
        <p className="intro-text">{siteContent.faq.description}</p>
        <div className="mt-1">
          <Link href="/contact" className="btn btn-accent">
            Contact SER
          </Link>
        </div>
      </section>

      <section className="faq-content intro-text">
        {siteContent.faq.questions.map((item, index) => (
          <article className="faq-item" key={index}>
            <h2>{item.q}</h2>
            <p>{item.a}</p>
          </article>
        ))}
      </section>

      <section className="faq-cta text-center">
        <h2>Still Have Questions?</h2>
        <p className="intro-text">
          If you want to volunteer, request training, or partner with SER, contact us and we&apos;ll respond.
        </p>

        <div className="cta-actions">
          <Link href="/contact" className="btn btn-accent">
            Contact Us
          </Link>
          <Link href="/events" className="btn">
            View Events
          </Link>
        </div>
      </section>
    </>
  );
}
