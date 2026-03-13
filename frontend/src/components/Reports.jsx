import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { HiDownload, HiFilter, HiX } from 'react-icons/hi';
import Alert from './Alert';

/**
 * Phase 3 - Enhanced Reports with Advanced Filters
 */
const Reports = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('top-customers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  // Filter States
  const [filters, setFilters] = useState({
    period: 30,
    startDate: '',
    endDate: '',
    customerId: '',
    productCategory: '',
    vendorId: '',
    limit: 20
  });

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      let params = {};

      switch (activeReport) {
        case 'top-customers':
          endpoint = '/dashboard/top-customers';
          params = { period: filters.period, limit: filters.limit };
          break;
        case 'product-profit':
          endpoint = '/dashboard/product-profit-report';
          params = { period: filters.period, limit: filters.limit };
          break;
        case 'fast-moving':
          endpoint = '/dashboard/fast-moving';
          params = { period: filters.period, limit: filters.limit };
          break;
        case 'slow-moving':
          endpoint = '/dashboard/slow-moving';
          params = { period: filters.period, limit: filters.limit };
          break;
        case 'dead-stock':
          endpoint = '/dashboard/dead-stock';
          params = { limit: filters.limit };
          break;
        default:
          endpoint = '/dashboard/top-customers';
      }

      const response = await api.get(endpoint, { params });
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchReport();
  };

  const clearFilters = () => {
    setFilters({
      period: 30,
      startDate: '',
      endDate: '',
      customerId: '',
      productCategory: '',
      vendorId: '',
      limit: 20
    });
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;

    let csv = '';
    let headers = [];
    let rows = [];

    switch (activeReport) {
      case 'top-customers':
        headers = ['Customer Name', 'Email', 'Phone', 'Purchase Count', 'Total Spent'];
        rows = reportData.map(item => [
          item.customer?.name || 'N/A',
          item.customer?.email || 'N/A',
          item.customer?.phone || 'N/A',
          item.dataValues?.purchaseCount || 0,
          `₹${parseFloat(item.dataValues?.totalSpent || 0).toFixed(2)}`
        ]);
        break;
      case 'product-profit':
        headers = ['Product Name', 'SKU', 'Designer', 'Units Sold', 'Revenue', 'Cost', 'Profit', 'Margin'];
        rows = reportData.map(item => [
          item.productName,
          item.sku,
          item.designer,
          item.totalSold,
          `₹${item.totalRevenue}`,
          `₹${item.totalCost}`,
          `₹${item.profit}`,
          item.profitMargin
        ]);
        break;
      case 'fast-moving':
        headers = ['Product Name', 'SKU', 'Designer', 'Units Sold', 'Revenue'];
        rows = reportData.map(item => [
          item.product?.name || 'N/A',
          item.product?.sku || 'N/A',
          item.product?.designer?.name || 'N/A',
          item.dataValues?.totalSold || 0,
          `₹${parseFloat(item.dataValues?.totalRevenue || 0).toFixed(2)}`
        ]);
        break;
      default:
        return;
    }

    csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const reportTypes = [
    { id: 'top-customers', name: 'Top Customers', icon: '' },
    { id: 'product-profit', name: 'Product Profit Analysis', icon: '' },
    { id: 'fast-moving', name: 'Fast Moving Items', icon: '' },
    { id: 'slow-moving', name: 'Slow Moving Items', icon: '' },
    { id: 'dead-stock', name: 'Dead Stock', icon: '' }
  ];

  const renderReportTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm">Loading report...</p>
          </div>
        </div>
      );
    }

    if (reportData.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm mt-2">Try adjusting the filters or select a different report type</p>
        </div>
      );
    }

    switch (activeReport) {
      case 'top-customers':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchases</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.map((item, index) => (
                  <tr key={item.customerId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      } font-bold text-sm`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.customer?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.customer?.email || '-'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.customer?.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.dataValues?.purchaseCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ₹{parseFloat(item.dataValues?.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'product-profit':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Units Sold</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {item.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.designer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {item.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      ₹{parseFloat(item.totalRevenue).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      ₹{parseFloat(item.totalCost).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                      ₹{parseFloat(item.profit).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600 dark:text-blue-400">
                      {item.profitMargin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'fast-moving':
      case 'slow-moving':
      case 'dead-stock':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                  {activeReport === 'fast-moving' && (
                    <>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Units Sold</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.map((item) => (
                  <tr key={item.id || item.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product?.name || item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {item.product?.sku || item.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.product?.designer?.name || item.designer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {item.product?.quantity || item.quantity || 0}
                    </td>
                    {activeReport === 'fast-moving' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600 dark:text-green-400">
                          {item.dataValues?.totalSold || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                          ₹{parseFloat(item.dataValues?.totalRevenue || 0).toLocaleString('en-IN')}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Report not configured</div>;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: 'url(/99172127-vector-jewelry-pattern-jewelry-seamless-background.jpg)',
          backgroundSize: '400px 400px'
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Business Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analytics and insights for your jewellery business
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Report Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveReport(type.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeReport === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400"
            >
              <HiFilter className="w-5 h-5" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <HiDownload className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>

          {showFilters && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Period (Days)
                  </label>
                  <select
                    value={filters.period}
                    onChange={(e) => handleFilterChange('period', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1F3A2E]"
                  >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={60}>Last 60 Days</option>
                    <option value={90}>Last 90 Days</option>
                    <option value={365}>Last Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Results Limit
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1F3A2E]"
                  >
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                    <option value={100}>Top 100</option>
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {renderReportTable()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
