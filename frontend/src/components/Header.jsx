import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Banner */}
      <div className="bg-gradient-gold py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-white text-sm font-medium">
            ✨ Premium Handcrafted Jewellery | Free Shipping on Orders Above ₹50,000
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src='https://cdn.pixabay.com/photo/2017/02/01/00/25/diamond-2028549_960_720.png' 
                  className='h-12 w-12 object-contain transform group-hover:rotate-12 transition-transform duration-300' 
                  alt="Shanmuga Jewells"
                />
                <div className="absolute inset-0 bg-gold-400 opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent">
                  Shanmuga Jewells
                </h1>
                <p className="text-xs text-gray-500 font-medium">Premium Collection</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                to='/dashboard' 
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActive('/dashboard')
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link 
                to='/products' 
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActive('/products')
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Inventory</span>
              </Link>

              <Link 
                to='/designers' 
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActive('/designers')
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Designers</span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button 
                onClick={() => setSearchVisible(!searchVisible)}
                className="p-2 text-gray-600 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link 
                to='/dashboard' 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  isActive('/dashboard')
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link 
                to='/products' 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  isActive('/products')
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Inventory</span>
              </Link>

              <Link 
                to='/designers' 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  isActive('/designers')
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Designers</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Search Bar */}
      {searchVisible && (
        <div className="bg-gray-50 border-b border-gray-200 animate-slide-down">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for products, designers, or collections..." 
                  className="w-full pl-12 pr-4 py-3 border-2 border-gold-300 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all duration-200"
                  autoFocus
                />
                <svg className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
