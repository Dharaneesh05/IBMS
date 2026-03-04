import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { HiArrowLeft, HiSave } from 'react-icons/hi';

const RepairOrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    productName: '',
    productSKU: '',
    issueDescription: '',
    receivedDate: '',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    repairCharges: '',
    advancePayment: '',
    repairNotes: '',
    assignedTo: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchRepairOrder();
  }, [id]);

  const fetchRepairOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/repair-orders/${id}`);
      const order = response.data;
      
      // Format dates for input fields
      setFormData({
        ...order,
        receivedDate: order.receivedDate ? order.receivedDate.split('T')[0] : '',
        expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : '',
        actualDeliveryDate: order.actualDeliveryDate ? order.actualDeliveryDate.split('T')[0] : '',
        customerEmail: order.customerEmail || '',
        productSKU: order.productSKU || '',
        repairNotes: order.repairNotes || '',
        assignedTo: order.assignedTo || ''
      });
    } catch (err) {
      setError('Failed to load repair order');
      console.error('Error fetching repair order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBalance = () => {
    const charges = parseFloat(formData.repairCharges) || 0;
    const advance = parseFloat(formData.advancePayment) || 0;
    return (charges - advance).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.customerName.trim()) {
        throw new Error('Customer name is required');
      }
      if (!formData.customerPhone.trim()) {
        throw new Error('Customer phone is required');
      }
      if (!formData.productName.trim()) {
        throw new Error('Product name is required');
      }
      if (!formData.issueDescription.trim()) {
        throw new Error('Issue description is required');
      }
      if (!formData.expectedDeliveryDate) {
        throw new Error('Expected delivery date is required');
      }

      // Format data for submission
      const submitData = {
        ...formData,
        repairCharges: parseFloat(formData.repairCharges) || 0,
        advancePayment: parseFloat(formData.advancePayment) || 0,
        actualDeliveryDate: formData.actualDeliveryDate || null
      };

      await api.put(`/repair-orders/${id}`, submitData);
      navigate('/services/repair-orders');
    } catch (err) {
      setError(err.message || 'Failed to update repair order');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Delivered': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || colors['Pending'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading repair order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/services/repair-orders')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Back to Repair Orders"
            >
              <HiArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Repair Order
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order #{formData.orderNumber}
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(formData.status)}`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 space-y-6">
            {/* Status Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Order Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                {(formData.status === 'Completed' || formData.status === 'Delivered') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Actual Delivery Date
                    </label>
                    <input
                      type="date"
                      name="actualDeliveryDate"
                      value={formData.actualDeliveryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Product Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Gold Ring, Diamond Necklace"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product SKU (Optional)
                  </label>
                  <input
                    type="text"
                    name="productSKU"
                    value={formData.productSKU}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., RNG-22K-0001"
                  />
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Service Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the issue or service required"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repair Notes (Optional)
                  </label>
                  <textarea
                    name="repairNotes"
                    value={formData.repairNotes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Any additional notes or special instructions"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned To (Optional)
                  </label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Staff member name"
                  />
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Received Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="receivedDate"
                    value={formData.receivedDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    required
                    min={formData.receivedDate}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Financial Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repair Charges ($)
                  </label>
                  <input
                    type="number"
                    name="repairCharges"
                    value={formData.repairCharges}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Advance Payment ($)
                  </label>
                  <input
                    type="number"
                    name="advancePayment"
                    value={formData.advancePayment}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max={formData.repairCharges || undefined}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Balance Amount ($)
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold">
                    ${calculateBalance()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={() => navigate('/services/repair-orders')}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <HiSave className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairOrderEdit;
