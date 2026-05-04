import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { parseJwt } from '../utils';
import NotificationBell from './NotificationBell';
import './Navbar.css';


const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    setSearchQuery(query || '');
  }, [location.search]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (token) {
      const payload = parseJwt(token);
      const role = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload?.role;
      setIsAdmin(role === 'Admin');
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/listings?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/listings`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled glass' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Swap<span>Sell</span>
        </Link>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Ürün, kategori veya marka ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-btn" onClick={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Admin Paneli
                </Link>
              )}

              <Link to="/inbox" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                💬 Mesajlarım
              </Link>
                {/* YENİ EKLENEN PBI: BİLDİRİM ZİLİ */}
              <NotificationBell />
              <Link to="/favorites" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'red' }}>
                ❤️ Favorilerim
              </Link>

              <Link to="/profile" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profilim
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary">Çıkış Yap</button>
              {!isAdmin && <Link to="/create-listing" className="btn btn-primary">İlan Ver</Link>}
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Giriş Yap</Link>
              <Link to="/login" className="btn btn-primary">Hemen İlan Ver</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;