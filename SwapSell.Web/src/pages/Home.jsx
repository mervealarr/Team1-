import React from 'react';
import Hero from '../components/Hero';
import FeaturedItems from '../components/FeaturedItems';

const Home = () => {
  return (
    <main className="main-content">
      <Hero />
      <FeaturedItems />
    </main>
  );
};

export default Home;
