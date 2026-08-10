"use client";

import { useState } from 'react';

export default function PartnerImage({ src, alt }) {
  const [error, setError] = useState(false);

  if (error || !src) return null;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
