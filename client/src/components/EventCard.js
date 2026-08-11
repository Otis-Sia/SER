'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EventCard({ event, isLive, googleCalUrl, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format date to look like "30 JUL 2026"
  const rawDate = new Date(event.event_date);
  const formattedDate = rawDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Nairobi'
  }).toUpperCase();

  const formattedStartTime = rawDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi'
  });
  
  const rawEndDate = new Date(event.end_date);
  const formattedEndTime = rawEndDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi'
  });

  const imageSrc = event.imageUrl || "/assets/images/calendar-placeholder.svg";

  if (compact) {
    return (
      <div 
        className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 w-full" 
        style={{ display: 'flex', flexDirection: 'row', height: '160px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#ffffff' }}
      >
        {/* Left Thumbnail */}
        <div style={{ position: 'relative', width: '160px', height: '160px', minWidth: '160px', flexShrink: 0, backgroundColor: '#F4FBF6', borderRight: '1px solid #f3f4f6', padding: '6px' }}>
          <img src={imageSrc} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
          {isLive && (
            <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
              <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }}></span> LIVE
              </span>
            </div>
          )}
        </div>
        
        {/* Right Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1.25rem', lineHeight: '1.5', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0', paddingBottom: '8px' }} title={event.title}>{event.title}</h3>
          <div style={{ fontSize: '15px', lineHeight: '1.5', fontWeight: 'bold', color: '#15803d', margin: '0', paddingBottom: '4px' }}>{formattedDate}</div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 0 8px 0', paddingBottom: '4px' }}>{formattedStartTime} - {formattedEndTime}</div>
          
          <div style={{ marginTop: 'auto' }}>
            <Link href={`/events/${event.id}`} style={{ fontSize: '14px', fontWeight: '600', color: 'white', backgroundColor: '#15803d', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
              View Event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full w-full">
      {/* Top Image Block */}
      <div className="w-full h-48 bg-[#F4FBF6] relative border-b border-gray-100 overflow-hidden">
         <img src={imageSrc} alt={event.title} className="w-full h-full object-cover" />
         
         {/* Badge Overlay */}
         <div className="absolute top-4 left-4">
           {isLive ? (
             <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 tracking-wide">
               <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> LIVE NOW
             </span>
           ) : (
             <span className="bg-[#052e16] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase">
               UPCOMING
             </span>
           )}
         </div>
      </div>
      
      {/* Body Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Header Row: Title & Date/Time */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="text-[1.1rem] font-medium text-gray-800">{event.title}</h3>
          <div className="text-right whitespace-nowrap">
            <div className="text-sm font-bold text-gray-800">{formattedDate}</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{formattedStartTime} - {formattedEndTime}</div>
          </div>
        </div>

        {event.location && (
          <div className="text-[13px] text-gray-600 mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {event.location}
          </div>
        )}
        
        {/* Description Section */}
        {event.description && (
          <div className="mb-2 flex-grow">
            <div 
              className="text-gray-600 text-[14px] leading-relaxed break-words"
              style={{
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              dangerouslySetInnerHTML={{ __html: event.description }} 
            />
            <button 
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.25rem 0',
                color: 'var(--primary-color, #129a44)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '0.35rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                outline: 'none'
              }}
            >
              <span>{expanded ? 'View Less' : 'View More'}</span>
              <svg 
                width="14" 
                height="14" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.1)', margin: '1.25rem 0' }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={handleShare} 
            style={{
              flex: '1 1 130px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--primary-color, #129a44)',
              color: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(18, 154, 68, 0.25)',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
          >
            {copied ? (
              <>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 107.032-2.148 3 3 0 00-7.032 2.148m0 6.632a3 3 0 107.032 2.148 3 3 0 00-7.032-2.148"></path></svg>
                <span>Share Event</span>
              </>
            )}
          </button>
          
          <a 
            href={googleCalUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              flex: '1 1 130px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--background-color, #ffffff)',
              color: 'var(--text-color, #1f2937)',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: '1px solid rgba(0, 0, 0, 0.18)',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>Add to Calendar</span>
          </a>
        </div>
        
        {event.meetLink && (
          <div style={{ marginTop: '0.75rem' }}>
             <a 
               href={event.meetLink} 
               target="_blank" 
               rel="noopener noreferrer" 
               style={{
                 width: '100%',
                 display: 'inline-flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '0.4rem',
                 backgroundColor: '#4285F4',
                 color: '#ffffff',
                 padding: '0.65rem 1rem',
                 borderRadius: '8px',
                 fontSize: '0.875rem',
                 fontWeight: '600',
                 textDecoration: 'none',
                 transition: 'all 0.2s ease',
                 boxShadow: '0 2px 6px rgba(66, 133, 244, 0.25)',
                 boxSizing: 'border-box'
               }}
             >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span>Join Google Meet</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
