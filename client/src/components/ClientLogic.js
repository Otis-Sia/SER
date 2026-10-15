'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientLogic() {
  const pathname = usePathname();

  useEffect(() => {
    // 5. ANIMATIONS (main.js)
    const revealElements = document.querySelectorAll("main section:not(.gallery-section):not(#gallery), .image-card, .highlight-card, .product-card, .team-card");
    if (revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });

      revealElements.forEach((el) => {
        el.classList.add("reveal");
        revealObserver.observe(el);
      });
      
      return () => {
        revealElements.forEach((el) => {
          revealObserver.unobserve(el);
        });
      }
    }
  }, [pathname]);

  return null;
}
