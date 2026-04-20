import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { updateProfile } from '../api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/profile');
      setProfile(res.data);
      setEditForm({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        phone: res.data.phone || '',
        bio: res.data.bio || ''
      });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      await updateProfile(editForm);
      await fetchProfile(); // refresh data
      setIsEditing(false);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      // We could pass the reasons to the backend here if the API supported it
      // const payload = { reasons: deleteReasons, otherText: deleteReasons.includes('other') ? otherReasonText : '' };
      await api.delete('/user/delete');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    } catch (err) {
      setError('Hesap silinirken bir hata oluştu.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  const toggleReason = (reasonId) => {
    if (deleteReasons.includes(reasonId)) {
      setDeleteReasons(deleteReasons.filter(r => r !== reasonId));
    } else {
      setDeleteReasons([...deleteReasons, reasonId]);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p className="profile-loading-text">Profil yükleniyor...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-error">
        <div className="profile-error-icon">⚠️</div>
        <p className="profile-error-text">{error}</p>
        <button className="btn btn-primary" onClick={() => fetchProfile()}>
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header" style={{ alignItems: isEditing ? 'flex-start' : 'center' }}>
        <div className="profile-avatar">
          {getInitial(profile.firstName || profile.email)}
        </div>

        {isEditing ? (
          <form className="profile-edit-form" onSubmit={handleUpdateProfile} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Profili Düzenle</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Ad</label>
                <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} placeholder="Adınız" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Soyad</label>
                <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} placeholder="Soyadınız" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Telefon</label>
              <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="05XX XXX XX XX" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Hakkımda</label>
              <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Kendinizden bahsedin..." rows="3" style={{ resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={updateLoading}>İptal</button>
              <button type="submit" className="btn btn-primary" disabled={updateLoading}>{updateLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h1 className="profile-name">
              {profile.firstName || profile.lastName 
                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() 
                : profile.email.split('@')[0]}
            </h1>
            
            {profile.bio && <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0.75rem 0', fontSize: '0.95rem' }}>{profile.bio}</p>}
            
            <div className="profile-email" style={{ marginBottom: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              {profile.email}
            </div>

            {profile.phone && (
              <div className="profile-email" style={{ marginBottom: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {profile.phone}
              </div>
            )}

            <div className="profile-badges">
              <span className="profile-badge badge-role">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {profile.role === 'Admin' ? 'Yönetici' : 'Kullanıcı'}
              </span>
              <span className="profile-badge badge-listings">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
                {profile.totalListings} İlan
              </span>
            </div>
          </div>
        )}

        <div className="profile-actions" style={{ alignSelf: 'flex-start' }}>
          {!isEditing && (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              ✏️ Düzenle
            </button>
          )}
          <Link to="/create-listing" className="btn btn-primary">
            + Yeni İlan
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Hesabı Sil
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{profile.totalListings}</div>
          <div className="stat-label">Toplam İlan</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {profile.listings.length > 0
              ? formatPrice(
                  profile.listings.reduce((sum, l) => sum + l.price, 0) /
                    profile.listings.length
                )
              : '₺0'}
          </div>
          <div className="stat-label">Ortalama Fiyat</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {profile.listings.length > 0
              ? new Set(profile.listings.map((l) => l.category)).size
              : 0}
          </div>
          <div className="stat-label">Kategori</div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="profile-listings">
        <div className="profile-section-header">
          <h2 className="profile-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            İlanlarım
          </h2>
          <Link to="/create-listing" className="btn btn-secondary">
            + İlan Ekle
          </Link>
        </div>

        {profile.listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">Henüz ilanınız yok</h3>
            <p className="empty-state-text">
              İlk ilanınızı oluşturarak satışa başlayın!
            </p>
            <Link to="/create-listing" className="btn btn-primary">
              İlk İlanı Oluştur
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {profile.listings.map((listing) => (
              <div
                key={listing.id}
                className="listing-card"
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                <div className="listing-card-image">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} />
                  ) : (
                    <div className="listing-card-placeholder">🛍️</div>
                  )}
                  <span className="listing-card-category">
                    {listing.category}
                  </span>
                  {!listing.isApproved && (
                    <span style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(234, 179, 8, 0.95)',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 10
                    }}>
                      ⏳ Onay Bekliyor
                    </span>
                  )}
                </div>

                <div className="listing-card-body">
                  <h3 className="listing-card-title">{listing.title}</h3>
                  <p className="listing-card-desc">{listing.description}</p>
                  <div className="listing-card-footer">
                    <span className="listing-card-price">
                      {formatPrice(listing.price)}
                    </span>
                    <span className="listing-card-date">
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>
                </div>

                <div
                  className="listing-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to={`/edit-listing/${listing.id}`}
                    className="btn btn-secondary"
                  >
                    ✏️ Düzenle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'left' }}>
            <div className="modal-icon" style={{ textAlign: 'center' }}>🗑️</div>
            <h3 className="modal-title" style={{ textAlign: 'center' }}>Hesabı Silmek İstediğinize Emin Misiniz?</h3>
            <p className="modal-text" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              Bu işlem geri alınamaz. Hesabınız ve tüm ilanlarınız kalıcı olarak
              silinecektir. Lütfen hesabınızı neden silmek istediğinizi belirtin:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={deleteReasons.includes('reason1')}
                  onChange={() => toggleReason('reason1')}
                />
                Uygulamayı artık kullanmıyorum
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={deleteReasons.includes('reason2')}
                  onChange={() => toggleReason('reason2')}
                />
                Aradığım ürünleri bulamadım
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={deleteReasons.includes('reason3')}
                  onChange={() => toggleReason('reason3')}
                />
                İstediğim fiyata satış yapamadım
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={deleteReasons.includes('reason4')}
                  onChange={() => toggleReason('reason4')}
                />
                Gizlilik veya güvenlik endişelerim var
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={deleteReasons.includes('other')}
                  onChange={() => toggleReason('other')}
                />
                Diğer
              </label>
              
              {deleteReasons.includes('other') && (
                <textarea 
                  placeholder="Lütfen nedeninizi kısaca açıklayın..."
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              )}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                İptal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleting || (deleteReasons.length === 0)}
              >
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
