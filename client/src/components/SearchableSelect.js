'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  id,
  name
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  const filteredOptions = options.filter((opt) => {
    const text = typeof opt.label === 'string' ? opt.label : (opt.textLabel || opt.value || '');
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value, type: 'select' } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className="searchable-select-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div
        id={id}
        onClick={toggleDropdown}
        className={`searchable-select-control ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      >
        <span className="searchable-select-value">
          {displayValue || placeholder}
        </span>
        <svg className="searchable-select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="searchable-select-menu">
          <div className="searchable-select-search-wrapper">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="searchable-select-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="searchable-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`searchable-select-option ${value === opt.value ? 'selected' : ''}`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="searchable-select-no-options">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
