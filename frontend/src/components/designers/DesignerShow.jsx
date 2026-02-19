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
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    contactPersons: true,
    bankAccount: false,
    recordInfo: false,
    address: true,
    otherDetails: false,
    timeline: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    fetchDesigner();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'comments', name: 'Comments' },
    { id: 'transactions', name: 'Transactions' },
    { id: 'mails', name: 'Mails' },
    { id: 'statement', name: 'Statement' }
  ];

  const activities = [
    {
      id: 1,
      title: 'Contact person added',
      description: `Contact person ${designer.name} has been created`,
      user: 'Dharaneesh C',
      date: designer.createdAt
    },
    {
      id: 2,
      title: 'Contact added',
      description: 'Contact created',
      user: 'Dharaneesh C',
      date: designer.createdAt
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {designer.companyName || designer.displayName || designer.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Designer Profile & Product Portfolio</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link 
                to="/designers" 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Designers
              </Link>
              <Link 
                to={`/designers/${id}/edit`} 
                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded hover:bg-teal-700 transition-colors"
              >
                Edit Designer
              </Link>
              <button 
                onClick={handleDelete} 
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Sidebar */}
            <div className="space-y-3">
              {/* Portal Status */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Portal Status</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Disabled</span>
                </div>
              </div>

              {/* Vendor Language */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Vendor Language</h3>
                <p className="text-xs font-medium text-gray-900 dark:text-white">English</p>
              </div>

              {/* Contact Persons */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">CONTACT PERSONS</h3>
                  <div className="flex items-center gap-1.5">
                    <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs">+</button>
                    <button onClick={() => toggleSection('contactPersons')} className="text-gray-600 dark:text-gray-400 text-xs">
                      {expandedSections.contactPersons ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {expandedSections.contactPersons && (
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {designer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{designer.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{designer.email}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{designer.phone || 'No phone'}</p>
                        <button className="mt-1 text-xs text-teal-600 dark:text-teal-400 hover:underline">Invite to Portal</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Account Details */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">BANK ACCOUNT DETAILS</h3>
                  <div className="flex items-center gap-1.5">
                    <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs">+</button>
                    <button onClick={() => toggleSection('bankAccount')} className="text-gray-600 dark:text-gray-400 text-xs">
                      {expandedSections.bankAccount ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {expandedSections.bankAccount && (
                  <div className="p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">No bank account added yet</p>
                  </div>
                )}
              </div>

              {/* Record Info */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">RECORD INFO</h3>
                  <button onClick={() => toggleSection('recordInfo')} className="text-gray-600 dark:text-gray-400 text-xs">
                    {expandedSections.recordInfo ? '▲' : '▼'}
                  </button>
                </div>
                {expandedSections.recordInfo && (
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created By</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">System Admin</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created On</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {new Date(designer.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Modified</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {new Date(designer.updatedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">TIMELINE</h3>
                  <button onClick={() => toggleSection('timeline')} className="text-gray-600 dark:text-gray-400 text-xs">
                    {expandedSections.timeline ? '▲' : '▼'}
                  </button>
                </div>
                {expandedSections.timeline && (
                  <div className="p-3">
                    <div className="space-y-3">
                      {activities.map((activity, index) => (
                        <div key={activity.id} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date(activity.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date(activity.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded"></div>
                            </div>
                            {index < activities.length - 1 && (
                              <div className="w-px h-full bg-gray-300 dark:bg-gray-600 my-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">by {activity.user}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* What's Next Section */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">WHAT'S NEXT?</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Create a <span className="font-semibold">purchase order</span> or <span className="font-semibold">record a bill</span> for your vendor purchases.
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                    New Bill
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    New Purchase Order
                  </button>
                </div>
              </div>

              {/* Payment Due Period */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Payment due period</h3>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Due on Receipt</p>
              </div>

              {/* Payables */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payables</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Currency</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Outstanding Payables</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Unused Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">INR- Indian Rupee</td>
                        <td className="px-3 py-2 text-xs text-right font-medium text-gray-900 dark:text-white">₹0.00</td>
                        <td className="px-3 py-2 text-xs text-right font-medium text-gray-900 dark:text-white">₹0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">ADDRESS</h3>
                  <button onClick={() => toggleSection('address')} className="text-gray-600 dark:text-gray-400 text-xs">
                    {expandedSections.address ? '▲' : '▼'}
                  </button>
                </div>
                {expandedSections.address && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Billing Address */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Billing Address</h4>
                        {designer.street || designer.city || designer.state ? (
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                            {designer.street && <p>{designer.street}</p>}
                            {designer.city && <p>{designer.city}</p>}
                            {designer.state && <p>{designer.state} {designer.pincode}</p>}
                            {designer.country && <p>{designer.country}</p>}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            No Billing Address - <button className="text-teal-600 dark:text-teal-400 hover:underline">New Address</button>
                          </p>
                        )}
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No Shipping Address - <button className="text-teal-600 dark:text-teal-400 hover:underline">New Address</button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Details */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">OTHER DETAILS</h3>
                  <button onClick={() => toggleSection('otherDetails')} className="text-gray-600 dark:text-gray-400 text-xs">
                    {expandedSections.otherDetails ? '▲' : '▼'}
                  </button>
                </div>
                {expandedSections.otherDetails && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Company Name</label>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{designer.companyName || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{designer.displayName || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{designer.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                        <a 
                          href={`mailto:${designer.email}`}
                          className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          {designer.email}
                        </a>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{designer.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">GSTIN</label>
                        <p className="text-xs font-medium text-gray-900 dark:text-white font-mono">{designer.gstin || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <div>{getStatusBadge(designer.status)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Products by {designer.companyName || designer.displayName || designer.name}
                  </h3>
                </div>
                <div className="p-4">
                  {products.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No products by this designer yet.</p>
                      <Link 
                        to="/products/new" 
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        Add First Product
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-3 py-2 whitespace-nowrap">
                                <Link 
                                  to={`/products/${product.id}`}
                                  className="text-xs font-medium text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                  {product.name}
                                </Link>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                  {product.type}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{product.quantity}</span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">₹{product.cost?.toLocaleString()}</span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right">
                                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">₹{product.price?.toLocaleString()}</span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-center">
                                <Link 
                                  to={`/products/${product.id}/edit`}
                                  className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-xs transition-colors"
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
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Comments Yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comments and notes will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Transactions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Purchase orders and bills will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'mails' && (
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Mails</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email communications will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'statement' && (
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Statement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Account statement will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerShow;
