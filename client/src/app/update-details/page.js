import { getSiteContent } from '../admin/actions';
import UpdateDetailsClient from './UpdateDetailsClient';

export const metadata = {
  title: 'Update Your Details | Scouts Emergency Response',
  description: 'Update your existing member registration details for Scouts Emergency Response.',
  openGraph: {
    title: 'Update Your Details | Scouts Emergency Response',
    description: 'Update your existing member registration details for Scouts Emergency Response.',
    url: '/update-details',
    images: [
      {
        url: '/assets/images/backgrounds/scouts_hero_bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Update Details Scouts Emergency Response',
      },
    ],
  },
  alternates: {
    canonical: '/update-details',
  },
};

export default async function UpdateDetailsPage() {
  const siteContent = await getSiteContent();

  return (
    <>
      <section 
        className="community-intro page-hero"
        style={siteContent.siteMeta?.communityHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.communityHeroBgImage})` } : {}}
      >
        <h1>Update Your Registration</h1>
        <p>
          Need to update your contact info, training details, or address? Use the form below to find your record and keep it up to date.
        </p>
      </section>

      <UpdateDetailsClient />
    </>
  );
}
