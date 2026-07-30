import { getSiteContent } from '../admin/actions';
import DonationForm from '../../components/DonationForm';

export const metadata = {
  title: 'Donate | Scouts Emergency Response',
  description: 'Support Scouts Emergency Response (SER). Your donation helps us provide vital emergency preparedness training and resources.',
  openGraph: {
    title: 'Donate | Scouts Emergency Response',
    description: 'Support Scouts Emergency Response (SER). Your donation helps us provide vital emergency preparedness training and resources.',
    url: '/donate',
  },
  alternates: {
    canonical: '/donate',
  },
};

export default async function Donate() {
  const siteContent = await getSiteContent();

  return (
    <>
      <section 
        className="page-hero"
        style={siteContent.siteMeta?.homeHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.homeHeroBgImage})` } : {}}
      >
        <h1>Donate to SER</h1>
        <p>Your contribution makes a life-saving difference.</p>
      </section>

      <section className="intro-text text-center" style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Support Our Mission</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Scouts Emergency Response (SER) runs practical programs that build safety skills, strengthen preparedness, and support communities during emergencies. By donating, you ensure our volunteers have the kits, training, and resources needed to respond effectively.
        </p>

        <div style={{ backgroundColor: 'var(--white-color)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--box-shadow)', border: '1px solid var(--border-color, #eaeaea)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Donate securely via PesaPal</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
            Please fill in your details below to make a secure donation through PesaPal using M-Pesa, Visa, or Mastercard.
          </p>
          
          <DonationForm />
        </div>
      </section>
    </>
  );
}
