import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';

export const socialLinks = [
  { name: 'Facebook', handle: '@scoutsemergencyresponse', url: 'https://facebook.com/scoutsemergencyresponse', icon: <FaFacebook /> },
  { name: 'Instagram', handle: '@scoutsemergencyresponse', url: 'https://instagram.com/scoutsemergencyresponse', icon: <FaInstagram /> },
  { name: 'TikTok', handle: '@scoutsemergencyresponse', url: 'https://tiktok.com/@scoutsemergencyresponse', icon: <FaTiktok /> },
  { name: 'YouTube', handle: '@scoutsemergencyresponse', url: 'https://youtube.com/@scoutsemergencyresponse', icon: <FaYoutube /> },
];

export default function SocialIcons({ className = '', showText = false, direction = 'row' }) {
  return (
    <div className={`social-icons ${className}`} style={{ display: 'flex', flexDirection: direction, gap: direction === 'row' ? '1rem' : '0.75rem' }}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="social-icon-link"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}
        >
          <span style={{ fontSize: '1.5rem', display: 'flex' }}>{link.icon}</span>
          {showText && (
            <span>
              {link.name}: <strong>{link.handle}</strong>
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
