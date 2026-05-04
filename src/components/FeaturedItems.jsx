import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getCurrentUserId, getFavoriteIds, toggleFavorite } from '../api';
import ReportModal from './ReportModal';
import './FeaturedItems.css';

const FeaturedItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState([]);

  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings');
        setItems(response.data);

        if (currentUserId) {
          const favResponse = await getFavoriteIds();
          setFavoriteIds(favResponse);
        }
      } catch (err) {
        console.error("Ürünler yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUserId]);

  const handleToggleFavorite = async (e, listingId) => {
    e.stopPropagation();
    if (!currentUserId) {
      alert("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }
    
    try {
      const { isFavorite } = await toggleFavorite(listingId);
      if (isFavorite) {
        setFavoriteIds([...favoriteIds, listingId]);
      } else {
        setFavoriteIds(favoriteIds.filter(id => id !== listingId));
      }
    } catch (err) {
      console.error("Favori işlemi başarısız", err);
    }
  };

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();

    const matchTitle = (item.title || '').toLowerCase().includes(query);
    const matchDesc = (item.description || '').toLowerCase().includes(query);

    const matchesKeyword = matchTitle || matchDesc;

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  return (
    <section className="featured-section">
      <div className="section-header">
        <h2 className="section-title">Öne Çıkan Fırsatlar</h2>

        <div
          className="search-container"
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">Tümü (Kategori)</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Mobilya">Mobilya</option>
            <option value="Giyim">Giyim</option>
            <option value="Kitap">Kitap</option>
            <option value="Diğer">Diğer</option>
          </select>

          <input
            type="text"
            placeholder="Aramak için yazın..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate(
              `/listings?query=${encodeURIComponent(searchQuery)}`
            )
          }
        >
          Tümünü Gör
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}
        >
          Yükleniyor...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          Henüz hiç ilan yok. İlk ilanı sen ver!
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          No results found
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="item-card glass"
              onClick={() => navigate(`/listings/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="item-image-container"
                style={{ position: 'relative' }}
              >
                <img
                  src={
                    item.imageUrl ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={item.title}
                  className="item-image"
                />

                <span className="item-condition">İkinci El</span>

                {!item.isApproved && (
                  <span
                    style={{
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
                    }}
                  >
                    ⏳ Onay Bekliyor
                  </span>
                )}
              </div>

              <div className="item-details">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-price">{item.price} ₺</p>

                <div className="item-footer">
                  <div className="seller-info">
                    <div className="seller-avatar"></div>
                    <span className="seller-name">
                      {item.sellerEmail?.split('@')[0]}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}
                  >
                    {item.sellerId === currentUserId && (
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.8rem'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-listing/${item.id}`);
                        }}
                      >
                        Düzenle
                      </button>
                    )}

                    <button
                      className="action-btn"
                      onClick={(e) => handleToggleFavorite(e, item.id)}
                      style={{ color: favoriteIds.includes(item.id) ? 'red' : 'inherit' }}
                    >
                      {favoriteIds.includes(item.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedItems;