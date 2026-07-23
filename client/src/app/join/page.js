import JoinForm from './JoinForm';

export const metadata = {
  title: 'Join SER & Volunteer | Scouts Emergency Response',
  description: 'Become a member of Scouts Emergency Response (SER). Register as a volunteer first responder and help build emergency-prepared communities.',
  openGraph: {
    title: 'Join SER & Volunteer | Scouts Emergency Response',
    description: 'Become a member of Scouts Emergency Response (SER). Register as a volunteer first responder and help build emergency-prepared communities.',
    url: '/join',
  },
  alternates: {
    canonical: '/join',
  },
};

export default function JoinPage() {
  return (
    <>
      {/* Hero */}
      <section className="join-hero page-hero">
        <h1>Join SER</h1>
        <p>
          Become part of the Scouts Emergency Response family. Fill in the form
          below to register as a member and start making a difference in your
          community.
        </p>
      </section>

      {/* Form Section */}
      <section className="join-form-section">
        <JoinForm />
      </section>

      {/* Info Section */}
      <section className="join-info text-center">
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
  );
}
