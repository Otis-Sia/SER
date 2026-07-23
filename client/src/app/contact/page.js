import Link from 'next/link';
import SocialIcons from '../../components/SocialIcons';
import ContactForm from '../../components/ContactForm';
import { getSiteContent } from '../admin/actions';


export const metadata = {
  title: 'Contact SER | Scouts Emergency Response',
};

export default async function Contact() {
  const siteContent = await getSiteContent();
  return (
    <>
      <section className="contact-intro page-hero">
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
          <li style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a>
          </li>
          <li style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            <strong>Phone:</strong>{' '}
            <a href={`tel:${siteContent.contact.phone}`}>{siteContent.contact.phone}</a> (Local) / <a href={`tel:${siteContent.contact.phoneInternational}`}>{siteContent.contact.phoneInternational}</a> (International)
          </li>
          <li style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            <strong>WhatsApp:</strong>{' '}
            <a href={siteContent.contact.whatsappLink} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          </li>
        </ul>

        <h3 className="mt-1_5" style={{ marginBottom: '1rem' }}>Follow SER on Social Media</h3>
        <SocialIcons osns={siteContent.siteMeta.osns} className="contact-social" showText={true} direction="column" />
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
