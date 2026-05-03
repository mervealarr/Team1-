import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseJwt } from '../utils';
import { getAllUsers, adminDeleteUser, adminDeleteListing, getAdminListings, moderateListing } from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const payload = parseJwt(token);
    const role = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload?.role;
    
    if (role === 'Admin') {
      setIsAdmin(true);
      fetchData();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both users and listings
      const [usersRes, listingsRes] = await Promise.all([
        getAllUsers(),
        getAdminListings()
      ]);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
    } catch (err) {
      console.error(err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı ve ona ait tüm ilanları silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await adminDeleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      // Optionally re-fetch listings as deleting a user might delete their listings
      fetchData();
    } catch (err) {
      alert('Kullanıcı silinemedi.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await adminDeleteListing(listingId);
      setListings(listings.filter(l => l.id !== listingId));
    } catch (err) {
      alert('İlan silinemedi.');
    }
  };

  const handleModerateListing = async (listingId, isApproved) => {
    try {
      await moderateListing(listingId, isApproved);
      setListings(listings.map(l => l.id === listingId ? { ...l, isApproved } : l));
    } catch (err) {
      alert('İlan durumu güncellenemedi.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="container" style={{ padding: '4rem 5%', minHeight: '80vh' }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Hoşgeldiniz, Admin! Bu sayfa sadece admin yetkisi olan kullanıcılara özeldir.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          Kullanıcı Yönetimi
        </button>
        <button 
          className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('listings')}
        >
          İlan Yönetimi
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Yükleniyor...</div>
      ) : error ? (
        <div className="auth-error">{error}</div>
      ) : (
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', overflowX: 'auto' }}>
          {activeTab === 'users' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Sistem Kullanıcıları ({users.length})</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>E-posta</th>
                    <th style={{ padding: '1rem' }}>Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>{user.id}</td>
                      <td style={{ padding: '1rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.85rem',
                          backgroundColor: user.role === 'Admin' ? 'var(--primary-color)' : 'var(--bg-secondary)',
                          color: user.role === 'Admin' ? 'white' : 'var(--text-primary)'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {user.role !== 'Admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ 
                              background: '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '0.5rem',
                              cursor: 'pointer'
                            }}
                          >
                            Sil
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Kullanıcı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'listings' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Sistemdeki İlanlar ({listings.length})</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Görsel</th>
                    <th style={{ padding: '1rem' }}>Başlık</th>
                    <th style={{ padding: '1rem' }}>Fiyat</th>
                    <th style={{ padding: '1rem' }}>Kategori</th>
                    <th style={{ padding: '1rem' }}>Satıcı</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Durum</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(listing => (
                    <tr key={listing.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>{listing.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <img 
                          src={listing.imageUrl || 'https://via.placeholder.com/50'} 
                          alt={listing.title} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{listing.title}</td>
                      <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                        {listing.price.toLocaleString('tr-TR')} ₺
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                          {listing.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {listing.sellerEmail || `Kullanıcı #${listing.sellerId}`}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.85rem',
                          backgroundColor: listing.isApproved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: listing.isApproved ? '#16a34a' : '#ca8a04'
                        }}>
                          {listing.isApproved ? 'Onaylı' : 'Bekliyor'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {listing.isApproved ? (
                          <button 
                            onClick={() => handleModerateListing(listing.id, false)}
                            style={{ 
                              background: '#ca8a04', 
                              color: 'white', 
                              border: 'none', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              marginRight: '0.5rem'
                            }}
                          >
                            Gizle
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleModerateListing(listing.id, true)}
                            style={{ 
                              background: '#16a34a', 
                              color: 'white', 
                              border: 'none', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              marginRight: '0.5rem'
                            }}
                          >
                            Onayla
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteListing(listing.id)}
                          style={{ 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                  {listings.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        İlan bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
