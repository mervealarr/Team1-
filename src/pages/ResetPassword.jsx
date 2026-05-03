import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Geçersiz şifre sıfırlama bağlantısı.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        token, 
        newPassword: password 
      });
      setMessage(response.data.message);
      
      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Şifre sıfırlama başarısız. Linkin süresi dolmuş olabilir.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-container">
        <div className="auth-card glass" style={{ textAlign: 'center' }}>
          <h2 className="auth-title">Geçersiz Bağlantı</h2>
          <p className="auth-error" style={{ marginBottom: '1.5rem' }}>Eksik veya geçersiz bir şifre sıfırlama bağlantısı kullandınız.</p>
          <Link to="/forgot-password" className="btn btn-primary">Yeni Bağlantı İste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2 className="auth-title">Yeni Şifre Belirle</h2>
        <p className="auth-subtitle">Lütfen hesabınız için yeni bir şifre oluşturun.</p>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success" style={{ color: 'var(--success-color)', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '0.8rem', borderRadius: '8px' }}>{message}<br/><small>Giriş sayfasına yönlendiriliyorsunuz...</small></div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Yeni Şifre</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Şifreyi Onayla</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !!message}>
            {loading ? 'İşleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
