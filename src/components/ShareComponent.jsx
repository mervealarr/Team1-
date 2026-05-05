import React, { useState, useRef, useEffect } from 'react';
import './ShareComponent.css';

const ShareComponent = ({ listingId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Generate the shareable URL dynamically based on the current domain
  const shareUrl = `${window.location.origin}/listings/${listingId}`;
  const encodedUrl = encodeURIComponent(shareUrl);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setCopied(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodedUrl}`, '_blank');
    setIsOpen(false);
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="share-container" ref={dropdownRef}>
      <button className="btn btn-secondary share-btn" onClick={toggleDropdown}>
        🔗 Paylaş
      </button>
      
      {isOpen && (
        <div className="share-dropdown glass">
          <button className="share-option whatsapp" onClick={handleWhatsApp}>
            📱 WhatsApp'ta Paylaş
          </button>
          <button className="share-option facebook" onClick={handleFacebook}>
            📘 Facebook'ta Paylaş
          </button>
          <button className="share-option copy" onClick={handleCopyLink}>
            📋 {copied ? 'Bağlantı Kopyalandı!' : 'Bağlantıyı Kopyala'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareComponent;
