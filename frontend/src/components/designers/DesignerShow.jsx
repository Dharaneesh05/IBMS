import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const DesignerShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designer, setDesigner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDesigner();
  }, [id]);

  const fetchDesigner = async () => {
    try {
      const response = await api.get(`/designers/${id}`);
      setDesigner(response.data.designer);
      setProducts(response.data.products);
      setLoading(false);
    } catch (err) {
      setError('Failed to load designer');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will also delete all products by this designer.')) {
      try {
        await api.delete(`/designers/${id}`);
        navigate('/designers');
      } catch (err) {
        alert('Failed to delete designer');
      }
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        status === 'active' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0d9488] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designer...</p>
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

  if (!designer) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {designer.companyName || designer.displayName || designer.name}
              </h1>
              <p className="text-gray-600 mt-1">Designer Profile & Product Portfolio</p>
            </div>
            <div className="flex space-x-3">
              <Link 
                to="/designers" 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Designers
              </Link>
              <Link 
                to={`/designers/${id}/edit`} 
                className="px-4 py-2 text-sm font-medium text-white bg-[#0d9488] rounded-lg hover:bg-[#0f766e] transition-colors"
              >
                Edit Designer
              </Link>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Company Name</label>
                    <p className="text-gray-900 font-medium">{designer.companyName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                    <p className="text-gray-900 font-medium">{designer.displayName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
                    <p className="text-gray-900 font-medium">{designer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                    <a 
                      href={`mailto:${designer.email}`}
                      className="text-[#0d9488] hover:text-[#0f766e] transition-colors"
                    >
                      {designer.email}
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-gray-900 font-medium">{designer.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">GSTIN</label>
                    <p className="text-gray-900 font-medium font-mono">{designer.gstin || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {(designer.address?.street || designer.address?.city || designer.address?.state) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {designer.address?.street && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Street Address</label>
                        <p className="text-gray-900">{designer.address.street}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {designer.address?.city && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                          <p className="text-gray-900">{designer.address.city}</p>
                        </div>
                      )}
                      {designer.address?.state && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
                          <p className="text-gray-900">{designer.address.state}</p>
                        </div>
                      )}
                      {designer.address?.pincode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">PIN Code</label>
                          <p className="text-gray-900">{designer.address.pincode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products by {designer.companyName || designer.displayName || designer.name}
                </h2>
              </div>
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No products by this designer yet.</p>
                    <Link 
                      to="/products/new" 
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0d9488] hover:text-[#0f766e] transition-colors"
                    >
                      Add First Product
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Link 
                                to={`/products/${product.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-[#0d9488] transition-colors"
                              >
                                {product.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {product.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className="text-sm font-bold text-gray-900">{product.quantity}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <span className="text-sm font-medium text-gray-700">₹{product.cost?.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <span className="text-sm font-bold text-[#0d9488]">₹{product.price?.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <Link 
                                to={`/products/${product.id}/edit`}
                                className="text-[#0d9488] hover:text-[#0f766e] font-medium text-sm transition-colors"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <div className="mb-4">
                  {getStatusBadge(designer.status)}
                </div>
                <p className="text-xs text-gray-500">
                  {designer.status === 'active' ? 'This designer is currently active and can receive new product assignments.' : 'This designer is inactive and cannot receive new assignments.'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {products.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Products</span>
                      <span className="text-lg font-bold text-gray-900">{products.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Inventory</span>
                      <span className="text-lg font-bold text-gray-900">
                        {products.reduce((sum, p) => sum + p.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Portfolio Value</span>
                      <span className="text-lg font-bold text-[#0d9488]">
                        ₹{products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Member Since</h3>
                <p className="text-sm text-gray-900">
                  {new Date(designer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerShow;


