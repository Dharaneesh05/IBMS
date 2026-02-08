import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [isCompactView, setIsCompactView] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchTypes();
  }, []);

  // Reset selections when filtered products change
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [selectedType]);

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
      setSelectedItems(new Set(filteredAndSortedProducts.map(p => p._id)));
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
    let filtered = selectedType === 'all' 
      ? products 
      : products.filter(p => p.type === selectedType);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Products Table View</h1>
              <p className="text-gray-600">Comprehensive product inventory list</p>
            </div>
            {products.length > 0 && (
              <div className="flex flex-col items-end gap-3">
                <Link 
                  to="/products/new" 
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a1d2e] text-white rounded-lg hover:bg-[#2a2e42] transition-colors shadow-md"
                  title="Add New Product"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Add Product</span>
                </Link>
                
                {/* View Controls Only */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={() => setIsCompactView(false)}
                    className={`p-2 rounded-l-lg transition-colors ${
                      !isCompactView
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Comfortable View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsCompactView(true)}
                    className={`p-2 rounded-r-lg transition-colors border-l border-gray-300 ${
                      isCompactView
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Compact View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Section */}
          {types.length > 0 && products.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedType === 'all'
                      ? 'bg-[#1a1d2e] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  All Products ({products.length})
                </button>
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedType === type
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {type} ({products.filter(p => p.type === type).length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Controls - Positioned after filter category */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="mt-4 flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#1a1d2e]/20 focus:border-[#1a1d2e]"
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
                  className="p-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          )}

          {/* Summary Stats - Professional Grid Layout */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{calculateTotals(filteredAndSortedProducts).totalProducts}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Quantity</p>
                <p className="text-3xl font-bold text-gray-900">{calculateTotals(filteredAndSortedProducts).totalQuantity.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Value</p>
                <p className="text-2xl lg:text-3xl font-bold text-[#0d9488] break-all">₹{calculateTotals(filteredAndSortedProducts).totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-600">{calculateTotals(filteredAndSortedProducts).lowStockItems}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Bulk Actions Bar - Positioned at top of table section */}
        {selectedItems.size > 0 && (
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
        <div className="card overflow-hidden">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500 mb-6">
                {selectedType === 'all' 
                  ? "Start by adding your first product to the inventory"
                  : `No products found in "${selectedType}" category`
                }
              </p>
              {selectedType === 'all' && (
                <Link to="/products/new" className="inline-flex items-center px-6 py-3 bg-[#1a1d2e] text-white font-medium rounded-lg hover:bg-[#2a2e42] transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={`text-left ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'} w-12`}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#0d9488] bg-gray-100 border-gray-300 rounded focus:ring-[#0d9488] focus:ring-2"
                      />
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Product Name
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Type
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Designer
                    </th>
                    <th className={`text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Quantity
                    </th>
                    <th className={`text-right text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Cost
                    </th>
                    <th className={`text-right text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Price
                    </th>
                    <th className={`text-right text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Markup
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
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100">
                      <td className={`${isCompactView ? 'px-4 py-2' : 'px-6 py-4'} w-12`}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(product._id)}
                          onChange={() => handleSelectItem(product._id)}
                          className="w-4 h-4 text-[#0d9488] bg-gray-100 border-gray-300 rounded focus:ring-[#0d9488] focus:ring-2"
                        />
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/products/${product._id}`}
                          className={`${isCompactView ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 hover:text-[#0d9488] transition-colors`}
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold ${isCompactView ? 'text-xs' : 'text-xs'}`}>
                          {product.type}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/designers/${product.designer?._id}`}
                          className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-600 hover:text-[#0d9488] transition-colors`}
                        >
                          {product.designer?.name || 'N/A'}
                        </Link>
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} font-bold text-gray-900`}>{product.quantity}</span>
                      </td>
                      <td className={`whitespace-nowrap text-right ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} font-semibold text-gray-700`}>₹{product.cost?.toLocaleString()}</span>
                      </td>
                      <td className={`whitespace-nowrap text-right ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} font-bold text-[#0d9488]`}>₹{product.price?.toLocaleString()}</span>
                      </td>
                      <td className={`whitespace-nowrap text-right ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} font-bold text-green-600`}>₹{(product.price - product.cost)?.toLocaleString()}</span>
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        {getStockBadge(product.quantity)}
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/products/${product._id}/edit`}
                          className={`text-[#1a1d2e] hover:text-[#2a2e42] font-medium transition-colors ${isCompactView ? 'text-xs' : 'text-sm'}`}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
