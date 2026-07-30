'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EventCard({ event, isLive, googleCalUrl }) {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full w-full">
      {/* Top Image Block */}
      <div className="w-full h-48 bg-[#F4FBF6] relative border-b border-gray-100">
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
              onClick={() => setExpanded(!expanded)}
              className="text-[#15803d] text-[13px] mt-1.5 hover:text-[#166534] focus:outline-none transition-colors"
            >
              {expanded ? 'View Less' : 'View More'}
            </button>
          </div>
        )}

        {/* Divider */}
        <hr className="border-gray-100 my-5" />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <Link href="/contact" className="flex-1 text-center bg-[#15803d] hover:bg-[#166534] text-white py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors shadow-sm">
            Ask to Join
          </Link>
          
          <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-white hover:bg-gray-50 text-[#064e3b] border border-gray-300 py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors shadow-sm">
            Add to Calendar
          </a>
        </div>
        
        {event.meetLink && (
          <div className="mt-3">
             <a href={event.meetLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-[#4285F4] hover:bg-[#3367D6] text-white py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors shadow-sm">
              Join Google Meet
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
