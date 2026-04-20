import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils';
import './Auth.css'; // Shared CSS for Login and Register

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        const payload = parseJwt(response.data.token);
        const role = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload?.role;
        
        // also could store user info
        window.dispatchEvent(new Event('auth-change'));

        if (role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2 className="auth-title">Hesabınıza Giriş Yapın</h2>
        <p className="auth-subtitle">Tekrar hoş geldiniz! İlanlara göz atmaya devam edin.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleLogin} className="auth-form">
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
          
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">Giriş Yap</button>
        </form>
        
        <div className="auth-footer">
          Hesabınız yok mu? <Link to="/register" className="auth-link">Hemen Kayıt Olun</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
