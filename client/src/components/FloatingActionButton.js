"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, UserPlus, HelpCircle, Plus, X } from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fab-container ${isOpen ? 'active' : ''}`}>
      <div className="fab-menu">
        <Link href="/contact" className="fab-item" title="Contact Us">
          <Mail size={20} />
          <span className="fab-label">Contact</span>
        </Link>
        <Link href="/join" className="fab-item" title="Join Us">
          <UserPlus size={20} />
          <span className="fab-label">Join</span>
        </Link>
        <Link href="/faq" className="fab-item" title="FAQ">
          <HelpCircle size={20} />
          <span className="fab-label">FAQ</span>
        </Link>
      </div>
      <button className="fab-main-btn" onClick={toggleMenu} aria-label="Toggle menu">
        {isOpen ? <X size={28} /> : <Plus size={28} />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
