import Link from 'next/link';
import SocialIcons from '../../components/SocialIcons';
import ContactForm from '../../components/ContactForm';
import { getSiteContent, getFaqs } from '../admin/actions';
import JsonLd from '../../components/JsonLd';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Contact Us | Scouts Emergency Response';
  const description = 'Get in touch with Scouts Emergency Response (SER). Request emergency preparedness training, partner with us, or send us a message.';
  const rawImage = siteContent.siteMeta?.contactHeroBgImage;
  const heroImage = (rawImage && (rawImage.endsWith('.jpg') || rawImage.endsWith('.png') || rawImage.startsWith('http')))
    ? rawImage
    : '/assets/images/backgrounds/scouts_hero_bg.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/contact',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'Contact Scouts Emergency Response',
        },
      ],
    },
    alternates: {
      canonical: '/contact',
    },
  };
}

export default async function Contact() {
  const siteContent = await getSiteContent();
  const faqs = await getFaqs();
  const contactData = siteContent.contact || {};

  // Read social profiles from siteMeta
  const osns = siteContent.siteMeta?.socialProfiles || [];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <section 
        className="contact-intro page-hero"
        style={siteContent.siteMeta?.contactHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.contactHeroBgImage})` } : {}}
      >
        <h1>{siteContent.contact.title}</h1>
        <p>{siteContent.contact.description}</p>
      </section>

      <section className="contact-form">
        <h2>Send a Message</h2>
        <ContactForm />
      </section>

      <section className="contact-info">
        <h2>Other Ways to Reach Us</h2>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {contactData.email && (
            <li style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
            </li>
          )}
          {contactData.phoneInternational && (
            <li style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              <strong>Phone:</strong>{' '}
              <a href={`tel:${contactData.phoneInternational.replace(/\s+/g, '')}`}>{contactData.phoneInternational}</a>
            </li>
          )}
          {contactData.whatsappLink && (
            <li style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              <strong>WhatsApp:</strong>{' '}
              <a href={contactData.whatsappLink} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </li>
          )}
        </ul>

        <h3 className="mt-1_5" style={{ marginBottom: '1rem' }}>Follow SER on Social Media</h3>
        <SocialIcons osns={osns} className="contact-social" showText={true} direction="column" />
      </section>

      <section className="faq-content intro-text" id="faq">
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>Frequently Asked Questions</h2>
        {faqs.map((item, index) => (
          <article className="faq-item" key={item.id || index}>
            <h3>{item.question}</h3>
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: item.answer }} />
          </article>
        ))}
      </section>

      <section className="contact-cta text-center">
        <h2>Want to Join SER?</h2>
        <p>
          Register to become part of our growing network of Scouts, volunteers, and responders.
        </p>
      </section>
    </>
  );
}
