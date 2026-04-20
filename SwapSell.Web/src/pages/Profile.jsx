import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount, parseJwt } from '../api';
import './Profile.css';

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const payload = parseJwt(token);
  const userEmail = payload?.email || payload?.Email || 'Bilinmiyor';

  const handleDeleteAccount = async () => {
    if (confirmText !== 'SİL') {
      setError('Lütfen onaylamak için "SİL" yazın.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteAccount();
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card glass">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="profile-title">Hesabım</h2>
          <p className="profile-subtitle">Hesap bilgilerinizi görüntüleyin ve yönetin</p>
        </div>

        {/* Account Info */}
        <div className="profile-info-section">
          <h3 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Hesap Bilgileri
          </h3>
          <div className="info-row">
            <span className="info-label">E-posta</span>
            <span className="info-value">{userEmail}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rol</span>
            <span className="info-value info-badge">Kullanıcı</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <h3 className="section-title danger-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Tehlikeli Bölge
          </h3>
          <p className="danger-description">
            Hesabınızı sildiğinizde tüm verileriniz, ilanlarınız ve bilgileriniz kalıcı olarak silinecektir.
            Bu işlem geri alınamaz.
          </p>
          <button 
            className="btn btn-danger" 
            id="delete-account-btn"
            onClick={() => setShowModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Hesabımı Sil
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="modal-title">Hesabınızı Silmek İstediğinize Emin Misiniz?</h3>
            <p className="modal-description">
              Bu işlem geri alınamaz. Tüm ilanlarınız, hesap bilgileriniz ve verileriniz kalıcı olarak silinecektir.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <div className="modal-confirm-input">
              <label htmlFor="confirm-delete">Onaylamak için <strong>"SİL"</strong> yazın:</label>
              <input 
                type="text" 
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='SİL'
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                id="cancel-delete-btn"
                onClick={() => { setShowModal(false); setConfirmText(''); setError(''); }}
              >
                Vazgeç
              </button>
              <button 
                className="btn btn-danger" 
                id="confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== 'SİL'}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Siliniyor...
                  </span>
                ) : (
                  'Evet, Hesabımı Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
