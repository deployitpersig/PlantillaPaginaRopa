import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Hero from './components/home/Hero';
import Banners from './components/home/Banners';
import Products from './components/home/Products';
import MidBanner from './components/home/MidBanner';
import Styles from './components/home/Styles';
import Features from './components/home/Features';
import Testimonials from './components/home/Testimonials';
import Newsletter from './components/home/Newsletter';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import CategoryPage from './pages/CategoryPage';

function HomePage() {
  return (
    <>
      <Hero />
      <Banners />
      <Products />
      <MidBanner />
      <Styles />
      <Features />
      <Testimonials />
      <Newsletter />
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
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
