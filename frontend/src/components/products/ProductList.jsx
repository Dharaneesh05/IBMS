import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useFilter } from '../../contexts/FilterContext';

const ProductList = () => {
  const { getFilteredProducts, isFilterApplied } = useFilter();
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isCompactView, setIsCompactView] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [searchScopeOpen, setSearchScopeOpen] = useState(false);
  const [searchScope, setSearchScope] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchTypes();
  }, []);

  // Reset selections when filtered products change
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [selectedType]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setImportMenuOpen(false);
        setExportMenuOpen(false);
        setSearchScopeOpen(false);
      }
    };
    
    if (importMenuOpen || exportMenuOpen || searchScopeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [importMenuOpen, exportMenuOpen, searchScopeOpen]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await api.get('/products/types/all');
      setTypes(response.data);
    } catch (err) {
      console.error('Failed to load product types');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleSelectItem = (productId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredAndSortedProducts.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(filteredAndSortedProducts.map(p => p.id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} selected products?`)) {
      try {
        await Promise.all([...selectedItems].map(id => api.delete(`/products/${id}`)));
        setSelectedItems(new Set());
        setSelectAll(false);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete some products');
      }
    }
  };

  const calculateTotals = (productsList) => {
    return {
      totalProducts: productsList.length,
      totalQuantity: productsList.reduce((sum, p) => sum + p.quantity, 0),
      totalValue: productsList.reduce((sum, p) => sum + (p.price * p.quantity), 0),
      lowStockItems: productsList.filter(p => p.quantity > 0 && p.quantity <= 5).length
    };
  };

  const getStockBadge = (quantity) => {
    if (quantity <= 0) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Out of Stock</span>;
    } else if (quantity <= 5) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Low Stock</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">In Stock</span>;
  };

  const filteredAndSortedProducts = (() => {
    // First apply global filters from FilterContext
    let filtered = getFilteredProducts(products);
    
    // Apply search scope filter (from dropdown)
    if (searchScope !== 'all') {
      filtered = filtered.filter(p => p.type === searchScope);
    }
    
    // Then apply type filter (from category pills)
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        (p.designer?.name || '').toLowerCase().includes(query) ||
        (p.sku || '').toLowerCase().includes(query)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'designer':
          aValue = (a.designer?.name || '').toLowerCase();
          bValue = (b.designer?.name || '').toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none bg-repeat z-0"
        style={{
          backgroundImage: 'url(/99172127-vector-jewelry-pattern-jewelry-seamless-background.jpg)',
          backgroundSize: '300px 300px'
        }}
      />
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative z-10">
        <div className="container mx-auto px-6 py-6">
          {/* Top Row: Title, Search, Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Title */}
            <div className="lg:w-1/4">
              <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Jewellery Inventory</h1>
              {/* <p className="text-gray-600 text-sm mt-1">Manage stock, pricing, and availability</p> */}
            </div>

            {/* Centered Search Bar */}
            <div className="lg:flex-1 lg:px-8">
              <div className="relative max-w-xl mx-auto dropdown-container">
                {/* Search Scope Dropdown */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    onClick={() => setSearchScopeOpen(!searchScopeOpen)}
                    className="flex items-center gap-1 pl-3 pr-2 h-full text-teal-600 hover:text-teal-700 border-r border-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${searchScope === 'all' ? 'All Items' : searchScope}...`}
                  className="w-full pl-14 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 focus:bg-white"
                />
                
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Search Scope Dropdown Menu */}
                {searchScopeOpen && (
                  <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-fadeIn">
                    <button
                      onClick={() => {
                        setSearchScope('all');
                        setSearchScopeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                        searchScope === 'all' 
                          ? 'bg-teal-50 text-teal-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>All Items ({products.length})</span>
                      {searchScope === 'all' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {types.map((type, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchScope(type);
                          setSearchScopeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                          searchScope === type 
                            ? 'bg-teal-50 text-teal-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{type} ({products.filter(p => p.type === type).length})</span>
                        {searchScope === type && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {products.length > 0 && (
              <div className="flex items-center gap-2 lg:w-auto">
                {/* Import Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setImportMenuOpen(!importMenuOpen);
                      setExportMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-teal-300 transition-all text-sm font-medium shadow-sm hover:shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {importMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 animate-fadeIn">
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 transition-colors rounded-md mx-1">
                        <span className="font-semibold text-teal-600">Import Items</span>
                        <p className="text-xs text-gray-500 mt-0.5">Upload CSV file</p>
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-md mx-1">
                        Import Items Images
                      </button>
                    </div>
                  )}
                </div>

                {/* Export Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setExportMenuOpen(!exportMenuOpen);
                      setImportMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-teal-300 transition-all text-sm font-medium shadow-sm hover:shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 animate-fadeIn">
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-md mx-1">
                        Export Inventory
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-md mx-1">
                        Export Low Stock
                      </button>
                    </div>
                  )}
                </div>

                {/* Add Product Button */}
                <Link 
                  to="/products/new" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </Link>
              </div>
            )}
          </div>

          {/* View Controls & Sort - Combined Row */}
          {products.length > 0 && (
            <div className="flex items-center justify-between gap-2 mt-3">
              {/* Left: View Controls */}
              <div className="flex items-center gap-2">
                  {/* Table/Grid Toggle */}
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2.5 rounded-l-lg transition-all ${
                        viewMode === 'table'
                          ? 'bg-teal-600 text-white shadow-inner'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Table View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 transition-all border-l border-gray-200 ${
                        viewMode === 'grid'
                          ? 'bg-teal-600 text-white shadow-inner'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Grid View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    {/* Compact Toggle - Only for table view */}
                    {viewMode === 'table' && (
                      <button
                        onClick={() => setIsCompactView(!isCompactView)}
                        className={`p-2.5 rounded-r-lg transition-all border-l border-gray-200 ${
                          isCompactView
                            ? 'bg-teal-600 text-white shadow-inner'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Compact View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                        </svg>
                      </button>
                    )}
                  </div>
              </div>

              {/* Right: Sort Controls */}
              {filteredAndSortedProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm hover:border-gray-300 transition-all"
                  >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="designer">Designer</option>
                <option value="quantity">Quantity</option>
                    <option value="cost">Cost</option>
                    <option value="price">Price</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all bg-white shadow-sm"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Summary Stats + Quick Insights */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
              {/* Summary Cards */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all text-left group">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Active Designs</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{calculateTotals(filteredAndSortedProducts).totalProducts}</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all text-left group">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Total Pieces</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{calculateTotals(filteredAndSortedProducts).totalQuantity.toLocaleString()}</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all text-left group">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Stock Value</p>
                  <p className="text-2xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">₹{(calculateTotals(filteredAndSortedProducts).totalValue / 1000).toFixed(0)}K</p>
                </button>
                <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-md transition-all text-left group">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Reorder Alerts</p>
                  <p className="text-2xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">{calculateTotals(filteredAndSortedProducts).lowStockItems}</p>
                </button>
              </div>

              {/* Quick Insights Panel */}
              <div className="lg:col-span-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Quick Insights</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal-500 mt-1.5"></div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-medium">Top category:</span> {types.length > 0 && products.filter(p => p.type === types[0]).length > 0 ? types[0] : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5"></div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-medium">Highest value:</span> {filteredAndSortedProducts.length > 0 ? filteredAndSortedProducts.reduce((max, p) => p.price > max.price ? p : max).name : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5"></div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-medium">Stock attention:</span> {calculateTotals(filteredAndSortedProducts).lowStockItems} items need attention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section - Table or Grid */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Bulk Actions Bar - Only for table view */}
        {viewMode === 'table' && selectedItems.size > 0 && (
          <div className="mb-4 bg-[#1a1d2e] text-white rounded-lg px-4 py-2 flex items-center justify-between shadow-lg">
            <span className="text-sm font-medium">{selectedItems.size} item(s) selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {filteredAndSortedProducts.length === 0 ? (
          <div className="card p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Items Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 
                `No items match "${searchQuery}"` :
                selectedType === 'all' 
                  ? "Start by adding your first item to inventory"
                  : `No items found in "${selectedType}" category`
              }
            </p>
            {selectedType === 'all' && !searchQuery && (
              <Link to="/products/new" className="inline-flex items-center px-6 py-3 bg-[#1a1d2e] text-white font-medium rounded-lg hover:bg-[#2a2e42] transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Item
              </Link>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className={`text-left ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'} w-12`}>
                      <input
                       type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                      />
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Product
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Designer
                    </th>
                    <th className={`text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Qty
                    </th>
                    <th className={`text-right text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Selling Price
                    </th>
                    <th className={`text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Status
                    </th>
                    <th className={`text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedProducts.map((product) => (
                    <tr key={product.id} className={`transition-colors duration-150 border-b border-gray-100 ${
                      product.quantity === 0 ? 'bg-red-50 hover:bg-red-100' : 
                      product.quantity > 0 && product.quantity <= 5 ? 'bg-amber-50 hover:bg-amber-100' : 
                      'hover:bg-gray-50'
                    }`}>
                      <td className={`${isCompactView ? 'px-4 py-2' : 'px-6 py-4'} w-12`}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(product.id)}
                          onChange={() => handleSelectItem(product.id)}
                          className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                        />
                      </td>
                      <td className={`${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/products/${product.id}`}
                          className="block group"
                        >
                          <div className={`${isCompactView ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 group-hover:text-teal-600 transition-colors`}>
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {product.type}
                          </div>
                        </Link>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/designers/${product.designer?.id}`}
                          className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-600 hover:text-teal-600 transition-colors`}
                        >
                          {product.designer?.name || 'N/A'}
                        </Link>
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} font-bold text-gray-900`}>{product.quantity}</span>
                      </td>
                      <td className={`whitespace-nowrap text-right ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} font-bold text-emerald-600`}>₹{product.price?.toLocaleString()}</span>
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        {getStockBadge(product.quantity)}
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/products/${product.id}/edit`}
                          className={`text-teal-600 hover:text-teal-700 font-medium transition-colors ${isCompactView ? 'text-xs' : 'text-sm'}`}
                          title="Edit product"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAndSortedProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Product Image */}
                <Link to={`/products/${product.id}`} className="block relative">
                  <div className="aspect-square bg-gradient-to-br from-teal-50 to-cyan-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <svg className="w-16 h-16 text-teal-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                    </svg>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  {/* Product Name */}
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5 hover:text-teal-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Product Meta */}
                  <p className="text-xs text-gray-500 mb-4">
                    {product.type} • {product.designer?.name || 'No Designer'}
                  </p>

                  {/* Stock Status with Colored Dot */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Stock:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{Math.round(product.quantity)} pcs</span>
                      <div className={`w-2 h-2 rounded-full ${
                        product.quantity === 0 ? 'bg-red-500' :
                        product.quantity <= 5 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}></div>
                      <span className={`text-xs font-medium ${
                        product.quantity === 0 ? 'text-red-600' :
                        product.quantity <= 5 ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {product.quantity === 0 ? 'Out' : product.quantity <= 5 ? 'Low' : 'In Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-gray-500">Selling Price</span>
                      <span className="text-base font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-gray-500">Cost Price</span>
                      <span className="text-sm font-medium text-gray-600">₹{product.cost?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/products/${product.id}`}
                      className="flex-1 text-center py-2.5 px-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-xs font-semibold shadow-sm hover:shadow"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/products/${product.id}/edit`}
                      className="flex-1 text-center py-2.5 px-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-semibold"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;


