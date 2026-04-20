import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: ''
  });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

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
        phoneNumber: res.data.phoneNumber || '',
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    try {
      await api.put('/user/profile', editForm);
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setSaveError(err.response.data.message);
      } else {
        setSaveError('Profil güncellenirken bir hata oluştu.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
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

  const getInitial = (name, email) => {
    if (name) return name.charAt(0).toUpperCase();
    return email ? email.charAt(0).toUpperCase() : '?';
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
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitial(profile.firstName, profile.email)}
        </div>

        {isEditing ? (
          <form className="profile-edit-form" onSubmit={handleSaveProfile}>
            {saveError && <div className="profile-error-message">{saveError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Ad</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Soyad</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Telefon Numarası</label>
              <input
                type="tel"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                placeholder="Örn: 0555 555 5555"
              />
            </div>
            <div className="form-group">
              <label>Hakkımda (Bio)</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                rows="3"
                placeholder="Kendinizden kısaca bahsedin..."
              />
            </div>
            <div className="profile-edit-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>İptal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </form>
        ) : (
          <div className="profile-info-wrapper">
            <div className="profile-info">
              <h1 className="profile-name">
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}` 
                  : profile.email.split('@')[0]}
              </h1>
              <div className="profile-email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                {profile.email}
              </div>
              {profile.phoneNumber && (
                <div className="profile-detail">
                  <span className="detail-icon">📱</span> {profile.phoneNumber}
                </div>
              )}
              {profile.bio && (
                <div className="profile-bio">
                  <p>{profile.bio}</p>
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

            <div className="profile-actions">
              <Link to="/create-listing" className="btn btn-primary">
                + Yeni İlan
              </Link>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Profili Düzenle
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Hesabı Sil
              </button>
            </div>
          </div>
        )}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Hesabı Silmek İstediğinize Emin Misiniz?</h3>
            <p className="modal-text">
              Bu işlem geri alınamaz. Hesabınız ve tüm ilanlarınız kalıcı olarak
              silinecektir.
            </p>
            <div className="modal-actions">
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
                disabled={deleting}
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
