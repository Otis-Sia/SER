import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';

const iconMap = {
  'Facebook': <FaFacebook />,
  'Instagram': <FaInstagram />,
  'TikTok': <FaTiktok />,
  'YouTube': <FaYoutube />,
  'WhatsApp': <FaWhatsapp />
};

export default function SocialIcons({ osns = [], className = '', showText = false, direction = 'row' }) {
  if (!osns || osns.length === 0) return null;
  return (
    <div className={`social-icons ${className}`} style={{ display: 'flex', flexDirection: direction, gap: direction === 'row' ? '1rem' : '0.75rem' }}>
      {osns.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="social-icon-link"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}
        >
          <span style={{ fontSize: '1.5rem', display: 'flex' }}>{iconMap[link.name]}</span>
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
