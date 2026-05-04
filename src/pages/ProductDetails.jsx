import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getCurrentUserId, getFavoriteIds, toggleFavorite } from '../api';
import './ProductDetails.css';
import ShareComponent from '../components/ShareComponent';
import ReportModal from '../components/ReportModal';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/listings/${id}`);
        setProduct(response.data);

        const currentUserId = getCurrentUserId();
        if (currentUserId && Number(currentUserId) === Number(response.data.sellerId)) {
          setIsOwner(true);
        }

        if (currentUserId) {
          try {
            const favIds = await getFavoriteIds();
            if (favIds.includes(Number(id))) {
              setIsFavorite(true);
            }
          } catch (favErr) {
            console.warn("Favoriler çekilirken hata oluştu, oturum süresi dolmuş olabilir.", favErr);
            localStorage.removeItem('token');
          }
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

  const handleToggleFavorite = async () => {
    if (!currentUserId) {
      alert("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }
    try {
      const response = await toggleFavorite(id);
      setIsFavorite(response.isFavorite);
    } catch (err) {
      console.error("Favori işlemi başarısız", err);
    }
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
          <div className="product-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="product-title">{product.title}</h1>
              <p className="product-price">{product.price} ₺</p>
            </div>
            <ShareComponent listingId={product.id} />
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

          {/* Ürün Açıklamasının Hemen Altına Video Ekliyoruz */}
          {product.videoUrl && (
            <div className="product-video-container" style={{ marginTop: '2rem' }}>
              <h3 className="section-title">Ürün Tanıtım Videosu</h3>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <video 
                  src={product.videoUrl} 
                  controls 
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block' }}
                >
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              </div>
            </div>
          )}

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
                <button 
                  onClick={handleToggleFavorite} 
                  className="btn btn-secondary btn-lg action-btn"
                  style={{ color: isFavorite ? 'red' : 'inherit' }}
                >
                  {isFavorite ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
                </button>

                {/* YENİ EKLENEN PBI: ŞİKAYET BUTONU */}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <ReportModal itemId={product.id} itemTitle={product.title} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;