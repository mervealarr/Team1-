import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getCurrentUserId } from '../api';
import './Auth.css';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/listings/${id}`);
        const data = response.data;
        
        // Strict ownership check locally just to be safe
        const currentUserId = getCurrentUserId();
        if (data.sellerId !== currentUserId) {
          navigate('/');
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setCategory(data.category);
        setImageUrl(data.imageUrl);
      } catch (err) {
        setError('İlan bilgileri alınamadı veya bu sayfaya erişim yetkiniz yok.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await api.put(`/listings/${id}`, { 
        title, 
        description, 
        category,
        price: parseFloat(price),
        imageUrl,
        videoUrl
      });
      // Redirect back to listings or details page
      navigate(`/listings/${id}`);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Yetkiniz yok veya oturumunuzun süresi dolmuş.');
      } else {
        setError('İlan güncellenirken bir hata oluştu.');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>;

  return (
    <div className="auth-container">
      <div className="auth-card glass" style={{ maxWidth: '600px' }}>
        <h2 className="auth-title">İlanı Düzenle</h2>
        <p className="auth-subtitle">Mevcut ilanınızın bilgilerini güncelleyin.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleUpdate} className="auth-form">
          <div className="form-group">
            <label htmlFor="title">Ürün Başlığı</label>
            <input 
              type="text" 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
              maxLength="100"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Kategori</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                outline: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              <option value="" disabled>Kategori Seçin</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Mobilya">Mobilya</option>
              <option value="Giyim">Giyim</option>
              <option value="Kitap">Kitap</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Fiyat (₺)</label>
            <input 
              type="number" 
              id="price" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required 
              min="1"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Görsel Bağlantısı (URL)</label>
            <input 
              type="url" 
              id="imageUrl" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
              
          <div className="form-group">
            <label htmlFor="videoUrl">Video Bağlantısı (URL)</label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://... (mp4 formatı önerilir)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detaylı Açıklama</label>
            <textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
              rows="6"
              style={{
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
          
          
          <button type="submit" className="btn btn-primary btn-block">Değişiklikleri Kaydet</button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
