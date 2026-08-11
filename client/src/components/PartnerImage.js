"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function PartnerImage({ src, alt }) {
  const [error, setError] = useState(false);

  if (error || !src) return null;

  return (
    <Image
      src={src}
      alt={alt || "Partner logo"}
      width={160}
      height={80}
      quality={75}
      sizes="(max-width: 768px) 120px, 160px"
      style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
      onError={() => setError(true)}
    />
  );
}
