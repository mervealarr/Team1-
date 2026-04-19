import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { getCurrentUserId } from '../api';
import '../components/FeaturedItems.css';

const Listings = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings');
        setItems(response.data);
      } catch (err) {
        console.error("Ürünler yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredItems = items.filter(item => {
    // Keyword match
    const q = queryParam.toLowerCase();
    const matchTitle = (item.title || '').toLowerCase().includes(q);
    const matchDesc = (item.description || '').toLowerCase().includes(q);
    const matchesKeyword = matchTitle || matchDesc;

    // Category match
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  return (
    <main className="main-content" style={{ padding: '6rem 5% 2rem', minHeight: '80vh' }}>
      <section className="featured-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title">Arama Sonuçları {queryParam && `"${queryParam}"`}</h2>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="All">Tümü (Kategori)</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Mobilya">Mobilya</option>
            <option value="Giyim">Giyim</option>
            <option value="Kitap">Kitap</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            Eşleşen ilan bulunamadı.
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="item-card glass" onClick={() => navigate(`/listings/${item.id}`)} style={{ cursor: 'pointer' }}>
                <div className="item-image-container">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"} alt={item.title} className="item-image" />
                  <span className="item-condition">İkinci El</span>
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">{item.price} ₺</p>
                  
                  <div className="item-footer">
                    <div className="seller-info">
                      <div className="seller-avatar"></div>
                      <span className="seller-name">{item.sellerEmail.split('@')[0]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {item.sellerId === currentUserId && (
                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/edit-listing/${item.id}`); }}>
                          Düzenle
                        </button>
                      )}
                      <button className="action-btn" onClick={(e) => { e.stopPropagation(); }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Listings;
