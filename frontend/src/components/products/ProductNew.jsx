import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';

const ProductNew = () => {
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      const response = await api.get('/designers');
      const activeDesigners = response.data.filter(d => d.status === 'active');
      setDesigners(activeDesigners);
    } catch (err) {
      setError('Failed to load designers');
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
    
    if (designers.length === 0) {
      alert('Please add a designer first!');
      navigate('/designers/new');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/products', formData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  const estimatedMarkup = formData.price && formData.cost ? formData.price - formData.cost : 0;
  const estimatedMargin = formData.cost > 0 && formData.price > 0 
    ? ((estimatedMarkup / formData.cost) * 100).toFixed(2) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 text-sm mt-1">Create a new jewellery product in your inventory</p>
            </div>
            <Link 
              to="/products" 
              className="btn-outline flex items-center text-sm px-3 py-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </Link>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {designers.length === 0 ? (
          <div className="card text-center p-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Designers Found</h3>
            <p className="text-gray-500 mb-6">You need to add at least one active designer before creating products</p>
            <Link to="/designers/new" className="btn-primary inline-block">
              Add Your First Designer
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Form - Takes 2.5 columns */}
              <div className="lg:col-span-3 space-y-4">
                {/* Basic Information */}
                <div className="card p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field text-sm"
                        placeholder="e.g., Diamond Eternity Ring"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Type/Category *
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="input-field text-sm"
                        placeholder="e.g., Ring, Necklace, Bracelet, Earrings"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="input-field text-sm"
                        rows="3"
                        placeholder="Enter detailed product description, materials, features, etc."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Designer *
                      </label>
                      <select
                        name="designer"
                        value={formData.designer}
                        onChange={handleChange}
                        className="input-field text-sm"
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
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Quantity in Stock *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="input-field text-sm"
                        min="0"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="card p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Pricing Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Cost Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="input-field text-sm"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="input-field text-sm"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Quick Pricing Suggestions */}
                  {formData.cost && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Suggested Pricing</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, price: (parseFloat(formData.cost) * 1.5).toFixed(2)})}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors"
                        >
                          50% Margin<br/>₹{(parseFloat(formData.cost) * 1.5).toFixed(0)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, price: (parseFloat(formData.cost) * 2).toFixed(2)})}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded text-green-700 transition-colors"
                        >
                          100% Margin<br/>₹{(parseFloat(formData.cost) * 2).toFixed(0)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, price: (parseFloat(formData.cost) * 2.5).toFixed(2)})}
                          className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-700 transition-colors"
                        >
                          150% Margin<br/>₹{(parseFloat(formData.cost) * 2.5).toFixed(0)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 flex items-center justify-center text-sm py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Create Product
                      </>
                    )}
                  </button>
                  <Link to="/products" className="btn-outline flex-1 text-center text-sm py-3">
                    Cancel
                  </Link>
                </div>
              </div>

              {/* Sidebar - Enhanced Features */}
              <div className="lg:col-span-1 space-y-4">
                {/* Price Calculator */}
                <div className="card p-4 sticky top-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Price Calculator
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Cost Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formData.cost ? `₹${parseFloat(formData.cost).toLocaleString()}` : '₹0'}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1">Selling Price</p>
                      <p className="text-xl font-bold text-yellow-700">
                        {formData.price ? `₹${parseFloat(formData.price).toLocaleString()}` : '₹0'}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Markup:</span>
                        <span className="font-bold text-green-600">
                          ₹{estimatedMarkup.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Margin:</span>
                        <span className="font-bold text-purple-600">
                          {estimatedMargin}%
                        </span>
                      </div>
                    </div>

                    {formData.quantity && formData.price && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Total Inventory Value</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{(formData.quantity * formData.price).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Preview */}
                <div className="card p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                      <p className="font-medium text-gray-800">
                        {formData.name || 'Product Name'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.type || 'Category'}
                      </p>
                    </div>
                    <div className="text-xs space-y-1 text-gray-600">
                      <div>Qty: <span className="font-medium">{formData.quantity || 0}</span></div>
                      <div>Designer: <span className="font-medium">
                        {designers.find(d => d._id === formData.designer)?.name || 'Not Selected'}
                      </span></div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="card p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Quick Tips
                  </h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Use clear, searchable product names</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Include materials and key features</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Standard jewellery markup: 100-200%</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>Consider seasonal pricing strategy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductNew;
