
import React, { useState } from 'react';
import './ReportModal.css';

const ReportModal = ({ itemId, itemTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleReportSubmit = (e) => {
    e.preventDefault();
    // Gerçek API bağlandığında buraya backend post isteği gelecek
    alert(`Şikayetiniz alındı! (İlan ID: ${itemId} - Sebep: ${reason})`);
    setIsOpen(false);
    setReason('');
  };

  const handleOpen = (e) => {
    e.stopPropagation(); // Altındaki karta tıklanmasını engeller
    setIsOpen(true);
  };

  return (
    <div className="report-wrapper">
      <button className="btn report-btn" onClick={handleOpen}>
        Şikayet Et
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>İlanı Şikayet Et</h3>
            <p className="modal-text">
              <strong>{itemTitle}</strong> başlıklı ilanı şikayet ediyorsunuz.
            </p>
            
            <form onSubmit={handleReportSubmit}>
              <select 
                className="modal-select"
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                required
              >
                <option value="" disabled>Lütfen bir sebep seçin</option>
                <option value="scam">Dolandırıcılık / Sahte İlan</option>
                <option value="prohibited">Yasaklı Ürün</option>
                <option value="spam">Spam / Tekrarlayan İlan</option>
                <option value="other">Diğer</option>
              </select>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn" style={{ background: '#ef4444', color: 'white' }}>
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportModal;