import { getSiteContent } from '../admin/actions';
import UpdateDetailsClient from './UpdateDetailsClient';

export const metadata = {
  title: 'Update Your Details | Scouts Emergency Response',
  description: 'Update your existing member registration details for Scouts Emergency Response.',
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
