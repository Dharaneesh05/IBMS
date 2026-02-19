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
    designer: '',
    frontImage: null,
    rearImage: null,
    otherImages: [],
    returnable: 'yes',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnit: 'cm',
    weight: '',
    weightUnit: 'g',
    // Jewellery-specific fields
    metalType: '',
    purity: '',
    hallmarkCertified: 'no',
    certificationAuthority: '',
    grossWeight: '',
    stoneWeight: '',
    netMetalWeight: '',
    metalRate: '',
    makingCharges: '',
    makingChargesType: 'flat',
    stoneValue: '',
    gstPercent: '3',
    sku: '',
    occasion: '',
    gender: '',
    size: ''
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
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate net metal weight
      if (name === 'grossWeight' || name === 'stoneWeight') {
        const gross = parseFloat(name === 'grossWeight' ? value : prev.grossWeight) || 0;
        const stone = parseFloat(name === 'stoneWeight' ? value : prev.stoneWeight) || 0;
        updated.netMetalWeight = (gross - stone).toFixed(3);
      }
      
      // Auto-calculate final selling price
      if (name === 'metalRate' || name === 'netMetalWeight' || name === 'makingCharges' || name === 'makingChargesType' || name === 'stoneValue' || name === 'gstPercent') {
        const netWeight = parseFloat(name === 'netMetalWeight' ? value : updated.netMetalWeight) || 0;
        const metalRate = parseFloat(name === 'metalRate' ? value : prev.metalRate) || 0;
        const stoneValue = parseFloat(name === 'stoneValue' ? value : prev.stoneValue) || 0;
        const makingCharges = parseFloat(name === 'makingCharges' ? value : prev.makingCharges) || 0;
        const makingType = name === 'makingChargesType' ? value : prev.makingChargesType;
        const gstPercent = parseFloat(name === 'gstPercent' ? value : prev.gstPercent) || 0;
        
        const metalValue = netWeight * metalRate;
        const makingAmount = makingType === 'percentage' ? (metalValue * makingCharges / 100) : makingCharges;
        const subtotal = metalValue + makingAmount + stoneValue;
        const gstAmount = subtotal * gstPercent / 100;
        updated.price = (subtotal + gstAmount).toFixed(2);
      }
      
      return updated;
    });
  };

  const getPurityOptions = () => {
    switch(formData.metalType) {
      case 'Gold':
        return ['24K (999)', '22K (916)', '18K (750)', '14K (585)'];
      case 'Silver':
        return ['999 (Fine Silver)', '925 (Sterling)', '800'];
      case 'Platinum':
        return ['950', '900', '850'];
      case 'Diamond':
        return ['N/A'];
      default:
        return [];
    }
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      if (imageType === 'other') {
        setFormData({
          ...formData,
          otherImages: [...formData.otherImages, file]
        });
      } else {
        setFormData({
          ...formData,
          [imageType]: file
        });
      }
    }
  };

  const handleRemoveOtherImage = (index) => {
    const updatedImages = formData.otherImages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      otherImages: updatedImages
    });
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
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
      // Convert images to base64
      const productData = { ...formData };
      
      if (formData.frontImage) {
        productData.frontImage = await convertImageToBase64(formData.frontImage);
      }
      
      if (formData.rearImage) {
        productData.rearImage = await convertImageToBase64(formData.rearImage);
      }
      
      if (formData.otherImages && formData.otherImages.length > 0) {
        const otherImagesBase64 = await Promise.all(
          formData.otherImages.map(img => convertImageToBase64(img))
        );
        productData.otherImages = JSON.stringify(otherImagesBase64);
      }

      await api.post('/products', productData);
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none bg-repeat z-0"
        style={{
          backgroundImage: 'url(/99172127-vector-jewelry-pattern-jewelry-seamless-background.jpg)',
          backgroundSize: '300px 300px'
        }}
      />
      
      {/* Header with Price Calculator - Sticky */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Jewellery Product</h1>
            </div>
            
            {/* Price Calculator - Horizontal */}
            <div className="flex items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg px-6 py-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Cost Price</p>
                <p className="text-base font-bold text-gray-900">
                  ₹{formData.cost ? parseFloat(formData.cost).toLocaleString() : '0'}
                </p>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Selling Price</p>
                <p className="text-base font-bold text-gray-900">
                  ₹{formData.price ? parseFloat(formData.price).toLocaleString() : '0'}
                </p>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Markup</p>
                <p className="text-base font-bold text-gray-900">₹{estimatedMarkup.toLocaleString()}</p>
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Margin</p>
                <p className="text-base font-bold text-gray-900">{estimatedMargin}%</p>
              </div>
            </div>
            
            <Link 
              to="/products" 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-6 py-6 relative z-10">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {designers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Designers Found</h3>
            <p className="text-gray-600 mb-6">You need to add at least one active designer before creating products</p>
            <Link to="/designers/new" className="inline-block px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
              Add Your First Designer
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form Fields (2/3) */}
              <div className="lg:col-span-2 space-y-4">
                {/* Basic Information */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          <option key={designer.id} value={designer.id}>
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

                {/* Metal & Purity Information */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Metal & Purity</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Metal Type *
                      </label>
                      <select
                        name="metalType"
                        value={formData.metalType}
                        onChange={handleChange}
                        className="input-field text-sm"
                        required
                      >
                        <option value="">Select metal type</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Diamond">Diamond</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Purity / Karat *
                      </label>
                      <select
                        name="purity"
                        value={formData.purity}
                        onChange={handleChange}
                        className="input-field text-sm"
                        required
                        disabled={!formData.metalType}
                      >
                        <option value="">Select purity</option>
                        {getPurityOptions().map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                      {!formData.metalType && (
                        <p className="text-xs text-gray-500 mt-1">Select metal type first</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Hallmark Certified
                      </label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hallmarkCertified"
                            value="yes"
                            checked={formData.hallmarkCertified === 'yes'}
                            onChange={handleChange}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hallmarkCertified"
                            value="no"
                            checked={formData.hallmarkCertified === 'no'}
                            onChange={handleChange}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Certification Authority
                      </label>
                      <select
                        name="certificationAuthority"
                        value={formData.certificationAuthority}
                        onChange={handleChange}
                        className="input-field text-sm"
                      >
                        <option value="">Select authority</option>
                        <option value="BIS">BIS (Bureau of Indian Standards)</option>
                        <option value="IGI">IGI (International Gemological Institute)</option>
                        <option value="GIA">GIA (Gemological Institute of America)</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Weight Details */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Weight Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Gross Weight (g) *
                      </label>
                      <input
                        type="number"
                        name="grossWeight"
                        value={formData.grossWeight}
                        onChange={handleChange}
                        className="input-field text-sm"
                        step="0.001"
                        placeholder="0.000"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Total weight with stones</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Stone Weight (g/ct)
                      </label>
                      <input
                        type="number"
                        name="stoneWeight"
                        value={formData.stoneWeight}
                        onChange={handleChange}
                        className="input-field text-sm"
                        step="0.001"
                        placeholder="0.000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Weight of stones/gems</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Net Metal Weight (g)
                      </label>
                      <input
                        type="number"
                        name="netMetalWeight"
                        value={formData.netMetalWeight}
                        className="input-field text-sm bg-gray-50"
                        readOnly
                        placeholder="Auto-calculated"
                      />
                      <p className="text-xs text-teal-600 mt-1">✓ Auto-calculated</p>
                    </div>
                  </div>

                  {formData.grossWeight && formData.stoneWeight && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-sm text-indigo-800">
                        <strong>Net Metal:</strong> {formData.netMetalWeight}g = Gross ({formData.grossWeight}g) - Stone ({formData.stoneWeight}g)
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Product Details */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Additional Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        SKU / Item Code
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="input-field text-sm"
                        placeholder="e.g., GR-001-22K"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Occasion
                      </label>
                      <select
                        name="occasion"
                        value={formData.occasion}
                        onChange={handleChange}
                        className="input-field text-sm"
                      >
                        <option value="">Select occasion</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Daily Wear">Daily Wear</option>
                        <option value="Festive">Festive</option>
                        <option value="Party">Party</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="input-field text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        className="input-field text-sm"
                        placeholder="e.g., 7, 18 inches"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ring size, chain length, etc.</p>
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Product Images</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Front View */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Front View
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'frontImage')}
                          className="hidden"
                          id="frontImage"
                        />
                        <label htmlFor="frontImage" className="cursor-pointer flex flex-col items-center">
                          {formData.frontImage ? (
                            <div className="text-center">
                              <p className="text-sm text-gray-700 font-medium">{formData.frontImage.name}</p>
                              <p className="text-xs text-green-600 mt-1">Uploaded</p>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600">Click to upload</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Rear View */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rear View
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'rearImage')}
                          className="hidden"
                          id="rearImage"
                        />
                        <label htmlFor="rearImage" className="cursor-pointer flex flex-col items-center">
                          {formData.rearImage ? (
                            <div className="text-center">
                              <p className="text-sm text-gray-700 font-medium">{formData.rearImage.name}</p>
                              <p className="text-xs text-green-600 mt-1">Uploaded</p>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600">Click to upload</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Other Images */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Other Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'other')}
                          className="hidden"
                          id="otherImages"
                          multiple
                        />
                        <label htmlFor="otherImages" className="cursor-pointer flex flex-col items-center">
                          <p className="text-sm text-gray-600">Click to upload additional images</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                        </label>
                      </div>
                      {formData.otherImages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.otherImages.map((img, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs">
                              <span className="text-gray-700">{img.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveOtherImage(idx)}
                                className="text-red-600 hover:text-red-800 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cancellation and Returns */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Cancellation & Returns</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Returnable Item
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="returnable"
                          value="yes"
                          checked={formData.returnable === 'yes'}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#1a1d2e] focus:ring-[#1a1d2e]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="returnable"
                          value="no"
                          checked={formData.returnable === 'no'}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#1a1d2e] focus:ring-[#1a1d2e]"
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Dimensions</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Dimensions */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Dimensions (L × W × H)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="dimensionLength"
                          value={formData.dimensionLength}
                          onChange={handleChange}
                          className="input-field text-sm"
                          placeholder="L"
                          step="0.01"
                        />
                        <span className="text-gray-500 font-bold">×</span>
                        <input
                          type="number"
                          name="dimensionWidth"
                          value={formData.dimensionWidth}
                          onChange={handleChange}
                          className="input-field text-sm"
                          placeholder="W"
                          step="0.01"
                        />
                        <span className="text-gray-500 font-bold">×</span>
                        <input
                          type="number"
                          name="dimensionHeight"
                          value={formData.dimensionHeight}
                          onChange={handleChange}
                          className="input-field text-sm"
                          placeholder="H"
                          step="0.01"
                        />
                        <select
                          name="dimensionUnit"
                          value={formData.dimensionUnit}
                          onChange={handleChange}
                          className="input-field text-sm w-20"
                        >
                          <option value="cm">cm</option>
                          <option value="mm">mm</option>
                          <option value="in">in</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">For packaging and display purposes</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Pricing Breakdown</h2>
                  
                  <div className="space-y-3">
                    {/* Metal Rate and Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Metal Rate (₹/g) *
                        </label>
                        <input
                          type="number"
                          name="metalRate"
                          value={formData.metalRate}
                          onChange={handleChange}
                          className="input-field text-sm"
                          step="0.01"
                          placeholder="Current market rate"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Today's rate per gram</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Metal Value (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.netMetalWeight && formData.metalRate ? (parseFloat(formData.netMetalWeight) * parseFloat(formData.metalRate)).toFixed(2) : '0'}
                          className="input-field text-sm bg-gray-50"
                          readOnly
                        />
                        <p className="text-xs text-teal-600 mt-1">✓ Auto-calculated</p>
                      </div>
                    </div>

                    {/* Making Charges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Making Charges *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="makingCharges"
                            value={formData.makingCharges}
                            onChange={handleChange}
                            className="input-field text-sm flex-1"
                            step="0.01"
                            placeholder="0.00"
                            required
                          />
                          <select
                            name="makingChargesType"
                            value={formData.makingChargesType}
                            onChange={handleChange}
                            className="input-field text-sm w-24"
                          >
                            <option value="flat">₹ Flat</option>
                            <option value="percentage">% of Metal</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Stone Value (₹)
                        </label>
                        <input
                          type="number"
                          name="stoneValue"
                          value={formData.stoneValue}
                          onChange={handleChange}
                          className="input-field text-sm"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* GST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          GST % *
                        </label>
                        <select
                          name="gstPercent"
                          value={formData.gstPercent}
                          onChange={handleChange}
                          className="input-field text-sm"
                          required
                        >
                          <option value="0">0% - No GST</option>
                          <option value="3">3% - Gold/Silver Jewellery</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Final Selling Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          className="input-field text-sm bg-yellow-50 font-bold text-green-700"
                          readOnly
                        />
                        <p className="text-xs text-teal-600 mt-1">✓ Auto-calculated with GST</p>
                      </div>
                    </div>

                    {/* Price Summary */}
                    {formData.metalRate && formData.netMetalWeight && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="text-sm font-semibold text-green-800 mb-3">💰 Price Calculation Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Metal Value ({formData.netMetalWeight}g × ₹{formData.metalRate})</span>
                            <span className="font-medium">₹{(parseFloat(formData.netMetalWeight) * parseFloat(formData.metalRate)).toFixed(2)}</span>
                          </div>
                          {formData.makingCharges && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Making Charges</span>
                              <span className="font-medium">
                                ₹{formData.makingChargesType === 'flat' 
                                  ? parseFloat(formData.makingCharges).toFixed(2)
                                  : ((parseFloat(formData.netMetalWeight) * parseFloat(formData.metalRate) * parseFloat(formData.makingCharges) / 100).toFixed(2))
                                }
                              </span>
                            </div>
                          )}
                          {formData.stoneValue && parseFloat(formData.stoneValue) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Stone Value</span>
                              <span className="font-medium">₹{parseFloat(formData.stoneValue).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-green-200 pt-2 flex items-center justify-between">
                            <span className="text-gray-700">Subtotal</span>
                            <span className="font-medium">
                              ₹{(() => {
                                const metalValue = parseFloat(formData.netMetalWeight) * parseFloat(formData.metalRate);
                                const makingAmount = formData.makingChargesType === 'flat' 
                                  ? parseFloat(formData.makingCharges || 0)
                                  : (metalValue * parseFloat(formData.makingCharges || 0) / 100);
                                return (metalValue + makingAmount + parseFloat(formData.stoneValue || 0)).toFixed(2);
                              })()}
                            </span>
                          </div>
                          {formData.gstPercent && parseFloat(formData.gstPercent) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">GST ({formData.gstPercent}%)</span>
                              <span className="font-medium">
                                ₹{(() => {
                                  const metalValue = parseFloat(formData.netMetalWeight) * parseFloat(formData.metalRate);
                                  const makingAmount = formData.makingChargesType === 'flat' 
                                    ? parseFloat(formData.makingCharges || 0)
                                    : (metalValue * parseFloat(formData.makingCharges || 0) / 100);
                                  const subtotal = metalValue + makingAmount + parseFloat(formData.stoneValue || 0);
                                  return (subtotal * parseFloat(formData.gstPercent) / 100).toFixed(2);
                                })()}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-green-300 pt-2 flex items-center justify-between">
                            <span className="text-green-800 font-bold">Final Selling Price</span>
                            <span className="text-lg font-bold text-green-700">₹{formData.price || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Price (Optional) */}
                    <div className="pt-3 border-t border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Cost Price (₹) <span className="text-gray-500 font-normal">(Optional - for margin calculation)</span>
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="input-field text-sm"
                        step="0.01"
                        placeholder="Your purchase/manufacturing cost"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Product'}
                  </button>
                  <Link to="/products" className="flex-1 text-center px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Cancel
                  </Link>
                </div>
              </div>

              {/* Right Column - Product Preview (1/3) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm sticky top-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Product Preview</h3>
                  
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                    {formData.frontImage ? (
                      <img src={URL.createObjectURL(formData.frontImage)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">No image</p>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Product Name</p>
                      <p className="text-sm font-bold text-gray-900">{formData.name || 'Not set'}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-sm font-medium text-gray-900">{formData.type || 'Not set'}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Metal</p>
                      <p className="text-sm font-medium text-gray-900">{formData.metalType || 'Not set'}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Purity</p>
                      <p className="text-sm font-medium text-gray-900">{formData.purity || 'Not set'}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Net Weight</p>
                      <p className="text-sm font-medium text-gray-900">{formData.netMetalWeight || '0'}g</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="text-sm font-medium text-gray-900">{formData.quantity || '0'} pcs</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                      <p className="text-xs text-gray-500 mb-1">Final Price</p>
                      <p className="text-lg font-bold text-gray-900">₹{formData.price ? parseFloat(formData.price).toLocaleString() : '0'}</p>
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


