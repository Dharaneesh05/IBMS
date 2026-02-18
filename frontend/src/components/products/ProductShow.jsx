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
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">Out of Stock</span>;
    } else if (product.quantity <= 5) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">Low Stock</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">In Stock</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3">
          <nav className="flex items-center text-sm text-gray-600">
            <Link to="/products" className="hover:text-[#0d9488] transition-colors">Products</Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Image */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-3">
              <Link 
                to={`/products/${id}/edit`}
                className="w-full bg-[#1a1d2e] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2a2e42] transition-colors text-center block"
              >
                Edit Product
              </Link>
              <button 
                onClick={handleDelete}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-7">
            {/* Product Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                    {product.type}
                  </span>
                </div>
                {getStockBadge()}
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Low Stock Warning */}
            {product.quantity > 0 && product.quantity <= 5 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Low Stock Alert</p>
                  <p className="text-sm text-amber-700">Only {product.quantity} {product.quantity === 1 ? 'item' : 'items'} remaining. Consider restocking soon.</p>
                </div>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 font-medium">Cost Price</p>
                <p className="text-xl font-bold text-gray-900">₹{product.cost?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 font-medium">Selling Price</p>
                <p className="text-xl font-bold text-[#0d9488]">₹{product.price?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 font-medium">Markup</p>
                <p className="text-xl font-bold text-green-600">₹{markup?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1 font-medium">Margin</p>
                <p className="text-xl font-bold text-purple-600">{markupPercentage}%</p>
              </div>
            </div>

            {/* Inventory Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Quantity in Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{product.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-[#0d9488]">₹{(product.price * product.quantity)?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Designer Info */}
            {product.designer && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Designer Information</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#0d9488] flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {product.designer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link 
                        to={`/designers/${product.designer.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-[#0d9488] transition-colors"
                      >
                        {product.designer.name}
                      </Link>
                      <p className="text-sm text-gray-600">{product.designer.email}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/designers/${product.designer.id}`}
                    className="px-4 py-2 bg-[#1a1d2e] text-white rounded-lg hover:bg-[#2a2e42] transition-colors text-sm font-medium"
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


