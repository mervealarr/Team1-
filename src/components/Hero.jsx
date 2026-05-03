import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          İkinci El Alışverişte <br />
          <span className="text-gradient">Yeni Dönem</span>
        </h1>
        <p className="hero-subtitle">
          Kullanmadığınız eşyalarınızı kolayca satın, aradığınızı anında bulun. 
          Güvenli ve hızlı ticaretin adresi.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg">Keşfetmeye Başla</button>
          <button className="btn btn-secondary btn-lg glass">Nasıl Çalışır?</button>
        </div>
        
        <div className="stats-container glass">
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Aktif Kullanıcı</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Satılan Ürün</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h3>%99</h3>
            <p>Müşteri Memnuniyeti</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
