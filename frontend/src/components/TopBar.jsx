import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

const TopBar = ({ onFilterClick, onNotificationClick, onMailClick, onSettingsClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], designers: [] });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch();
      } else {
        setSearchResults({ products: [], designers: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const [productsRes, designersRes] = await Promise.all([
        api.get('/products'),
        api.get('/designers')
      ]);

      const query = searchQuery.toLowerCase();
      
      const filteredProducts = productsRes.data.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        'jewells'.includes(query) ||
        'jewelry'.includes(query)
      ).slice(0, 5);

      const filteredDesigners = designersRes.data.filter(designer =>
        designer.name?.toLowerCase().includes(query) ||
        designer.email?.toLowerCase().includes(query) ||
        designer.phone?.toLowerCase().includes(query)
      ).slice(0, 5);

      setSearchResults({ products: filteredProducts, designers: filteredDesigners });
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ products: [], designers: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (type, id) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(type === 'product' ? `/products/${id}` : `/designers/${id}`);
  };

  const totalResults = searchResults.products.length + searchResults.designers.length;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Search Bar */}
          <div className="flex items-center space-x-2 flex-1 max-w-lg" ref={searchRef}>
            {/* Search Bar with Filter */}
            <div className="flex items-center space-x-2 w-full relative">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products, designers, jewells..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d9488] mx-auto"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
                      </div>
                    ) : totalResults === 0 ? (
                      <div className="p-4 text-center">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                      </div>
                    ) : (
                      <>
                        {/* Products Section */}
                        {searchResults.products.length > 0 && (
                          <div className="border-b border-gray-100 dark:border-gray-700">
                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Products / Items</h3>
                            </div>
                            {searchResults.products.map((product) => (
                              <button
                                key={product._id}
                                onClick={() => handleResultClick('product', product._id)}
                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
                              >
                                <div className="w-10 h-10 bg-[#0d9488] flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.category || 'Jewelry'} • ₹{product.price}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Designers Section */}
                        {searchResults.designers.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Designers / Customers</h3>
                            </div>
                            {searchResults.designers.map((designer) => (
                              <button
                                key={designer._id}
                                onClick={() => handleResultClick('designer', designer._id)}
                                className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center space-x-3"
                              >
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                                    {designer.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{designer.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{designer.email || designer.phone}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Filter Button */}
              <button
                onClick={onFilterClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                title="Filters"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center: Company Name */}
          <div className="flex-1 flex justify-start ml-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">Shanmuga Jewellers</h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {/* Settings Icon */}
            <button 
              onClick={onSettingsClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg relative"
              title="Settings"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Mail Icon */}
            <button
              onClick={onMailClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
              title="Messages"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Icon */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
              title="Notifications"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
