import Link from 'next/link';
import { ShieldCheck, Lock, Database, Eye, Share2, UserCheck, Mail, HeartHandshake } from 'lucide-react';
import { getSiteContent } from '../admin/actions';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Privacy Policy & Child Protection | Scouts Emergency Response';
  const description = 'Privacy Policy and Child Protection Statement for Scouts Emergency Response (SER). Learn how we collect, protect, and handle volunteer information, child safeguarding, media content, and personal data.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/privacy',
    },
    alternates: {
      canonical: '/privacy',
    },
  };
}

export default async function PrivacyPage() {
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
          <ShieldCheck size={18} /> Official SER Privacy Statement
        </span>
        <h1 style={{ fontSize: 'var(--font-size-h1)', color: 'var(--text-color)', marginBottom: '0.75rem', fontWeight: 700 }}>
          Privacy Policy &amp; Child Protection
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Effective Date / Last Updated: <strong>{lastUpdated}</strong>
        </p>
      </div>

      {/* Intro Box */}
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '1.75rem',
        marginBottom: '2.5rem'
      }}>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-color)' }}>
          <strong>Scouts Emergency Response (SER)</strong> is committed to safeguarding the privacy and personal data of our volunteers, members, donors, and site visitors. This Privacy Policy outlines what information we collect, why we collect it, how it is secured, and your rights under applicable privacy regulations, including the <em>Kenya Data Protection Act 2019</em>.
        </p>
      </div>

      {/* Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', fontSize: '1rem' }}>

        {/* Section 1 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} /> 1. Information We Collect
          </h2>
          <p>
            When you register as a volunteer, fill out forms on our website, or join our community networks, we may collect the following categories of information:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Personal Identification Data:</strong> Full name, date of birth, gender, nationality, ID/Passport number, and blood type.</li>
            <li><strong>Contact Details:</strong> Phone number (WhatsApp), email address, residential address, county, sub-county, or city.</li>
            <li><strong>Emergency Contact Information:</strong> Name and phone number of your designated Next of Kin.</li>
            <li><strong>Scouting &amp; Qualification Data:</strong> Scout crew details, education level, first aid certifications, disaster management trainings, and availability status.</li>
            <li><strong>Media &amp; Visual Content:</strong> Photographs, video recordings, and audio taken during SER drills, training sessions, deployments, and community events.</li>
            <li><strong>Children &amp; Minors&apos; Data:</strong> When young scouts (under 18 years of age) participate in youth programs, personal information is collected only with the knowledge and explicit consent of their parent or legal guardian.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={22} /> 2. How We Use Your Information
          </h2>
          <p>
            We use collected data solely to fulfill our youth empowerment and community safety mission:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Volunteer Coordination &amp; Dispatch:</strong> Organizing training rosters, emergency response mobilization, and county preparedness mapping.</li>
            <li><strong>Safety &amp; Emergency Medical Care:</strong> Sharing necessary medical details (e.g. blood group, next of kin) with medical personnel during emergencies.</li>
            <li><strong>Communication:</strong> Sending updates, event invitations, training schedules, and WhatsApp group notices.</li>
            <li><strong>Media &amp; Public Awareness:</strong> Publishing photographs and field stories on our official website, social media pages (Facebook, Instagram, X/Twitter, TikTok, YouTube), and annual reports to inspire community action and demonstrate transparency to partners.</li>
          </ul>
        </section>

        {/* Section 3 - PHOTO & MEDIA CONSENT */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} /> 3. Photography &amp; Social Media Policy
          </h2>
          <p>
            As detailed in our <Link href="/terms" style={{ fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</Link>, SER captures images and media during public activities to highlight community response efforts.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Photos and videos featuring volunteers may be displayed on SER&apos;s digital channels and marketing materials. We refrain from publishing sensitive personal details alongside photos without prior permission. Media depicting children is strictly regulated by our Child Protection Policy set out in Section 4 below.
          </p>
          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '1rem', fontSize: '0.95rem' }}>
            <strong>Opt-Out Rights:</strong> If you prefer not to have your photograph published on social media or our website, please notify our administrative team in writing at <a href="mailto:info@seresponse.org" style={{ fontWeight: 600 }}>info@seresponse.org</a> or inform event coordinators on site.
          </div>
        </section>

        {/* Section 4 - CHILD PROTECTION POLICY */}
        <section id="child-protection" style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HeartHandshake size={22} /> 4. Child Protection Policy &amp; Minors&apos; Media Privacy
          </h2>
          <p>
            Scouts Emergency Response is dedicated to protecting the rights, safety, and privacy of all children (individuals under 18 years of age) participating in our drills, youth trainings, and scouting operations. Under the <em>Kenya Children Act 2022</em>, the <em>Kenya Data Protection Act 2019</em>, and Scouting&apos;s <em>Safe from Harm</em> guidelines, we maintain the highest ethical standards regarding photographs and recordings of children:
          </p>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.05rem' }}>Ethical Standards for Children&apos;s Images &amp; Media:</h4>
            <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.95rem' }}>
              <li>
                <strong>Obtained Solely with Prior Permission:</strong> Visual media (photographs, videos, and audio) depicting any child is collected and published exclusively after securing explicit prior consent from a parent, legal guardian, or authorized scout/school authority.
              </li>
              <li>
                <strong>Ethical &amp; Dignified Portrayal:</strong> Children are portrayed respectfully, properly attired, and in constructive, educational situations—such as learning first aid, participating in safety drills, and engaging in youth leadership. We never publish images of children in distress, pain, vulnerable medical scenarios, or situations that could lead to ridicule or exploitation.
              </li>
              <li>
                <strong>Child Assent &amp; Right to Refuse:</strong> In addition to parental permission, the child is informed about the photo or video in an age-appropriate manner. If a child expresses reluctance or does not want their picture taken, their refusal is honored immediately without pressure.
              </li>
              <li>
                <strong>Identity &amp; Geolocation Concealment:</strong> To prevent online tracking or child exploitation, full names, home addresses, phone numbers, school locations, or GPS metadata are never published alongside photos of minors. Only first names and general troop designations may appear when appropriate.
              </li>
              <li>
                <strong>Right to Immediate Image Deletion:</strong> Parents, guardians, or children may request the immediate deletion and removal of any published photo or video from SER websites and social media at any time by contacting our team at <a href="mailto:info@seresponse.org" style={{ fontWeight: 600 }}>info@seresponse.org</a>.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 size={22} /> 5. Data Sharing &amp; Third-Party Disclosure
          </h2>
          <p>
            SER strictly respects your privacy. <strong>We do NOT sell, rent, or trade your personal information to commercial third parties.</strong>
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Data may only be shared under the following limited circumstances:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>With official disaster response authorities (e.g. Kenya Red Cross, National Disaster Management Unit) during active emergency deployments for operational safety.</li>
            <li>When required by law, legal process, or court order.</li>
            <li>With cloud service providers and database infrastructure partners operating under strict security and confidentiality agreements.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={22} /> 6. Data Security &amp; Storage
          </h2>
          <p>
            We implement administrative, technical, and physical safeguards to protect your personal data against unauthorised access, loss, or misuse. Access to volunteer databases is restricted strictly to authorised SER administrative personnel.
          </p>
        </section>

        {/* Section 7 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} /> 7. Your Rights &amp; Parental Rights
          </h2>
          <p>
            Under data protection law, you have the right to:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Access &amp; Review:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction &amp; Update:</strong> Update your registration details at any time via our <Link href="/update-details" style={{ fontWeight: 600, textDecoration: 'underline' }}>Update Details page</Link>.</li>
            <li><strong>Deletion / Deregistration:</strong> Request the removal or deletion of your profile from our active database.</li>
            <li><strong>Parental Rights:</strong> Parents and legal guardians possess full rights to inspect, update, or request deletion of personal information and photographs of their minor children held by SER.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section style={{ background: 'var(--bg-card, #ffffff)', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={22} /> 8. Contact Us
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, Child Protection standards, or wish to exercise your privacy rights, contact us at:
          </p>
          <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
            <p style={{ margin: '0 0 0.4rem 0' }}><strong>Scouts Emergency Response Privacy Officer</strong></p>
            <p style={{ margin: '0 0 0.4rem 0' }}>Email: <a href="mailto:info@seresponse.org">info@seresponse.org</a></p>
            <p style={{ margin: '0 0 0.4rem 0' }}>Child Safeguarding Inquiries: <a href="mailto:safeguarding@seresponse.org">safeguarding@seresponse.org</a> / <a href="mailto:info@seresponse.org">info@seresponse.org</a></p>
            <p style={{ margin: '0 0 0.4rem 0' }}>Phone / WhatsApp: <a href="https://wa.me/254742435314" target="_blank" rel="noopener noreferrer">+254 742 435 314</a></p>
          </div>
        </section>

      </div>

      {/* Footer Navigation CTA */}
      <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/terms" className="btn" style={{ padding: '0.75rem 1.75rem' }}>
          View Terms of Service
        </Link>
        <Link href="/community#join" className="btn" style={{ backgroundColor: '#64748b', borderColor: '#64748b', color: 'white', padding: '0.75rem 1.75rem' }}>
          Return to Join Form
        </Link>
      </div>
    </main>
  );
}
