import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteContent } from '../../admin/actions';
import { ArrowLeft, Users, Briefcase, ChevronRight } from 'lucide-react';

function toSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function generateStaticParams() {
  const siteContent = await getSiteContent();
  const team = siteContent.about?.team || [];

  return team
    .filter((m) => m.name && m.name.trim() !== '' && m.name !== m.role)
    .map((member) => ({
      slug: toSlug(member.name),
    }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const siteContent = await getSiteContent();
  const team = siteContent.about?.team || [];
  const member = team.find(
    (m) => m.name && toSlug(m.name) === slug
  );

  if (!member) {
    return { title: 'Member Not Found' };
  }

  const title = `${member.name} — ${member.role}`;
  const description = `Meet ${member.name}, ${member.role} at Scouts Emergency Response (SER). Learn about their role in emergency preparedness and youth empowerment across Kenya.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/about/${slug}`,
      images: member.image
        ? [{ url: member.image, width: 600, height: 800, alt: member.name }]
        : [],
    },
    alternates: {
      canonical: `/about/${slug}`,
    },
  };
}

export default async function MemberProfilePage({ params }) {
  const { slug } = await params;
  const siteContent = await getSiteContent();
  const team = siteContent.about?.team || [];

  const sortedTeam = team
    .slice()
    .filter((m) => m.name && m.name.trim() !== '' && m.name !== m.role)
    .sort((a, b) => {
      const posA = a.position !== undefined && a.position !== '' ? Number(a.position) : 999;
      const posB = b.position !== undefined && b.position !== '' ? Number(b.position) : 999;
      return posA - posB;
    });

  const member = sortedTeam.find((m) => toSlug(m.name) === slug);

  if (!member) {
    notFound();
  }

  const otherMembers = sortedTeam.filter((m) => toSlug(m.name) !== slug);
  const initials = member.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Hero Section */}
      <section className="member-profile-hero">
        <div className="member-profile-hero__inner">
          <Link href="/about" className="member-profile-back">
            <ArrowLeft size={18} />
            <span>Back to About</span>
          </Link>

          <div className="member-profile-hero__content">
            <div className="member-profile-hero__photo-wrap">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="member-profile-hero__photo"
                />
              ) : (
                <div className="member-profile-hero__photo-placeholder">
                  <span>{initials}</span>
                </div>
              )}
              <div className="member-profile-hero__photo-ring" />
            </div>

            <div className="member-profile-hero__text">
              <span className="member-profile-hero__label">SER Team Member</span>
              <h1 className="member-profile-hero__name">{member.name}</h1>
              <p className="member-profile-hero__role">{member.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="member-profile-details">
        <div className="member-profile-details__grid">
          {/* Bio Card */}
          <div className="member-profile-card member-profile-card--bio">
            <div className="member-profile-card__icon">
              <Briefcase size={22} />
            </div>
            <h2>About {member.name.split(' ')[0]}</h2>
            {member.bio ? (
              <p>{member.bio}</p>
            ) : (
              <>
                <p>
                  {member.name} serves as the <strong>{member.role}</strong> at Scouts Emergency Response (SER).
                  As a dedicated member of the SER leadership team, {member.name.split(' ')[0]} plays a vital role
                  in empowering youth with emergency preparedness skills and building community resilience across Kenya.
                </p>
                <p>
                  Through their work in <em>{member.role.toLowerCase()}</em>, {member.name.split(' ')[0]} contributes
                  to SER&apos;s mission of equipping young people with practical life-saving skills and fostering a generation
                  of prepared, confident emergency responders.
                </p>
              </>
            )}
          </div>

          {/* Quick Facts Card */}
          <div className="member-profile-card member-profile-card--facts">
            <h3>Quick Facts</h3>
            <ul className="member-profile-facts">
              <li>
                <span className="member-profile-facts__label">Role</span>
                <span className="member-profile-facts__value">{member.role}</span>
              </li>
              <li>
                <span className="member-profile-facts__label">Organization</span>
                <span className="member-profile-facts__value">Scouts Emergency Response</span>
              </li>
              <li>
                <span className="member-profile-facts__label">Focus Area</span>
                <span className="member-profile-facts__value">{member.focusArea || 'Emergency Preparedness'}</span>
              </li>
              <li>
                <span className="member-profile-facts__label">Region</span>
                <span className="member-profile-facts__value">{member.region || 'Kenya'}</span>
              </li>
            </ul>
          </div>

          {/* Mission Card */}
          <div className="member-profile-card member-profile-card--mission">
            <h3>Our Mission</h3>
            <p>{siteContent.about?.mission}</p>
          </div>
        </div>
      </section>

      {/* Other Team Members */}
      {otherMembers.length > 0 && (
        <section className="member-profile-team-nav">
          <div className="member-profile-team-nav__header">
            <Users size={20} />
            <h2>Meet the Rest of the Team</h2>
          </div>
          <div className="member-profile-team-nav__grid">
            {otherMembers.map((other, idx) => (
              <Link
                key={idx}
                href={`/about/${toSlug(other.name)}`}
                className="member-profile-team-card"
              >
                <div className="member-profile-team-card__photo">
                  {other.image ? (
                    <img src={other.image} alt={other.name} />
                  ) : (
                    <div className="member-profile-team-card__initials">
                      {other.name
                        .split(' ')
                        .map((n) => n.charAt(0))
                        .join('')
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="member-profile-team-card__info">
                  <h4>{other.name}</h4>
                  <p>{other.role}</p>
                </div>
                <ChevronRight size={16} className="member-profile-team-card__arrow" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="member-profile-cta">
        <h2>Want to Join the Team?</h2>
        <p>
          Whether you&apos;re a Scout, volunteer, or community partner — there&apos;s a place for you in SER.
          Help us strengthen emergency preparedness across Kenya.
        </p>
        <div className="member-profile-cta__actions">
          <Link className="btn" href="/about">
            Meet the Full Team
          </Link>
          <Link className="btn btn-accent" href="/community#join">
            Join SER
          </Link>
        </div>
      </section>
    </>
  );
}
