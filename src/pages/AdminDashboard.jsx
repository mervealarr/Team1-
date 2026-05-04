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


  const [searchTerm, setSearchTerm] = useState('');
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

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
      const [usersRes, listingsRes] = await Promise.all([
        getAllUsers(),
        getAdminListings()
      ]);
      setUsers(usersRes.data || []);
      setListings(listingsRes.data || []);


      const pendingCount = listingsRes.data?.filter(l => !l.isApproved).length || 0;
      setPendingReportsCount(pendingCount);

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
      // Durum değiştiğinde istatistiği güncelle
      setPendingReportsCount(prev => isApproved ? prev - 1 : prev + 1);
    } catch (err) {
      alert('İlan durumu güncellenemedi.');
    }
  };


  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toString().includes(searchTerm)
  );

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.id.toString().includes(searchTerm)
  );

  if (!isAdmin) return null;

  return (
    <div className="container" style={{ padding: '6rem 5% 4rem', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        Sistem genelindeki kullanıcı, ilan ve rapor yönetim merkezi.
      </p>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="stat-card glass" style={{ padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{users.length}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Toplam Kullanıcı</div>
        </div>
        <div className="stat-card glass" style={{ padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{listings.filter(l => l.isApproved).length}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Aktif İlanlar</div>
        </div>
        <div className="stat-card glass" style={{ padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{pendingReportsCount}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Bekleyen İşlemler</div>
        </div>
      </div>


      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <input
          type="text"
          placeholder={`${activeTab === 'users' ? 'Kullanıcı e-posta veya ID' : 'İlan başlığı veya kategori'} ara...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '1.2rem 1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: 'white',
            fontSize: '1rem',
            outline: 'none',
            backdropFilter: 'blur(10px)'
          }}
        />
        <span style={{ position: 'absolute', right: '1.5rem', top: '1.2rem', opacity: 0.5 }}>🔍</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
        >
          Kullanıcı Yönetimi
        </button>
        <button
          className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('listings'); setSearchTerm(''); }}
        >
          İlan Yönetimi
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Veriler senkronize ediliyor...</p>
        </div>
      ) : error ? (
        <div className="auth-error" style={{ padding: '2rem', textAlign: 'center' }}>{error}</div>
      ) : (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', overflowX: 'auto' }}>

          {/* KULLANICI TABLOSU */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Sistem Kullanıcıları ({filteredUsers.length})</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.7 }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>E-posta</th>
                    <th style={{ padding: '1rem' }}>Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }} className="table-row-hover">
                      <td style={{ padding: '1rem' }}>{user.id}</td>
                      <td style={{ padding: '1rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '2rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: user.role === 'Admin' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                          color: 'white'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {user.role !== 'Admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: '500' }}
                          >
                            Sil
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {activeTab === 'listings' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Sistemdeki İlanlar ({filteredListings.length})</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.7 }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Görsel</th>
                    <th style={{ padding: '1rem' }}>Başlık</th>
                    <th style={{ padding: '1rem' }}>Fiyat</th>
                    <th style={{ padding: '1rem' }}>Kategori</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Durum</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map(listing => (
                    <tr key={listing.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{listing.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <img
                          src={listing.imageUrl || 'https://via.placeholder.com/50'}
                          alt={listing.title}
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.title}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                        {listing.price.toLocaleString('tr-TR')} ₺
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>{listing.category}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.3rem 0.7rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: listing.isApproved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          color: listing.isApproved ? '#22c55e' : '#eab308'
                        }}>
                          {listing.isApproved ? 'Yayında' : 'Beklemede'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleModerateListing(listing.id, !listing.isApproved)}
                          style={{
                            background: listing.isApproved ? '#ca8a04' : '#16a34a',
                            color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.85rem'
                          }}
                        >
                          {listing.isApproved ? 'Gizle' : 'Onayla'}
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {((activeTab === 'users' && filteredUsers.length === 0) || (activeTab === 'listings' && filteredListings.length === 0)) && (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
              🔍 Arama kriterlerine uygun sonuç bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;