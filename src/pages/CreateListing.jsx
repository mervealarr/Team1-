import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

const CreateListing = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('İkinci El');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/listings', {
        title,
        description,
        category,
        location,
        condition,
        price: parseFloat(price),
        imageUrl
      });

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
            <label htmlFor="location">Konum / Şehir</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Örn: İstanbul"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="condition">Ürün Durumu</label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="Yeni">Yeni</option>
              <option value="Az Kullanılmış">Az Kullanılmış</option>
              <option value="İkinci El">İkinci El</option>
            </select>
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

          <button type="submit" className="btn btn-primary btn-block">
            İlanı Yayınla
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;