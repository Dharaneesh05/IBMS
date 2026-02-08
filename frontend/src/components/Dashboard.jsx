import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Dropdown from './Dropdown';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Period filters for each section
  const [topSellingPeriod, setTopSellingPeriod] = useState('This Month');
  const [topStockedPeriod, setTopStockedPeriod] = useState('As of This Month');
  const [salesChannelPeriod, setSalesChannelPeriod] = useState('This Month');
  const [salesOrderPeriod, setSalesOrderPeriod] = useState('This Month');
  const [topVendorsPeriod, setTopVendorsPeriod] = useState('This Month');
  const [receiveHistoryPeriod, setReceiveHistoryPeriod] = useState('This Month');
  
  // View modes for toggleable sections
  const [topStockedView, setTopStockedView] = useState('quantity');
  const [salesOrderView, setSalesOrderView] = useState('quantity');
  const [topVendorsView, setTopVendorsView] = useState('quantity');
  
  const [activeSection, setActiveSection] = useState('pending');

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: 'update',
      title: 'General Preferences Updated.',
      user: 'Dharaneesh C',
      timestamp: '04/02/2026 12:02 PM',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    },
    {
      id: 2,
      type: 'security',
      title: "Organization's Personally identifiable information (PII) has been updated",
      user: 'Dharaneesh C',
      timestamp: '04/02/2026 12:01 PM',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    }
  ];

  // Period options
  const periodOptions = [
    'Today',
    'Yesterday',
    'This Week',
    'This Month',
    'This Year',
    'Previous Week',
    'Previous Month',
    'Previous Year',
    'Custom'
  ];

  const stockedPeriodOptions = [
    'As of Today',
    'As of This Week',
    'As of This Month',
    'As of This Year'
  ];

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const response = await api.get('/dashboard');
      setMetrics(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard metrics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Selling Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Selling Items</h2>
                <Dropdown 
                  value={topSellingPeriod}
                  onChange={setTopSellingPeriod}
                  options={periodOptions}
                  size="sm"
                />
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600">You do not have any top selling items yet.</p>
              </div>
            </div>

            {/* Top Stocked Items and Sales by Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Top Stocked Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Top Stocked Items</h2>
                  <Dropdown 
                    value={topStockedPeriod}
                    onChange={setTopStockedPeriod}
                    options={stockedPeriodOptions}
                    size="xs"
                  />
                </div>
                <div className="p-4">
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setTopStockedView('quantity')}
                      className={`px-4 py-1.5 text-sm font-medium rounded ${
                        topStockedView === 'quantity'
                          ? 'bg-[#1a1d2e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      By Quantity
                    </button>
                    <button
                      onClick={() => setTopStockedView('value')}
                      className={`px-4 py-1.5 text-sm font-medium rounded ${
                        topStockedView === 'value'
                          ? 'bg-[#1a1d2e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      By Value
                    </button>
                  </div>
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-600">
                      {topStockedView === 'quantity' 
                        ? 'No items stocked during this period (by quantity).'
                        : 'No items stocked during this period (by value).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sales by Channel */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Sales By Channel</h2>
                  <Dropdown 
                    value={salesChannelPeriod}
                    onChange={setSalesChannelPeriod}
                    options={periodOptions}
                    size="xs"
                  />
                </div>
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600">No sales data found during this period.</p>
                </div>
              </div>
            </div>

            {/* Sales Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Sales Order Summary</h2>
                <Dropdown 
                  value={salesOrderPeriod}
                  onChange={setSalesOrderPeriod}
                  options={periodOptions}
                  size="xs"
                />
              </div>
              <div className="p-4">
                <div className="flex space-x-2 mb-4">
                  <button 
                    onClick={() => setSalesOrderView('quantity')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      salesOrderView === 'quantity'
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    By Quantity
                  </button>
                  <button 
                    onClick={() => setSalesOrderView('value')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      salesOrderView === 'value'
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    By Value
                  </button>
                </div>
                
                {/* Chart Area */}
                <div className="relative h-48 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {salesOrderView === 'quantity'
                        ? 'No sales orders created during this period (by quantity).'
                        : 'No sales orders created during this period (by value).'}
                    </p>
                  </div>
                </div>
                
                {/* X-axis dates */}
                <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
                  <span>01 Feb</span>
                  <span>05 Feb</span>
                  <span>09 Feb</span>
                  <span>13 Feb</span>
                  <span>17 Feb</span>
                  <span>21 Feb</span>
                  <span>25 Feb</span>
                  <span>27 Feb</span>
                </div>
              </div>
            </div>

            {/* Top Vendors and Receive History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Top Vendors */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Top Vendors</h2>
                  <Dropdown 
                    value={topVendorsPeriod}
                    onChange={setTopVendorsPeriod}
                    options={periodOptions}
                    size="xs"
                  />
                </div>
                <div className="p-4">
                  <div className="flex space-x-2 mb-4">
                    <button 
                      onClick={() => setTopVendorsView('quantity')}
                      className={`px-4 py-1.5 text-sm font-medium rounded ${
                        topVendorsView === 'quantity'
                          ? 'bg-[#1a1d2e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      By Quantity
                    </button>
                    <button 
                      onClick={() => setTopVendorsView('value')}
                      className={`px-4 py-1.5 text-sm font-medium rounded ${
                        topVendorsView === 'value'
                          ? 'bg-[#1a1d2e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      By Value
                    </button>
                  </div>
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-600">
                      {topVendorsView === 'quantity'
                        ? 'No vendor activity found for this period (by quantity).'
                        : 'No vendor activity found for this period (by value).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receive History */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Receive History</h2>
                  <Dropdown 
                    value={receiveHistoryPeriod}
                    onChange={setReceiveHistoryPeriod}
                    options={periodOptions}
                    size="xs"
                  />
                </div>
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600">No purchase receives found for this period.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Stats Card - Moved to top */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="text-lg font-bold text-gray-900">{metrics.totalItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Stock</span>
                  <span className="text-lg font-bold text-gray-900">{metrics.totalStock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low Stock</span>
                  <span className="text-lg font-bold text-orange-600">{metrics.lowStockCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Out of Stock</span>
                  <span className="text-lg font-bold text-red-600">{metrics.outOfStockCount}</span>
                </div>
              </div>
              <Link 
                to="/products" 
                className="mt-4 block w-full text-center bg-[#1a1d2e] hover:opacity-90 text-white text-sm font-medium py-2 rounded transition-opacity"
              >
                View All Products
              </Link>
            </div>

            {/* Pending Actions / Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveSection('pending')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeSection === 'pending'
                        ? 'text-[#1a1d2e] border-b-2 border-[#1a1d2e]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pending Actions
                  </button>
                  <button
                    onClick={() => setActiveSection('recent')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeSection === 'recent'
                        ? 'text-[#1a1d2e] border-b-2 border-[#1a1d2e]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Recent Activities
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {activeSection === 'pending' ? (
                  <>
                    {/* SALES Section */}
                    <div>
                      <div className="flex items-center mb-3">
                        <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase">SALES</h3>
                      </div>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">To Be Packed</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">To Be Shipped</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">To Be Delivered</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">To Be Invoiced</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                      </div>
                    </div>

                    {/* PURCHASES Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-3">
                        <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase">PURCHASES</h3>
                      </div>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">To Be Received</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">Receive In Progress</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                      </div>
                    </div>

                    {/* INVENTORY Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-3">
                        <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase">INVENTORY</h3>
                      </div>
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center justify-between text-sm">
                          <button className="text-gray-600 hover:text-blue-600">Below Reorder Level</button>
                          <span className="text-gray-900 font-medium">0.00</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Recent Activities */
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activity.icon} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {activity.title} <span className="font-medium">By {activity.user}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
