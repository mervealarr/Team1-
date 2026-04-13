import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css'; // using same styles as auth forms

const CreateListing = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/listings', { 
        title, 
        description, 
        price: parseFloat(price),
        imageUrl
      });
      // Redirect to the newly created product details
      if (response.data && response.data.id) {
        navigate(`/listings/${response.data.id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.');
      } else {
        setError('Ürün yüklenirken bir hata oluştu.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass" style={{ maxWidth: '600px' }}>
        <h2 className="auth-title">Yeni İlan Ekle</h2>
        <p className="auth-subtitle">Ürününüzü binlerce alıcıyla buluşturun.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleCreate} className="auth-form">
          <div className="form-group">
            <label htmlFor="title">Ürün Başlığı</label>
            <input 
              type="text" 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: iPhone 13 Pro Max - Kusursuz"
              required 
              maxLength="100"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Fiyat (₺)</label>
            <input 
              type="number" 
              id="price" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Örn: 35000"
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
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detaylı Açıklama</label>
            <textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ürününüzün durumunu, özelliklerini ve varsa kusurlarını belirtin."
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
          
          <button type="submit" className="btn btn-primary btn-block">İlanı Yayınla</button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
