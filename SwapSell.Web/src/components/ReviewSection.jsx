import React, { useState, useEffect } from 'react';
import api, { getCurrentUserId } from '../api';
import './ReviewSection.css';

const ReviewSection = ({ listingId, isSold }) => {
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchReviews();
    checkIfPurchased();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/listing/${listingId}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Yorumlar yüklenemedi', err);
    }
  };

  const checkIfPurchased = async () => {
    if (!currentUserId) return;
    try {
      const response = await api.get('/orders/my-purchases');
      const purchases = response.data;
      const boughtThis = purchases.some(p => p.listingId === parseInt(listingId));
      setHasPurchased(boughtThis);
    } catch (err) {
      console.error('Satın alma bilgisi kontrol edilemedi', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, { rating, comment });
        setEditingReviewId(null);
      } else {
        await api.post('/reviews', { listingId: parseInt(listingId), rating, comment });
      }
      setComment('');
      setRating(5);
      fetchReviews(); // Yorumları yenile
    } catch (err) {
      alert(err.response?.data || 'Yorum işlemi başarısız oldu.');
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        fetchReviews();
      } catch (err) {
        alert('Yorum silinemedi.');
      }
    }
  };

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment('');
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const hasAlreadyReviewed = reviews.some(r => r.reviewerId === currentUserId);

  return (
    <div className="review-section glass">
      <h3 className="section-title">
        Kullanıcı Değerlendirmeleri 
        {reviews.length > 0 && <span className="avg-rating"> ({averageRating} ⭐)</span>}
      </h3>

      {reviews.length === 0 ? (
        <p className="no-reviews">Henüz yorum yapılmamış.</p>
      ) : (
        <div className="review-list">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review.reviewerName}</strong>
                <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-footer">
                <small>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</small>
                {review.updatedAt && <small className="edited-tag"> (Düzenlendi)</small>}
                
                {/* Excel Acceptance Criteria 1: Sadece yorum sahibi görebilir */}
                {review.reviewerId === currentUserId && (
                  <div className="review-actions">
                    <button onClick={() => startEdit(review)} className="btn-small">Düzenle</button>
                    <button onClick={() => handleDelete(review.id)} className="btn-small btn-danger">Sil</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasPurchased && (!hasAlreadyReviewed || editingReviewId) && (
        <form onSubmit={handleSubmit} className="review-form">
          <h4>{editingReviewId ? 'Yorumunu Düzenle' : 'Ürünü Değerlendir'}</h4>
          <div className="form-group">
            <label>Puan (1-5)</label>
            <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
              <option value="5">5 - Mükemmel</option>
              <option value="4">4 - Çok İyi</option>
              <option value="3">3 - İdare Eder</option>
              <option value="2">2 - Kötü</option>
              <option value="1">1 - Çok Kötü</option>
            </select>
          </div>
          <div className="form-group">
            <label>Yorumunuz</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ürün hakkında ne düşünüyorsunuz?"
              required
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingReviewId ? 'Güncelle' : 'Gönder'}
            </button>
            {editingReviewId && (
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">İptal</button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewSection;
