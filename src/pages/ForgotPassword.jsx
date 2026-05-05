import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(''); // Only for local testing

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    setResetToken('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      
      // For local testing: if the API returns a reset token, show a button to navigate
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2 className="auth-title">Şifremi Unuttum</h2>
        <p className="auth-subtitle">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success" style={{ color: 'var(--success-color)', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '0.8rem', borderRadius: '8px' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
          </button>
        </form>

        {resetToken && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid var(--warning-color)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: 'var(--warning-color)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Geliştirici Modu:</strong> E-posta servisi olmadığı için sıfırlama linki aşağıdadır.
            </p>
            <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`} className="btn btn-secondary btn-block" style={{ marginTop: '0.5rem' }}>
              Şifreyi Sıfırla (Test)
            </Link>
          </div>
        )}
        
        <div className="auth-footer">
          <Link to="/login" className="auth-link">Giriş sayfasına dön</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
