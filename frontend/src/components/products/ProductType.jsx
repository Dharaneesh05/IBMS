import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';

const ProductType = () => {
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchProductsByType();
  }, [type]);

  const fetchProductsByType = async () => {
    try {
      const response = await api.get(`/products/type/${type}`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProductsByType();
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

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-400 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center text-sm text-gold-100 mb-3">
                <Link to="/products" className="hover:text-white transition-colors">Products</Link>
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white font-semibold">{type}</span>
              </nav>
              <h1 className="text-4xl font-bold mb-2">{type} Collection</h1>
              <p className="text-gold-100">{products.length} {products.length === 1 ? 'product' : 'products'} in this category</p>
            </div>
            <Link 
              to="/products"
              className="bg-white text-gold-600 px-6 py-3 rounded-lg font-semibold hover:bg-gold-50 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center animate-fade-in">
              <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="card text-center animate-fade-in" style={{animationDelay: '50ms'}}>
              <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuantity}</p>
            </div>
            <div className="card text-center animate-fade-in" style={{animationDelay: '100ms'}}>
              <svg className="w-8 h-8 text-gold-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gold-600">₹{totalValue.toLocaleString()}</p>
            </div>
            <div className="card text-center animate-fade-in" style={{animationDelay: '150ms'}}>
              <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
          </div>
        )}

        {/* View Toggle */}
        {products.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gold-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-gold-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="Table view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products in {type}</h3>
            <p className="text-gray-500 mb-6">There are currently no products in this category</p>
            <Link to="/products/new" className="btn-primary inline-block">
              Add Product
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product._id} 
                className="card group animate-fade-in"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src='https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStockBadge(product.quantity)}
                  </div>
                </Link>

                <div className="p-5">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-gold-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <Link 
                    to={`/designers/${product.designer?._id}`}
                    className="text-sm text-gray-600 hover:text-gold-600 transition-colors mb-3 block"
                  >
                    by <span className="font-semibold">{product.designer?.name || 'Unknown Designer'}</span>
                  </Link>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-lg font-bold text-gold-600">₹{product.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="text-lg font-bold text-gray-900">{product.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/products/${product._id}/edit`}
                      className="flex-1 bg-gold-50 text-gold-700 py-2 px-4 rounded-lg font-semibold hover:bg-gold-100 transition-colors text-center text-sm"
                    >
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
        ) : (
          /* Table View */
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-gold">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Designer</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gold-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/products/${product._id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-gold-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/designers/${product.designer?._id}`}
                          className="text-sm text-gray-600 hover:text-gold-600 transition-colors"
                        >
                          {product.designer?.name || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-bold text-gray-900">{product.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-700">₹{product.cost?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gold-600">₹{product.price?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStockBadge(product.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            to={`/products/${product._id}/edit`}
                            className="p-2 bg-gold-50 text-gold-700 rounded-lg hover:bg-gold-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductType;
