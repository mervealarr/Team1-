import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './ReportModal.css';
import { submitReport } from '../api';

const ReportModal = ({ itemId, itemTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitReport(itemId, reason);
      alert(`Şikayetiniz başarıyla iletildi!`);
      setIsOpen(false);
      setReason('');
    } catch (error) {
      alert('Şikayet gönderilirken bir hata oluştu. Giriş yaptığınızdan emin olun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <div className="report-wrapper" style={{ width: '100%', marginTop: '0.5rem' }}>
      <button 
        className="btn btn-secondary btn-lg action-btn" 
        onClick={handleOpen}
        style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
      >
        🚨 İlanı Şikayet Et
      </button>

      {isOpen && createPortal(
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default ReportModal;