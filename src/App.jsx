import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Hero from './components/home/Hero';
import Banners from './components/home/Banners';
import MidBanner from './components/home/MidBanner';
import Styles from './components/home/Styles';
import Features from './components/home/Features';
import Testimonials from './components/home/Testimonials';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CinematicScroll from './components/home/CinematicScroll';

function HomePage() {
  return (
    <>
      <CinematicScroll />
      <Hero />
      <MidBanner />
      <Styles />
      <Banners />
      <Features />
      <Testimonials />
    </>
  );
}

function App() {
  const [hashError, setHashError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errDesc = params.get('error_description');
      if (errDesc) {
        setHashError(errDesc.replace(/\+/g, ' '));
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <ErrorBoundary>
    <AuthProvider>
      <CartProvider>
        {hashError && (
          <div className="bg-red-600 text-white text-center py-3 px-6 fixed top-0 w-full z-[9999] shadow-lg flex items-center justify-between">
            <span className="font-semibold text-sm max-w-4xl mx-auto flex-1 text-center">
              Aviso: {hashError === 'Email link is invalid or has expired' 
                ? 'El enlace de seguridad es inválido o ya ha expirado (usualmente porque ya lo clickeaste antes). Por favor, intenta de nuevo.' 
                : hashError}
            </span>
            <button onClick={() => setHashError(null)} className="font-bold text-white hover:text-red-200">✕</button>
          </div>
        )}
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/products" element={<CategoryPage showAll />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
