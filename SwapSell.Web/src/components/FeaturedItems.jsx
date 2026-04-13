import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './FeaturedItems.css';

const FeaturedItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <section className="featured-section">
      <div className="section-header">
        <h2 className="section-title">Öne Çıkan Fırsatlar</h2>
        <button className="btn btn-secondary">Tümünü Gör</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
          Henüz hiç ilan yok. İlk ilanı sen ver!
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card glass" onClick={() => navigate(`/listings/${item.id}`)} style={{ cursor: 'pointer' }}>
              <div className="item-image-container">
                {/* Fallback placeholder image initially since uploading isn't implemented */}
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
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); /* Favoriye Ekle mock */ }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
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
