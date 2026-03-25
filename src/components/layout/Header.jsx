import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SearchModal from './SearchModal';
import CartDrawer from '../cart/CartDrawer';
import LoginModal from '../auth/LoginModal';

const NAV_ITEMS = [
  { label: 'nueva colección', path: '/category/nueva-coleccion' },
  { label: 'hombres', path: '/category/hombres' },
  { label: 'mujeres', path: '/category/mujeres' },
  { label: 'niños', path: '/category/ninos' },
  { label: 'ofertas', path: '/category/ofertas' },
];

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(false);

  const { totalItems, setIsOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Monitor scroll to switch header background from translucent to solid
  useEffect(() => {
    const handleScroll = () => {
      // If scrolled past 50px (out of hero), make it solid
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize properly on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for dark section visibility (Quienes Somos)
  useEffect(() => {
    const handler = (e) => setIsDarkSection(e.detail.visible);
    window.addEventListener('quienes-somos-visibility', handler);
    return () => window.removeEventListener('quienes-somos-visibility', handler);
  }, []);

  const handleUserClick = () => {
    if (user) {
      setProfileDropdown((prev) => !prev);
    } else {
      setLoginOpen(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdown(false);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex items-center justify-between transition-all duration-500 ${
          isDarkSection
            ? 'bg-[#0a0a0a] border-b border-white/10 text-white'
            : isScrolled 
              ? 'bg-white border-b border-gray-100 shadow-sm text-gray-900' 
              : 'bg-white/30 backdrop-blur-xl border-b border-white/10 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-1 -ml-1 ${isDarkSection ? 'text-white' : 'text-gray-900'}`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          {/* Logo */}
          <a href="/" className={`text-2xl font-black tracking-tighter transition-colors duration-500 ${isDarkSection ? 'text-white' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Hoodie.
          </a>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-all pb-1 ${
                  isActive
                    ? `${isDarkSection ? 'text-white' : 'text-gray-900'} border-b-2 border-red-500`
                    : `${isDarkSection ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setSearchOpen(true)}
            className={`transition-colors ${isDarkSection ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'}`}
          >
            <Search size={20} strokeWidth={1} />
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className={`transition-colors relative ${isDarkSection ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'}`}
          >
            <ShoppingBag size={20} strokeWidth={1} />
            {totalItems > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold ${isDarkSection ? 'bg-white text-black' : 'bg-black text-white'}`}>
                {totalItems}
              </span>
            )}
          </button>

          {/* User */}
          <div className="relative flex items-center h-full">
            <button
              onClick={handleUserClick}
              className={`transition-colors flex items-center justify-center ${isDarkSection ? 'text-white hover:text-gray-300' : user ? 'text-black' : 'text-gray-900 hover:text-gray-600'}`}
            >
              <User size={20} strokeWidth={1} />
              {user && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Profile Dropdown */}
            {profileDropdown && user && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Conectado como</p>
                  <p className="text-sm font-semibold truncate">{user.email}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin'); setProfileDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Shield size={14} /> Panel Admin
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Click-outside to close profile dropdown */}
      {profileDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col pt-20 px-6 animate-in slide-in-from-left">
            <button 
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-black transition-colors bg-gray-100 rounded-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex flex-col space-y-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-black tracking-tight text-gray-900 uppercase border-b border-gray-100 pb-4"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-auto mb-10 border-t border-gray-100 pt-6">
              <a href="/" className="text-3xl font-black tracking-tighter">Hoodie.</a>
              <p className="text-sm text-gray-500 mt-2">Vibras urbanas, estilo atemporal.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
