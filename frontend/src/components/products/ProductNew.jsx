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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new jewellery product in your inventory</p>
            </div>
            <Link 
              to="/products" 
              className="btn-outline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Create Product
                      </>
                    )}
                  </button>
                  <Link to="/products" className="btn-outline flex-1 text-center">
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
