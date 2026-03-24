import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SearchModal from './SearchModal';
import CartDrawer from '../cart/CartDrawer';
import LoginModal from '../auth/LoginModal';

const NAV_ITEMS = [
  { label: 'new arrivals', path: '/category/new-arrivals' },
  { label: 'mens', path: '/category/mens' },
  { label: 'womens', path: '/category/womens' },
  { label: 'kids', path: '/category/kids' },
  { label: 'sale', path: '/category/sale' },
];

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
        className={`fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex items-center justify-between transition-colors duration-500 ${
          isScrolled 
            ? 'bg-white border-b border-gray-100 shadow-sm text-gray-900' 
            : 'bg-white/30 backdrop-blur-xl border-b border-white/10 text-gray-900'
        }`}
      >
        {/* Logo */}
        <a href="/" className="text-2xl font-black tracking-tighter" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Hoodie.
        </a>

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
                    ? 'text-gray-900 border-b-2 border-red-500'
                    : 'text-gray-500 hover:text-gray-900'
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
            className="text-gray-900 hover:text-gray-600 transition-colors"
          >
            <Search size={20} strokeWidth={1} />
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="text-gray-900 hover:text-gray-600 transition-colors relative"
          >
            <ShoppingBag size={20} strokeWidth={1} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {/* User */}
          <div className="relative flex items-center h-full">
            <button
              onClick={handleUserClick}
              className={`transition-colors flex items-center justify-center ${user ? 'text-black' : 'text-gray-900 hover:text-gray-600'}`}
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
    </>
  );
};

export default Header;
