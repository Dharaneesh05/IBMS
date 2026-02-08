import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const ProductList = () => {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Products Table View</h1>
              <p className="text-gray-600">Comprehensive product inventory list</p>
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
            <div>
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

      {/* Table Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="card overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-gold">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Designer
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Markup
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gold-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/products/${product._id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-gold-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {product.type}
                        </span>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-green-600">₹{(product.price - product.cost)?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStockBadge(product.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            to={`/products/${product._id}/edit`}
                            className="p-2 bg-gold-50 text-gold-700 rounded-lg hover:bg-gold-100 transition-colors"
                            title="Edit product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete product"
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
          )}
        </div>

        {/* Summary Stats */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{filteredProducts.length}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredProducts.reduce((sum, p) => sum + p.quantity, 0)}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gold-600">
                ₹{filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">
                {filteredProducts.filter(p => p.quantity > 0 && p.quantity <= 5).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
