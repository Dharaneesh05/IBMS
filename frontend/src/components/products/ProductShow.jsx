import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { HiShieldExclamation } from 'react-icons/hi';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';

const ProductShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Link to="/products" className="hover:text-[#1F3A2E] transition-colors">Products</Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Image */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img 
                  src={product.frontImage || "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 space-y-2">
              <Link 
                to={`/products/${id}/edit`}
                className="w-full bg-[#1a1d2e] dark:bg-[#1F3A2E] text-white py-2.5 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity text-center block text-sm"
              >
                Edit Product
              </Link>
              <button 
                onClick={handleDelete}
                className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                Delete Product
              </button>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-8">
            {/* Product Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">{product.name}</h1>
                  <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                    {product.type}
                  </span>
                </div>
                {getStockBadge()}
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Low Stock Warning */}
            {product.quantity > 0 && product.quantity <= 5 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-3 mb-3 flex items-start gap-3">
                <HiShieldExclamation className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Low Stock Alert</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Only {product.quantity} {product.quantity === 1 ? 'item' : 'items'} remaining. Consider restocking soon.</p>
                </div>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Cost Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">₹{product.cost?.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Selling Price</p>
                <p className="text-lg font-bold text-[#1F3A2E] dark:text-teal-400">₹{product.price?.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Markup</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{markup?.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Margin</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{markupPercentage}%</p>
              </div>
            </div>

            {/* Inventory Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Inventory Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Quantity in Stock</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{product.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Value</p>
                  <p className="text-xl font-bold text-[#1F3A2E] dark:text-teal-400">₹{(product.price * product.quantity)?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Barcode & QR Code Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Identification</h2>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-[#1F3A2E] text-white rounded-lg hover:bg-[#243d32] transition-colors text-xs font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Label
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Barcode */}
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Barcode (1D)</p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded inline-block" id="barcode-section">
                    {product.sku ? (
                      <Barcode 
                        value={product.sku} 
                        height={60}
                        fontSize={14}
                        displayValue={true}
                        background="#ffffff"
                        lineColor="#000000"
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">No SKU available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Use for POS scanning</p>
                </div>

                {/* QR Code */}
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">QR Code (2D)</p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded inline-block" id="qrcode-section">
                    {product.sku ? (
                      <QRCodeCanvas 
                        value={JSON.stringify({
                          sku: product.sku,
                          name: product.name,
                          price: product.price,
                          id: product.id
                        })}
                        size={128}
                        level="H"
                        includeMargin={true}
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">No SKU available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Scan with mobile app</p>
                </div>
              </div>

              {/* SKU Display */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Product SKU</p>
                    <p className="text-lg font-bold text-blue-900 font-mono">{product.sku || 'Not Generated'}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(product.sku);
                      alert('SKU copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Tip:</strong> Scan this barcode at billing to automatically add product to invoice
                </p>
              </div>
            </div>

            {/* Designer Info */}
            {product.designer && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Designer Information</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#1F3A2E] flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {product.designer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link 
                        to={`/designers/${product.designer.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-[#1F3A2E] transition-colors"
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


