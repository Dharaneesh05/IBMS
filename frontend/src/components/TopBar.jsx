import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const TopBar = ({ onFilterClick, onNotificationClick, onMailClick, onSettingsClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], designers: [] });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [metalRates, setMetalRates] = useState({
    gold24K: 14675,
    gold22K: 13452,
    silver: 723,
    trends: {
      gold: 'up',
      silver: 'up'
    },
    timestamp: ''
  });
  const searchRef = useRef(null);
  const activityRef = useRef(null);
  const navigate = useNavigate();

  // Fetch recent activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data?.recentActivities) {
          setRecentActivities(response.data.recentActivities);
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchActivities();
    // Refresh activities every 5 seconds for dynamic updates
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live gold and silver rates from backend API (every 30 seconds)
  useEffect(() => {
    const fetchMetalRates = async () => {
      try {
        // Call backend API instead of Gold API directly (avoids CORS issues)
        const response = await api.get('/metal-rates');
        const data = response.data;
        
        if (data) {
          setMetalRates({
            gold24K: data.gold24K,
            gold22K: data.gold22K,
            silver: data.silver,
            trends: data.trends,
            timestamp: data.timestamp
          });
          
          // Log if using fallback data
          if (!data.success) {
            console.warn('Metal rates API unavailable, using cached data');
          }
        }
      } catch (error) {
        console.error('Error fetching metal rates:', error);
        // Keep previous rates on error
      }
    };

    // Fetch immediately on mount
    fetchMetalRates();
    
    // Update every 30 seconds
    const interval = setInterval(fetchMetalRates, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (activityRef.current && !activityRef.current.contains(event.target)) {
        setShowActivityPanel(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-4">{/* Left: Search Bar */}
          <div className="flex items-center space-x-2 flex-1 max-w-sm" ref={searchRef}>
            {/* Search Bar with Filter */}
            <div className="flex items-center space-x-2 w-full relative">
              <div className="relative flex-1">
                <svg
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
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
                  placeholder="Search jewellery items, purity, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  className="w-full pl-9 pr-9 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                key={product.id}
                                onClick={() => handleResultClick('product', product.id)}
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
                                key={designer.id}
                                onClick={() => handleResultClick('designer', designer.id)}
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
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                title="Filters"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center: Metal Rates */}
          <div className="flex-1 flex justify-center items-center px-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">Today's Metal Rates</span>
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Gold 24K</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">₹{metalRates.gold24K.toLocaleString()}/g</span>
              {metalRates.trends.gold && (
                <span className={`text-[10px] ${metalRates.trends.gold === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metalRates.trends.gold === 'up' ? '↑' : '↓'}
                </span>
              )}
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Gold 22K</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-500 whitespace-nowrap">₹{metalRates.gold22K.toLocaleString()}/g</span>
              {metalRates.trends.gold && (
                <span className={`text-[10px] ${metalRates.trends.gold === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metalRates.trends.gold === 'up' ? '↑' : '↓'}
                </span>
              )}
              <span className="text-gray-400 dark:text-gray-500">|</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Silver</span>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">₹{metalRates.silver.toLocaleString()}/g</span>
              {metalRates.trends.silver && (
                <span className={`text-[10px] ${metalRates.trends.silver === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {metalRates.trends.silver === 'up' ? '↑' : '↓'}
                </span>
              )}
              {metalRates.timestamp && (
                <>
                  <span className="text-gray-400 dark:text-gray-500">|</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">Updated {metalRates.timestamp}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {/* Recent Activity Icon */}
            <div className="relative" ref={activityRef}>
              <button 
                onClick={() => {
                  setShowActivityPanel(!showActivityPanel);
                  setShowAllActivities(false);
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg relative"
                title="Recent Activities"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Activity Panel Dropdown */}
              {showActivityPanel && (
                <div className="absolute right-0 mt-2 w-[420px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activities</h3>
                  </div>

                  {/* Content */}
                  <div className="max-h-[400px] overflow-y-auto p-4">
                    {recentActivities.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {(showAllActivities ? recentActivities : recentActivities.slice(0, 3)).map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                  {activity.action}. <span className="font-medium">By {activity.userName}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {(() => {
                                    const date = new Date(activity.timestamp);
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const year = date.getFullYear();
                                    let hours = date.getHours();
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    const ampm = hours >= 12 ? 'PM' : 'AM';
                                    hours = hours % 12 || 12;
                                    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
                                  })()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {recentActivities.length > 3 && (
                          <div className="mt-4">
                            <button 
                              onClick={() => setShowAllActivities(!showAllActivities)}
                              className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-1"
                            >
                              {showAllActivities ? 'Show Less' : `Show More (${recentActivities.length - 3} more)`}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          Your activities in Inventory will show up here!
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Create your first transaction to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Icon */}
            <button 
              onClick={onSettingsClick}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg relative"
              title="Settings"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Mail Icon */}
            <button
              onClick={onMailClick}
              className="relative p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
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
              className="relative p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
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


