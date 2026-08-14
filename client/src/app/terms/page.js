import Link from 'next/link';
import { ShieldCheck, Camera, UserCheck, Lock, FileText, AlertCircle, HelpCircle } from 'lucide-react';
import { getSiteContent } from '../admin/actions';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Terms of Service & Media Release | Scouts Emergency Response';
  const description = 'Official Terms of Service, Volunteer Agreement, and Media & Photo Release Policy for Scouts Emergency Response (SER).';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/terms',
    },
    alternates: {
      canonical: '/terms',
    },
  };
}

export default async function TermsPage() {
  const siteContent = await getSiteContent();
  const lastUpdated = 'August 14, 2026';

  return (
    <main className="legal-page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '0.4rem 1rem', 
          borderRadius: '50px', 
          background: 'rgba(18, 154, 68, 0.1)', 
          color: 'var(--primary-color)', 
          fontSize: '0.88rem', 
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <ShieldCheck size={18} /> Official SER Legal Agreement
        </span>
        <h1 style={{ fontSize: 'var(--font-size-h1)', color: 'var(--text-color)', marginBottom: '0.75rem', fontWeight: 700 }}>
          Terms of Service &amp; Media Release
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Effective Date / Last Updated: <strong>{lastUpdated}</strong>
        </p>
      </div>

      {/* Important Callout Box for Media Release */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(18, 154, 68, 0.08) 0%, rgba(18, 154, 68, 0.02) 100%)',
        borderLeft: '4px solid var(--primary-color)',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Camera size={24} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: 600 }}>
              Key Highlight: Photo &amp; Media Release Consent
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
              By registering as a volunteer or participating in Scouts Emergency Response (SER) activities, you grant SER explicit authorization to capture and publish photographs, videos, and media content featuring you across our official social media channels, website, press publications, and training materials.
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', fontSize: '1rem' }}>
        
        {/* Section 1 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} /> 1. Agreement to Terms
          </h2>
          <p>
            Welcome to <strong>Scouts Emergency Response (SER)</strong>. These Terms of Service ("Terms") govern your volunteer membership, participation in drills, deployments, training workshops, and use of our digital platforms.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            By checking the declaration box during registration or by participating in any SER program, you acknowledge that you have read, understood, and agreed to be bound by these Terms, as well as our <Link href="/privacy" style={{ fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} /> 2. Volunteer Membership &amp; Eligibility
          </h2>
          <p>
            SER membership is open to scouts, community youth, first aid enthusiasts, and emergency response volunteers who meet our age, safety, and training standards.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Accuracy of Information:</strong> You agree to provide truthful, precise, and up-to-date information upon registration (including identity numbers, contact details, blood type, and emergency contacts).</li>
            <li><strong>Voluntary Commitment:</strong> Participation in SER activities is voluntary. You agree to adhere to instructions provided by SER commanders, safety officers, and designated event leaders.</li>
            <li><strong>Code of Conduct:</strong> Volunteers must maintain high integrity, discipline, respect, non-discrimination, and uphold the core Scouting values at all times.</li>
          </ul>
        </section>

        {/* Section 3 - MEDIA RELEASE (Comprehensive) */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={22} /> 3. Media, Photo &amp; Video Authorization Release
          </h2>
          <p>
            In order to showcase community impact, raise awareness for emergency response education, document field operations, and recognize volunteer contributions, SER regularly captures photographs, video recordings, audio, and visual stories during activities.
          </p>
          
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.05rem' }}>Scope of Media Release:</h4>
            <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
              <li>
                <strong>Grant of Rights:</strong> You grant SER a perpetual, worldwide, royalty-free, non-exclusive license to take, edit, reproduce, publish, and distribute photographs, video footage, sound recordings, and testimonials in which you appear.
              </li>
              <li>
                <strong>Publishing Channels:</strong> Captured media may be featured across SER's official channels, including:
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>SER Official Website (<a href="https://seresponse.org" target="_blank" rel="noopener noreferrer">seresponse.org</a>)</li>
                  <li>Social Media Platforms (Facebook, Instagram, X/Twitter, TikTok, LinkedIn, YouTube)</li>
                  <li>Annual reports, news releases, promotional flyers, brochures, and field training videos</li>
                  <li>Partner &amp; Sponsor publications documenting disaster response impact</li>
                </ul>
              </li>
              <li>
                <strong>No Compensation:</strong> You acknowledge that you will not receive financial compensation, royalties, or monetary payment for the use of your likeness or photographs.
              </li>
              <li>
                <strong>Waiver of Inspection:</strong> You waive any right to inspect or approve the finished photo, video, or publication prior to its use.
              </li>
              <li>
                <strong>Opt-Out / Revocation Procedure:</strong> If you have specific privacy or personal safety concerns regarding media publication, you may submit a written request to <a href="mailto:info@seresponse.org" style={{ fontWeight: 600 }}>info@seresponse.org</a> detailing your request. SER will endeavor to honor written opt-out requests for future publications where reasonably practicable.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={22} /> 4. Data Protection &amp; Confidentiality
          </h2>
          <p>
            Your personal information (such as contact numbers, ID numbers, blood group, and emergency contact details) is handled with strict confidentiality in accordance with data privacy standards and the <em>Kenya Data Protection Act 2019</em>.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Personal information is accessed strictly by authorized SER officers for team logistics, safety verification, emergency response dispatch, and communications. For full details on how we safeguard your data, review our <Link href="/privacy" style={{ fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </section>

        {/* Section 5 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={22} /> 5. Health, Safety &amp; Limitation of Liability
          </h2>
          <p>
            Emergency response, first aid training, field simulations, and disaster preparedness activities carry inherent physical risks.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Safety Compliance:</strong> Volunteers must strictly observe all safety directives, wear protective gear when instructed, and refrain from engaging in unauthorized hazardous operations.</li>
            <li><strong>Medical Fitness:</strong> Volunteers are responsible for assessing their own medical fitness before participating in strenuous training or field deployments.</li>
            <li><strong>Emergency Medical Consent:</strong> In the event of an illness or injury during an SER activity, you authorize SER leaders to seek necessary medical assistance or emergency transportation on your behalf.</li>
            <li><strong>Limitation of Liability:</strong> SER, its directors, leaders, and partner organizations shall not be held liable for personal injury, property loss, or damage arising out of voluntary participation, except where caused by gross negligence or willful misconduct.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={22} /> 6. Contact &amp; Inquiries
          </h2>
          <p>
            If you have questions, feedback, or concerns regarding these Terms of Service or Media Release policies, please reach out to our administration team:
          </p>
          <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
            <p style={{ margin: '0 0 0.4rem 0' }}><strong>Scouts Emergency Response (SER)</strong></p>
            <p style={{ margin: '0 0 0.4rem 0' }}>Email: <a href="mailto:info@seresponse.org">info@seresponse.org</a></p>
            <p style={{ margin: '0 0 0.4rem 0' }}>Phone / WhatsApp: <a href="https://wa.me/254742435314" target="_blank" rel="noopener noreferrer">+254 742 435 314</a></p>
            <p style={{ margin: 0 }}>Website: <a href="https://seresponse.org" target="_blank" rel="noopener noreferrer">https://seresponse.org</a></p>
          </div>
        </section>

      </div>

      {/* Footer Navigation CTA */}
      <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/community#join" className="btn" style={{ padding: '0.75rem 1.75rem' }}>
          Return to Join Form
        </Link>
        <Link href="/privacy" className="btn" style={{ backgroundColor: '#64748b', borderColor: '#64748b', color: 'white', padding: '0.75rem 1.75rem' }}>
          View Privacy Policy
        </Link>
      </div>
    </main>
  );
}
