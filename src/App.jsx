import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
  return (
    <AuthProvider>
      <CartProvider>
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
  );
}

export default App;
