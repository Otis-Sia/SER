'use client';

import { useRef, useEffect } from 'react';

export default function InteractiveInfiniteScroll({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isAdjusting = false;

    const handleScroll = () => {
      if (isAdjusting) return;

      const { scrollLeft, scrollWidth } = container;
      const singleSetWidth = scrollWidth / 3;

      // If scrolled near the right edge of Set 2 (middle set), reset back by singleSetWidth
      if (scrollLeft >= singleSetWidth * 2) {
        isAdjusting = true;
        container.scrollLeft = scrollLeft - singleSetWidth;
        isAdjusting = false;
      } 
      // If scrolled near the left edge of Set 2 (middle set), reset forward by singleSetWidth
      else if (scrollLeft <= singleSetWidth * 0.5) {
        isAdjusting = true;
        container.scrollLeft = scrollLeft + singleSetWidth;
        isAdjusting = false;
      }
    };

    const initScroll = () => {
      if (container.scrollWidth > 0) {
        const singleSetWidth = container.scrollWidth / 3;
        container.scrollLeft = singleSetWidth;
      }
    };

    // Re-center when container sizes change
    const resizeObserver = new ResizeObserver(() => {
      initScroll();
    });

    resizeObserver.observe(container);
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize position
    const timer1 = setTimeout(initScroll, 50);
    const timer2 = setTimeout(initScroll, 300);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="interactive-infinite-scroll" ref={containerRef}>
      <div className="infinite-scroll-set">{children}</div>
      <div className="infinite-scroll-set">{children}</div>
      <div className="infinite-scroll-set">{children}</div>
    </div>
  );
}
