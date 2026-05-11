import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getCurrentUserId } from '../api';
import ReviewSection from '../components/ReviewSection';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setProduct(response.data);
      
      // Check ownership
      const currentUserId = getCurrentUserId();
      if (currentUserId && currentUserId === response.data.sellerId) {
          setIsOwner(true);
      }
    } catch (err) {
      setError('Ürün detayları yüklenemedi veya ürün bulunamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleBuyNow = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      alert("Satın almak için giriş yapmalısınız.");
      return navigate('/login');
    }
    
    if (window.confirm('Bu ürünü satın almak istediğinize emin misiniz?')) {
      setIsPurchasing(true);
      try {
        await api.post('/orders', { listingId: product.id, orderType: 'DirectBuy' });
        alert('Satın alma başarılı!');
        fetchProductDetails(); // isSold durumunu güncellemek için sayfayı yenile
      } catch (err) {
        alert(err.response?.data || 'Satın alma işlemi başarısız oldu.');
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  const handleSendMessage = () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      alert("Mesaj göndermek için giriş yapmalısınız.");
      return navigate('/login');
    }
    setIsMessageModalOpen(true);
  };

  const submitMessage = () => {
    if (messageText && messageText.trim() !== "") {
        alert("Mesajınız satıcıya başarıyla iletildi!\n\nMesaj: " + messageText);
        setIsMessageModalOpen(false);
        setMessageText('');
    }
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageText('');
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
          {product.isSold && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: '#10b981',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              zIndex: 10
            }}>
              ✅ SATILDI
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
            <p className="product-description">
              {product.description}
            </p>
          </div>

          <div className="product-actions">
            {product.isSold ? (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                    Bu ürün satın alınmıştır ve artık satışta değildir.
                </div>
            ) : isOwner ? (
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
                    <button onClick={handleBuyNow} disabled={isPurchasing} className="btn btn-primary btn-lg action-btn" style={{ background: '#10b981', color: 'white' }}>
                        {isPurchasing ? 'İşleniyor...' : 'Hemen Satın Al'}
                    </button>
                    <button onClick={handleSendMessage} className="btn btn-secondary btn-lg action-btn">Satıcıya Mesaj Gönder</button>
                </>
            )}
          </div>
        </div>
      </div>
      
      {/* Yorumlar Bölümü */}
      <ReviewSection listingId={id} isSold={product.isSold} />
      
      {/* Özel Mesaj Gönderme Modalı */}
      {isMessageModalOpen && (
        <div className="message-modal-overlay">
          <div className="message-modal glass">
            <h3>Satıcıya Mesaj Gönder</h3>
            <p>Ürün hakkında sormak istediklerinizi veya teklifinizi yazın:</p>
            <textarea 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Örn: En son ne kadar olur?"
              rows="4"
              autoFocus
            />
            <div className="message-modal-actions">
              <button onClick={closeMessageModal} className="btn btn-secondary">İptal</button>
              <button onClick={submitMessage} className="btn btn-primary" style={{background: 'var(--primary)', color: 'white'}}>Gönder</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ProductDetails;
