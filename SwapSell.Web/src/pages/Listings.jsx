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
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
    const q = queryParam.toLowerCase();

    const matchTitle = (item.title || '').toLowerCase().includes(q);
    const matchDesc = (item.description || '').toLowerCase().includes(q);
    const matchesKeyword = matchTitle || matchDesc;

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesCondition =
      selectedCondition === 'All' ||
      (item.condition || '').toLowerCase() === selectedCondition.toLowerCase();

    const matchesLocation =
      locationQuery === '' ||
      (item.location || '')
        .toLowerCase()
        .includes(locationQuery.toLowerCase());

    const itemPrice = Number(item.price) || 0;
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);

    const matchesMinPrice = min === null || itemPrice >= min;
    const matchesMaxPrice = max === null || itemPrice <= max;

    return (
      matchesKeyword &&
      matchesCategory &&
      matchesCondition &&
      matchesLocation &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  return (
    <main
      className="main-content"
      style={{
        padding: '6rem 5% 2rem',
        minHeight: '80vh'
      }}
    >
      <section className="featured-section">
        <div
          className="section-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <h2 className="section-title">
            Arama Sonuçları {queryParam && `"${queryParam}"`}
          </h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.8rem',
              width: '100%'
            }}
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                minWidth: '170px'
              }}
            >
              <option value="All">Kategori</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Mobilya">Mobilya</option>
              <option value="Giyim">Giyim</option>
              <option value="Kitap">Kitap</option>
              <option value="Diğer">Diğer</option>
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                minWidth: '170px'
              }}
            >
              <option value="All">Durum</option>
              <option value="Yeni">Yeni</option>
              <option value="Az Kullanılmış">Az Kullanılmış</option>
              <option value="İkinci El">İkinci El</option>
            </select>

            <input
              type="text"
              placeholder="Şehir / Konum"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                width: '180px'
              }}
            />

            <input
              type="number"
              placeholder="Min ₺"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                width: '120px'
              }}
            />

            <input
              type="number"
              placeholder="Max ₺"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                width: '120px'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Yükleniyor...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Eşleşen ilan bulunamadı.
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        ❤
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