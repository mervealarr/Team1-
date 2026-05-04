import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId, getFavorites, toggleFavorite } from '../api';
import '../components/FeaturedItems.css';

const MyFavorites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        setItems(response);
      } catch (err) {
        console.error("Favoriler yüklenemedi", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError("Favorileriniz yüklenirken bir sorun oluştu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUserId, navigate]);

  const handleToggleFavorite = async (e, listingId) => {
    e.stopPropagation();
    try {
      const { isFavorite } = await toggleFavorite(listingId);
      if (!isFavorite) {
        // Eğer favorilerden çıkarıldıysa listeden kaldır
        setItems(items.filter(item => item.id !== listingId));
      }
    } catch (err) {
      console.error("Favori işlemi başarısız", err);
    }
  };

  return (
    <main
      className="main-content"
      style={{
        padding: '6rem 5% 2rem',
        minHeight: '80vh'
      }}
    >
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Favorilerim</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Yükleniyor...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Henüz favorilere eklediğiniz bir ilan bulunmuyor.
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className="item-card glass"
                onClick={() => navigate(`/listings/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="item-image-container">
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={item.title}
                    className="item-image"
                  />
                  <span className="item-condition">
                    {item.condition || 'İkinci El'}
                  </span>
                </div>

                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">{item.price} ₺</p>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}
                  >
                    📍 {item.location || 'Belirtilmemiş'}
                  </p>

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
                      <button
                        className="action-btn"
                        onClick={(e) => handleToggleFavorite(e, item.id)}
                        style={{ color: 'red' }}
                      >
                        ❤️
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

export default MyFavorites;
