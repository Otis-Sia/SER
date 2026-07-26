'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EventCard({ event, isLive, startDateStr, startTimeStr, endTimeStr, durationStr, googleCalUrl }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`event-card ${isLive ? 'event-card-live' : ''}`}>
      <div className="event-card-header">
        <h3 className="event-card-title">
          {event.title}
          {isLive && (
            <span className="live-badge" title="This event is happening right now!">
              <span className="live-dot"></span> Live Now
            </span>
          )}
        </h3>
        <div className="event-card-meta">
          <strong>Date:</strong> <span>{startDateStr}</span>
        </div>
        <div className="event-card-meta">
          <strong>Time:</strong> <span>{startTimeStr} - {endTimeStr}{durationStr}</span>
        </div>
        {event.location && (
          <div className="event-card-meta">
            <strong>Venue:</strong> <span>{event.location}</span>
          </div>
        )}
      </div>
      
      <div className="event-card-body">
        {event.description && (
          <div>
            <div 
              style={{
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              dangerouslySetInnerHTML={{ __html: event.description }} 
            />
            <button 
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                cursor: 'pointer',
                padding: '8px 0 0 0',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              {expanded ? 'View Less' : 'View More...'}
            </button>
          </div>
        )}
      </div>

      <div className="event-card-actions">
        <Link className="btn" href="/contact">Ask to Join</Link>
        <a className="btn btn-accent" href={googleCalUrl} target="_blank" rel="noopener noreferrer">
          Add to Calendar
        </a>
        {event.meetLink && (
          <a className="btn" href={event.meetLink} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#4285F4', color: '#fff', borderColor: '#4285F4' }}>
            Join Google Meet
          </a>
        )}
      </div>
    </div>
  );
}
