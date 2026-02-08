import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const ProductShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load product');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        navigate('/products');
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
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

  if (!product) return null;

  const markup = product.price - product.cost;
  const markupPercentage = ((markup / product.cost) * 100).toFixed(2);

  const getStockBadge = () => {
    if (product.quantity <= 0) {
      return <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">Out of Stock</span>;
    } else if (product.quantity <= 5) {
      return <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">Low Stock - Only {product.quantity} left</span>;
    }
    return <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">In Stock</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-gray-600">
            <Link to="/products" className="hover:text-gold-600 transition-colors">Products</Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Actions */}
          <div className="lg:col-span-1">
            {/* Product Image */}
            <div className="card overflow-hidden mb-6">
              <div className="aspect-square bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                to={`/products/${id}/edit`}
                className="btn-primary w-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Product
              </Link>
              <button 
                onClick={handleDelete}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Product
              </button>
              <Link 
                to="/products"
                className="btn-outline w-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Products
              </Link>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-2">
            {/* Product Header */}
            <div className="card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {product.type}
                  </span>
                </div>
                {getStockBadge()}
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card text-center bg-gradient-to-br from-gray-50 to-gray-100">
                <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-600 mb-1">Cost Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{product.cost?.toLocaleString()}</p>
              </div>
              <div className="card text-center bg-gradient-to-br from-gold-50 to-gold-100">
                <svg className="w-8 h-8 text-gold-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-600 mb-1">Selling Price</p>
                <p className="text-2xl font-bold text-gold-600">₹{product.price?.toLocaleString()}</p>
              </div>
              <div className="card text-center bg-gradient-to-br from-green-50 to-green-100">
                <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-xs text-gray-600 mb-1">Markup</p>
                <p className="text-2xl font-bold text-green-600">₹{markup?.toLocaleString()}</p>
              </div>
              <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100">
                <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-xs text-gray-600 mb-1">Margin</p>
                <p className="text-2xl font-bold text-purple-600">{markupPercentage}%</p>
              </div>
            </div>

            {/* Inventory Details */}
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity in Stock</p>
                    <p className="text-3xl font-bold text-gray-900">{product.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gold-100 rounded-lg">
                    <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-3xl font-bold text-gray-900">₹{(product.price * product.quantity)?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Designer Info */}
            {product.designer && (
              <div className="card bg-gradient-to-r from-gold-50 to-white">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Designer Information</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center">
                    <span className="text-2xl font-bold text-gold-700">
                      {product.designer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Link 
                      to={`/designers/${product.designer._id}`}
                      className="text-xl font-bold text-gray-900 hover:text-gold-600 transition-colors"
                    >
                      {product.designer.name}
                    </Link>
                    <p className="text-gray-600">{product.designer.email}</p>
                  </div>
                  <Link 
                    to={`/designers/${product.designer._id}`}
                    className="btn-outline"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShow;
