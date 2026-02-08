import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const ProductListGrid = () => {
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchTypes();
  }, []);

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

  const getStockBadge = (quantity) => {
    if (quantity <= 0) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Out of Stock</span>;
    } else if (quantity <= 5) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Low Stock</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">In Stock</span>;
  };

  const filteredProducts = selectedType === 'all' 
    ? products 
    : products.filter(p => p.type === selectedType);

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Collection</h1>
              <p className="text-gray-600">Browse our exquisite jewellery inventory</p>
            </div>
            <Link 
              to="/products/new" 
              className="btn-primary inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </Link>
          </div>

          {/* Filter Section */}
          {types.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedType === 'all'
                      ? 'bg-gold-500 text-white shadow-gold'
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
                        ? 'bg-gold-500 text-white shadow-gold'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {type} ({products.filter(p => p.type === type).length})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              {selectedType === 'all' 
                ? "Start by adding your first product to the inventory"
                : `No products found in "${selectedType}" category`
              }
            </p>
            <Link to="/products/new" className="btn-primary inline-block">
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div 
                key={product._id} 
                className="card group animate-fade-in"
                style={{animationDelay: `${index * 50}ms`}}
              >
                {/* Product Image */}
                <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src='https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Stock Badge Overlay */}
                  <div className="absolute top-4 right-4">
                    {getStockBadge(product.quantity)}
                  </div>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white font-semibold text-lg">View Details</span>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  {/* Type Badge */}
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                    {product.type}
                  </span>

                  {/* Product Name */}
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-gold-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Designer */}
                  <Link 
                    to={`/designers/${product.designer?._id}`}
                    className="text-sm text-gray-600 hover:text-gold-600 transition-colors mb-3 block"
                  >
                    by <span className="font-semibold">{product.designer?.name || 'Unknown Designer'}</span>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                  {/* Pricing */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="text-sm font-semibold text-gray-700">₹{product.cost?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-sm font-bold text-gold-600">₹{product.price?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Markup:</span>
                      <span className="font-bold text-green-600">₹{(product.price - product.cost)?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-lg font-bold text-gray-900">{product.quantity}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/products/${product._id}/edit`}
                      className="flex-1 bg-gold-50 text-gold-700 py-2 px-4 rounded-lg font-semibold hover:bg-gold-100 transition-colors text-center text-sm"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-50 text-red-700 py-2 px-4 rounded-lg font-semibold hover:bg-red-100 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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

export default ProductListGrid;
