import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getCurrentUserId } from '../api';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/listings/${id}`);
        setProduct(response.data);

        const currentUserId = getCurrentUserId();
        if (currentUserId && Number(currentUserId) === Number(response.data.sellerId)) {
          setIsOwner(true);
        }
      } catch (err) {
        setError('Ürün detayları yüklenemedi veya ürün bulunamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) return <div className="loading-container">Yükleniyor...</div>;
  if (error) return <div className="error-container glass">{error}</div>;
  if (!product) return null;

  const handleDelete = async () => {
    if (window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/listings/${id}`);
        navigate('/');
      } catch (err) {
        alert('İlan silinirken bir hata oluştu.');
      }
    }
  };

  const handleContactSeller = () => {
    navigate(`/inbox?receiverId=${product.sellerId}&listingId=${product.id}`);
  };

  return (
    <div className="product-details-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        ← Geri Dön
      </button>

      <div className="product-grid">
        <div className="product-image-side glass" style={{ position: 'relative' }}>
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
            alt={product.title}
            className="product-main-image"
            style={{ opacity: product.isApproved ? 1 : 0.7 }}
          />
          {!product.isApproved && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(234, 179, 8, 0.95)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              ⏳ Bu ilan henüz onaylanmamıştır
            </div>
          )}
        </div>

        <div className="product-info-side glass">
          <div className="product-header">
            <h1 className="product-title">{product.title}</h1>
            <p className="product-price">{product.price} ₺</p>
          </div>

          <div className="product-seller-info">
            <div className="seller-avatar"></div>
            <div className="seller-details">
              <p className="seller-label">Satıcı</p>
              <p className="seller-email">{product.sellerEmail}</p>
            </div>
          </div>

          <div className="product-description-container">
            <h3 className="section-title">Ürün Açıklaması</h3>
            <p className="product-description">{product.description}</p>
          </div>

          <div className="product-actions">
            {isOwner ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => navigate(`/edit-listing/${product.id}`)} className="btn action-btn btn-secondary">
                  İlanı Düzenle
                </button>
                <button onClick={handleDelete} className="btn action-btn" style={{ background: 'var(--error)', color: 'white' }}>
                  İlanı Sil
                </button>
              </div>
            ) : (
              <>
                <button onClick={handleContactSeller} className="btn btn-primary btn-lg action-btn">
                  İlan Sahibiyle İletişime Geç
                </button>
                <button className="btn btn-secondary btn-lg action-btn">
                  Favorilere Ekle
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;