'use client';

import { useRef } from 'react';

export default function InteractiveInfiniteScroll({ children }) {
  const trackRef = useRef(null);

  const handleMouseEnter = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleMouseLeave = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = 'running';
    }
  };

  return (
    <div
      className="marquee-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="marquee-track" ref={trackRef}>
        <div className="infinite-scroll-set">{children}</div>
        <div className="infinite-scroll-set" aria-hidden="true">{children}</div>
        <div className="infinite-scroll-set" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
