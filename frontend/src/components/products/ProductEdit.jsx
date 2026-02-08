import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designers, setDesigners] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    quantity: '',
    cost: '',
    price: '',
    designer: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchDesigners();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      const data = {
        name: product.name,
        type: product.type,
        description: product.description,
        quantity: product.quantity,
        cost: product.cost,
        price: product.price,
        designer: product.designer?._id || ''
      };
      setFormData(data);
      setOriginalData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load product');
      setLoading(false);
    }
  };

  const fetchDesigners = async () => {
    try {
      const response = await api.get('/designers');
      setDesigners(response.data);
    } catch (err) {
      console.error('Failed to load designers');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put(`/products/${id}`, formData);
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const estimatedMarkup = formData.price && formData.cost ? formData.price - formData.cost : 0;
  const estimatedMargin = formData.cost > 0 && formData.price > 0 
    ? ((estimatedMarkup / formData.cost) * 100).toFixed(2) 
    : 0;

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product information and pricing</p>
            </div>
            <Link 
              to={`/products/${id}`}
              className="btn-outline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Product
            </Link>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {hasChanges && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-700">You have unsaved changes</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Diamond Eternity Ring"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type/Category *
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Ring, Necklace, Bracelet, Earrings"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input-field"
                      rows="4"
                      placeholder="Enter detailed product description, materials, features, etc."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Designer *
                    </label>
                    <select
                      name="designer"
                      value={formData.designer}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select a designer</option>
                      {designers.map((designer) => (
                        <option key={designer._id} value={designer._id}>
                          {designer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory & Pricing */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory & Pricing</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity in Stock *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cost Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="input-field"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1 flex items-center justify-center"
                  disabled={submitting || !hasChanges}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {hasChanges ? 'Update Product' : 'No Changes'}
                    </>
                  )}
                </button>
                <Link to={`/products/${id}`} className="btn-outline flex-1 text-center">
                  Cancel
                </Link>
              </div>
            </div>

            {/* Sidebar - Price Calculator */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Price Calculator</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Cost Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formData.cost ? `₹${parseFloat(formData.cost).toLocaleString()}` : '₹0'}
                    </p>
                  </div>

                  <div className="bg-gold-50 p-4 rounded-lg border-2 border-gold-200">
                    <p className="text-xs text-gray-600 mb-1">Selling Price</p>
                    <p className="text-2xl font-bold text-gold-600">
                      {formData.price ? `₹${parseFloat(formData.price).toLocaleString()}` : '₹0'}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Markup:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{estimatedMarkup.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Margin:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {estimatedMargin}%
                      </span>
                    </div>
                  </div>

                  {formData.quantity && formData.price && (
                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                      <p className="text-xs text-gray-600 mb-1">Total Inventory Value</p>
                      <p className="text-xl font-bold text-blue-600">
                        ₹{(formData.quantity * formData.price).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {hasChanges && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">Changes Detected</p>
                    <p className="text-xs text-yellow-700">Review your changes and click "Update Product" to save</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
