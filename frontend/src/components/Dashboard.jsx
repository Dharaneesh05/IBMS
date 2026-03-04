import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Dropdown from './Dropdown';
import { HiShoppingBag, HiShoppingCart, HiCube, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phase 3 - New state for analytics
  const [todaySummary, setTodaySummary] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [fastMoving, setFastMoving] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [monthlySalesChart, setMonthlySalesChart] = useState([]);
  const [salesVsPurchases, setSalesVsPurchases] = useState([]);
  const [stockPredictions, setStockPredictions] = useState([]);
  
  // Period filters for each section
  const [topSellingPeriod, setTopSellingPeriod] = useState('This Month');
  const [topStockedPeriod, setTopStockedPeriod] = useState('As of This Month');
  const [salesOrderPeriod, setSalesOrderPeriod] = useState('This Month');
  const [topVendorsPeriod, setTopVendorsPeriod] = useState('This Month');
  const [receiveHistoryPeriod, setReceiveHistoryPeriod] = useState('This Month');
  
  // View modes for toggleable sections
  const [topStockedView, setTopStockedView] = useState('quantity');
  const [salesOrderView, setSalesOrderView] = useState('quantity');
  const [topVendorsView, setTopVendorsView] = useState('quantity');
  
  // Sales chart interactivity
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredSalesVsPurchase, setHoveredSalesVsPurchase] = useState(null);
  
  // Sample sales data points (in real app, this comes from API)
  const salesDataPoints = [
    { date: '01 Feb', sales: 48000, invoices: 2, x: 0, y: 120 },
    { date: '05 Feb', sales: 55000, invoices: 3, x: 37.5, y: 100 },
    { date: '09 Feb', sales: 62000, invoices: 4, x: 75, y: 85 },
    { date: '13 Feb', sales: 58000, invoices: 3, x: 112.5, y: 95 },
    { date: '17 Feb', sales: 72000, invoices: 5, x: 150, y: 70 },
    { date: '21 Feb', sales: 78000, invoices: 6, x: 187.5, y: 60 },
    { date: '25 Feb', sales: 68000, invoices: 4, x: 225, y: 75 },
    { date: '27 Feb', sales: 85000, invoices: 7, x: 262.5, y: 50 },
    { date: '28 Feb', sales: 89000, invoices: 7, x: 300, y: 45 }
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
    fetchPhase3Analytics();
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

  // Phase 3 - Fetch all analytics data
  const fetchPhase3Analytics = async () => {
    try {
      const [
        summaryRes,
        inventoryRes,
        fastMovingRes,
        slowMovingRes,
        deadStockRes,
        monthlyChartRes,
        salesVsPurchasesRes,
        stockPredictionRes
      ] = await Promise.all([
        api.get('/dashboard/today-summary').catch(() => ({ data: null })),
        api.get('/dashboard/inventory-value').catch(() => ({ data: null })),
        api.get('/dashboard/fast-moving?period=30&limit=5').catch(() => ({ data: [] })),
        api.get('/dashboard/slow-moving?period=30&limit=10').catch(() => ({ data: [] })),
        api.get('/dashboard/dead-stock?limit=10').catch(() => ({ data: [] })),
        api.get('/dashboard/monthly-sales-chart?months=6').catch(() => ({ data: [] })),
        api.get('/dashboard/sales-vs-purchases?months=6').catch(() => ({ data: [] })),
        api.get('/dashboard/stock-prediction?daysToAnalyze=30&predictDays=7').catch(() => ({ data: [] }))
      ]);

      setTodaySummary(summaryRes.data);
      setInventoryValue(inventoryRes.data);
      setFastMoving(fastMovingRes.data);
      setSlowMoving(slowMovingRes.data);
      setDeadStock(deadStockRes.data);
      setMonthlySalesChart(monthlyChartRes.data);
      setSalesVsPurchases(salesVsPurchasesRes.data);
      setStockPredictions(stockPredictionRes.data);
    } catch (err) {
      console.error('Error fetching Phase 3 analytics:', err);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Helper function to format month
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full relative">
      {/* Background Pattern with Higher Opacity */}
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: 'url(/99172127-vector-jewelry-pattern-jewelry-seamless-background.jpg)',
          backgroundSize: '400px 400px'
        }}
      />
      <div className="px-6 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Snapshot - New Section with REAL Phase 3 Data */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg shadow-sm border border-teal-100 dark:border-teal-800/30 p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Today's Business Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Quick overview of today's business activity</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Profit Today</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {todaySummary ? formatCurrency(todaySummary.today?.profit || 0) : '₹0'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenue minus cost</p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sales Today</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {todaySummary ? formatCurrency(todaySummary.today?.revenue || 0) : '₹0'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total sales value for today</p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Invoices Generated</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {todaySummary?.today?.invoices || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Number of bills created today</p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Items Sold</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {todaySummary?.today?.itemsSold || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total jewellery pieces sold today</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-800/30">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium flex items-center justify-center">
                  Compared to yesterday: 
                  {todaySummary?.comparison?.trend === 'up' ? (
                    <span className="text-green-600 dark:text-green-400 font-bold ml-2 flex items-center">
                      <HiTrendingUp className="w-4 h-4 mr-1" />
                      +{formatCurrency(todaySummary?.comparison?.revenueChange || 0)} 
                      ({todaySummary?.comparison?.revenueChangePercent}%)
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-bold ml-2 flex items-center">
                      <HiTrendingDown className="w-4 h-4 mr-1" />
                      {formatCurrency(todaySummary?.comparison?.revenueChange || 0)}
                      ({todaySummary?.comparison?.revenueChangePercent}%)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Smart Inventory Analytics - Phase 3 with REAL DATA */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Smart Inventory Insights
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Business intelligence analytics</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fast Moving Items */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fast Moving</h3>
                    <span className="text-green-600 dark:text-green-400">High Stock</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fastMoving.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Items sold frequently</p>
                  {fastMoving.length > 0 && (
                    <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                      Top: {fastMoving[0]?.product?.name}
                    </div>
                  )}
                  <button 
                    onClick={() => navigate('/inventory/stock-levels?view=fast-moving')}
                    className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    View Details →
                  </button>
                </div>

                {/* Slow Moving Items */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Slow Moving</h3>
                    <span className="text-yellow-600 dark:text-yellow-400">Low Stock</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{slowMoving.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Not sold in 30 days</p>
                  {slowMoving.length > 0 && (
                    <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                      {slowMoving[0]?.name}
                    </div>
                  )}
                  <button 
                    onClick={() => navigate('/inventory/stock-levels?view=slow-moving')}
                    className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:underline font-medium"
                  >
                    View Details →
                  </button>
                </div>

                {/* Dead Stock */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dead Stock</h3>
                    <span className="text-red-600 dark:text-red-400">Critical</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{deadStock.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Never been sold</p>
                  {deadStock.length > 0 && (
                    <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                      {deadStock[0]?.name}
                    </div>
                  )}
                  <button 
                    onClick={() => navigate('/inventory/stock-levels?view=dead-stock')}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    View Details →
                  </button>
                </div>

                {/* Inventory Value */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Value</h3>
                    <span className="text-blue-600 dark:text-blue-400">Premium</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {inventoryValue ? formatCurrency(inventoryValue.totalCostValue) : '₹0'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Current inventory worth</p>
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                    Potential: {inventoryValue ? formatCurrency(inventoryValue.totalSellingValue) : '₹0'}
                  </div>
                </div>
              </div>

              {/* Stock Prediction Alerts */}
              {stockPredictions.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center">
                    Stock Reorder Alerts ({stockPredictions.length})
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {stockPredictions.slice(0, 3).map((prediction, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 p-2 rounded">
                        <div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{prediction.productName}</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            ({prediction.daysRemaining} days remaining)
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          prediction.riskLevel === 'critical' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-orange-500 text-white'
                        }`}>
                          {prediction.recommendation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Top Selling Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Best Selling Jewellery</h2>
                <Dropdown 
                  value={topSellingPeriod}
                  onChange={setTopSellingPeriod}
                  options={periodOptions}
                  size="sm"
                />
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Showing data for:</span> <span className="font-medium">{topSellingPeriod}</span>
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {/* Rank 1 */}
                  <div className="flex items-center space-x-3 group relative">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">1</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <button 
                          onClick={() => navigate('/products/1')}
                          className="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          title="Click to view product details"
                        >
                          Classic Gold Ring
                        </button>
                        <span className="text-base font-bold text-gray-900 dark:text-white">14 sold</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer" title="Sold: 14 | Revenue: ₹4,20,000 | Avg price: ₹30,000">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute left-8 top-8 z-50 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg whitespace-nowrap">
                      Sold: 14 | Revenue: ₹4,20,000 | Avg price: ₹30,000
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                    </div>
                  </div>
                  {/* Rank 2 */}
                  <div className="flex items-center space-x-3 group relative">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-bold">2</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <button 
                          onClick={() => navigate('/products/2')}
                          className="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          title="Click to view product details"
                        >
                          Gold Chain
                        </button>
                        <span className="text-base font-bold text-gray-900 dark:text-white">6 sold</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer" title="Sold: 6 | Revenue: ₹1,80,000 | Avg price: ₹30,000">
                        <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-2 rounded-full" style={{width: '43%'}}></div>
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute left-8 top-8 z-50 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg whitespace-nowrap">
                      Sold: 6 | Revenue: ₹1,80,000 | Avg price: ₹30,000
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                    </div>
                  </div>
                  {/* Rank 3 */}
                  <div className="flex items-center space-x-3 group relative">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xs font-bold">3</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <button 
                          onClick={() => navigate('/products/3')}
                          className="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          title="Click to view product details"
                        >
                          Silver Anklet
                        </button>
                        <span className="text-base font-bold text-gray-900 dark:text-white">3 sold</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer" title="Sold: 3 | Revenue: ₹90,000 | Avg price: ₹30,000">
                        <div className="bg-gradient-to-r from-orange-300 to-orange-500 h-2 rounded-full" style={{width: '21%'}}></div>
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute left-8 top-8 z-50 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg whitespace-nowrap">
                      Sold: 3 | Revenue: ₹90,000 | Avg price: ₹30,000
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                    Gold rings are the fastest moving items this month.
                  </p>
                </div>
              </div>
            </div>

            {/* PHASE 3 - Monthly Sales Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Sales Trend</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Revenue performance over the last 6 months</p>
              </div>
              <div className="p-6">
                {monthlySalesChart.length > 0 ? (
                  <>
                    <div className="relative h-64 border border-gray-200 dark:border-gray-700 rounded bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 p-4">
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="400" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        <line x1="40" y1="60" x2="400" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        <line x1="40" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        <line x1="40" y1="140" x2="400" y2="140" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        <line x1="40" y1="180" x2="400" y2="180" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        
                        {/* Y-axis */}
                        <line x1="40" y1="10" x2="40" y2="190" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600"/>
                        
                        {/* X-axis */}
                        <line x1="35" y1="180" x2="400" y2="180" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600"/>
                        
                        {/* Bars */}
                        {(() => {
                          const maxRevenue = Math.max(...monthlySalesChart.map(d => parseFloat(d.totalRevenue)));
                          const barWidth = 40;
                          const spacing = (360 - (barWidth * monthlySalesChart.length)) / (monthlySalesChart.length + 1);
                          
                          return monthlySalesChart.map((data, idx) => {
                            const revenue = parseFloat(data.totalRevenue);
                            const barHeight = (revenue / maxRevenue) * 150;
                            const x = 40 + spacing + (idx * (barWidth + spacing));
                            const y = 180 - barHeight;
                            
                            return (
                              <g key={idx}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barWidth}
                                  height={barHeight}
                                  fill="url(#barGradient)"
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                  rx="2"
                                />
                                <text
                                  x={x + barWidth / 2}
                                  y={y - 5}
                                  textAnchor="middle"
                                  className="text-[8px] fill-gray-700 dark:fill-gray-300 font-semibold"
                                >
                                  {formatCurrency(revenue)}
                                </text>
                              </g>
                            );
                          });
                        })()}
                        
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 1}} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="flex justify-around mt-3 text-xs text-gray-600 dark:text-gray-400">
                      {monthlySalesChart.map((data, idx) => (
                        <span key={idx} className="font-medium">{formatMonth(data.month)}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No sales data available for the selected period
                  </div>
                )}
              </div>
            </div>

            {/* PHASE 3 - Sales vs Purchases Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales vs Purchases Analysis</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Business cash flow comparison</p>
              </div>
              <div className="p-6">
                {salesVsPurchases.length > 0 ? (
                  <>
                    <div className="relative h-64 border border-gray-200 dark:border-gray-700 rounded bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 p-4">
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                        {/* Grid lines */}
                        {[20, 60, 100, 140, 180].map((y, idx) => (
                          <line key={idx} x1="40" y1={y} x2="400" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        ))}
                        
                        {/* Y-axis */}
                        <line x1="40" y1="10" x2="40" y2="190" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600"/>
                        
                        {/* X-axis */}
                        <line x1="35" y1="180" x2="400" y2="180" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600"/>
                        
                        {/* Bars - Sales and Purchases */}
                        {(() => {
                          const maxValue = Math.max(...salesVsPurchases.flatMap(d => [d.sales, d.purchases]));
                          const barWidth = 20;
                          const groupSpacing = 50;
                          
                          return salesVsPurchases.map((data, idx) => {
                            const salesHeight = (data.sales / maxValue) * 150;
                            const purchasesHeight = (data.purchases / maxValue) * 150;
                            const xBase = 60 + (idx * groupSpacing);
                            
                            return (
                              <g key={idx}>
                                {/* Sales bar (green) */}
                                <rect
                                  x={xBase}
                                  y={180 - salesHeight}
                                  width={barWidth}
                                  height={salesHeight}
                                  fill="#10b981"
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                  rx="2"
                                  onMouseEnter={() => setHoveredSalesVsPurchase(idx)}
                                  onMouseLeave={() => setHoveredSalesVsPurchase(null)}
                                />
                                
                                {/* Purchases bar (orange) */}
                                <rect
                                  x={xBase + barWidth + 3}
                                  y={180 - purchasesHeight}
                                  width={barWidth}
                                  height={purchasesHeight}
                                  fill="#f59e0b"
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                  rx="2"
                                  onMouseEnter={() => setHoveredSalesVsPurchase(idx)}
                                  onMouseLeave={() => setHoveredSalesVsPurchase(null)}
                                />
                              </g>
                            );
                          });
                        })()}
                      </svg>
                      
                      {/* Tooltip */}
                      {hoveredSalesVsPurchase !== null && salesVsPurchases[hoveredSalesVsPurchase] && (
                        <div 
                          className="absolute bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg z-50"
                          style={{
                            left: '50%',
                            top: '20%',
                            transform: 'translateX(-50%)'
                          }}
                        >
                          <div className="font-semibold mb-1">{formatMonth(salesVsPurchases[hoveredSalesVsPurchase].month)}</div>
                          <div className="text-green-400">Sales: {formatCurrency(salesVsPurchases[hoveredSalesVsPurchase].sales)}</div>
                          <div className="text-orange-400">Purchases: {formatCurrency(salesVsPurchases[hoveredSalesVsPurchase].purchases)}</div>
                          <div className="mt-1 pt-1 border-t border-gray-600">
                            Margin: {formatCurrency(salesVsPurchases[hoveredSalesVsPurchase].sales - salesVsPurchases[hoveredSalesVsPurchase].purchases)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="flex justify-around mt-3 text-xs text-gray-600 dark:text-gray-400">
                      {salesVsPurchases.map((data, idx) => (
                        <span key={idx} className="font-medium">{formatMonth(data.month)}</span>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Sales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Purchases</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No comparison data available for the selected period
                  </div>
                )}
              </div>
            </div>

            {/* Sales Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Sales's Trend</h2>
                <Dropdown 
                  value={salesOrderPeriod}
                  onChange={setSalesOrderPeriod}
                  options={periodOptions}
                  size="xs"
                />
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Showing data for:</span> <span className="font-medium">{salesOrderPeriod}</span>
                </p>
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
                
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Invoices</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">28</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Sales</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">₹14,85,000</p>
                  </div>
                </div>
                
                {/* Chart Area - Simple Line Visualization */}
                <div className="relative h-48 border border-gray-200 dark:border-gray-700 rounded bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 p-4">
                  <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="300" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <line x1="0" y1="90" x2="300" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <line x1="0" y1="120" x2="300" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    
                    {/* Line chart */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      points="0,120 37.5,100 75,85 112.5,95 150,70 187.5,60 225,75 262.5,50 300,45"
                    />
                    
                    {/* Area fill */}
                    <polygon
                      fill="url(#gradient)"
                      opacity="0.3"
                      points="0,120 37.5,100 75,85 112.5,95 150,70 187.5,60 225,75 262.5,50 300,45 300,150 0,150"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.5}} />
                        <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0}} />
                      </linearGradient>
                    </defs>
                    
                    {/* Data points - Interactive */}
                    {salesDataPoints.map((point, idx) => (
                      <g key={idx}>
                        <circle 
                          cx={point.x} 
                          cy={point.y} 
                          r={hoveredPoint === idx ? "5" : "3"} 
                          fill="#3b82f6"
                          className="cursor-pointer transition-all hover:fill-blue-600"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => navigate(`/sales?date=${point.date}`)}
                          style={{ pointerEvents: 'all' }}
                        />
                      </g>
                    ))}
                  </svg>
                  
                  {/* Tooltip */}
                  {hoveredPoint !== null && (
                    <div 
                      className="absolute bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg z-50 pointer-events-none"
                      style={{
                        left: `${(salesDataPoints[hoveredPoint].x / 300) * 100}%`,
                        top: `${(salesDataPoints[hoveredPoint].y / 150) * 100 - 20}%`,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      <div className="font-semibold">{salesDataPoints[hoveredPoint].date}</div>
                      <div>Sales: ₹{salesDataPoints[hoveredPoint].sales.toLocaleString()}</div>
                      <div>Invoices: {salesDataPoints[hoveredPoint].invoices}</div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                    </div>
                  )}
                </div>
                
                {/* X-axis dates */}
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 px-2">
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

          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide">INVENTORY OVERVIEW</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Items</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{metrics.totalItems}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Total jewellery types in inventory
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Stock</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{metrics.totalStock}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Total quantity available for sale
                  </p>
                </div>
                <button 
                  onClick={() => metrics.lowStockCount > 0 && navigate('/products?filter=lowstock')}
                  className={`pt-2 border-t border-gray-100 dark:border-gray-700 w-full text-left ${
                    metrics.lowStockCount > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded p-2 -m-2' : ''
                  }`}
                  disabled={metrics.lowStockCount === 0}
                  title={metrics.lowStockCount > 0 ? 'Click to view low stock items' : ''}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${
                      metrics.lowStockCount > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>Low Stock</span>
                    <span className={`text-xl font-bold ${
                      metrics.lowStockCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'
                    }`}>{metrics.lowStockCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {metrics.lowStockCount === 0 ? 'All items sufficiently stocked' : 'Items need restocking soon'}
                  </p>
                </button>
                <button 
                  onClick={() => metrics.outOfStockCount > 0 && navigate('/products?filter=outofstock')}
                  className={`pt-2 border-t border-gray-100 dark:border-gray-700 w-full text-left ${
                    metrics.outOfStockCount > 0 ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded p-2 -m-2' : ''
                  }`}
                  disabled={metrics.outOfStockCount === 0}
                  title={metrics.outOfStockCount > 0 ? 'Click to view out of stock items' : ''}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${
                      metrics.outOfStockCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>Out of Stock</span>
                    <span className={`text-xl font-bold ${
                      metrics.outOfStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                    }`}>{metrics.outOfStockCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {metrics.outOfStockCount === 0 ? 'No immediate purchase required' : 'Urgent restocking needed'}
                  </p>
                </button>
              </div>
              <Link 
                to="/products" 
                className="mt-4 block w-full text-center bg-[#1a1d2e] dark:bg-[#0d9488] hover:opacity-90 text-white text-sm font-medium py-2 rounded transition-opacity"
              >
                View All Products
              </Link>
            </div>

            {/* Pending Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">ACTION REQUIRED</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Tasks that need immediate attention</p>
              </div>

              <div className="p-4 space-y-4">
                    {/* SALES Section */}
                    <div>
                      <div className="flex items-center mb-3">
                        <HiShoppingBag className="w-4 h-4 text-orange-500 mr-2" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">SALES</h3>
                      </div>
                      <div className="space-y-1 ml-6">
                        <button 
                          onClick={() => navigate('/sales/packed')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view items to be packed"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.sales?.toBePacked > 0 
                              ? 'text-red-600 dark:text-red-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>To Be Packed</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.sales?.toBePacked > 0 
                              ? 'text-red-600 dark:text-red-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.sales?.toBePacked || 0}</span>
                        </button>
                        <button 
                          onClick={() => navigate('/sales/shipped')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view items to be shipped"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.sales?.toBeShipped > 0 
                              ? 'text-red-600 dark:text-red-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>To Be Shipped</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.sales?.toBeShipped > 0 
                              ? 'text-red-600 dark:text-red-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.sales?.toBeShipped || 0}</span>
                        </button>
                        <button 
                          onClick={() => navigate('/sales/delivered')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view items to be delivered"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.sales?.toBeDelivered > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>To Be Delivered</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.sales?.toBeDelivered > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.sales?.toBeDelivered || 0}</span>
                        </button>
                        <button 
                          onClick={() => navigate('/sales/invoices')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view sales to be invoiced"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.sales?.toBeInvoiced > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>To Be Invoiced</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.sales?.toBeInvoiced > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.sales?.toBeInvoiced || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* PURCHASES Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-3">
                        <HiShoppingCart className="w-4 h-4 text-orange-500 mr-2" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">PURCHASES</h3>
                      </div>
                      <div className="space-y-1 ml-6">
                        <button 
                          onClick={() => navigate('/purchases/receive')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view purchases to be received"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.purchases?.toBeReceived > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>To Be Received</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.purchases?.toBeReceived > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.purchases?.toBeReceived || 0}</span>
                        </button>
                        <button 
                          onClick={() => navigate('/purchases/progress')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view receiving in progress"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.purchases?.receiveInProgress > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>Receive In Progress</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.purchases?.receiveInProgress > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.purchases?.receiveInProgress || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* INVENTORY Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-3">
                        <HiCube className="w-4 h-4 text-orange-500 mr-2" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">INVENTORY</h3>
                      </div>
                      <div className="space-y-1 ml-6">
                        <button 
                          onClick={() => navigate('/products?filter=lowstock')}
                          className="w-full flex items-center justify-between text-sm py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                          title="Click to view items below reorder level"
                        >
                          <span className={`group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium ${
                            metrics?.pendingActions?.inventory?.belowReorderLevel > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>Below Reorder Level</span>
                          <span className={`font-semibold ${
                            metrics?.pendingActions?.inventory?.belowReorderLevel > 0 
                              ? 'text-orange-600 dark:text-orange-400 font-bold text-base' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>{metrics?.pendingActions?.inventory?.belowReorderLevel || 0}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Status Message */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      {(() => {
                        const totalPending = 
                          (metrics?.pendingActions?.sales?.toBePacked || 0) +
                          (metrics?.pendingActions?.sales?.toBeShipped || 0) +
                          (metrics?.pendingActions?.sales?.toBeDelivered || 0) +
                          (metrics?.pendingActions?.sales?.toBeInvoiced || 0) +
                          (metrics?.pendingActions?.purchases?.toBeReceived || 0) +
                          (metrics?.pendingActions?.purchases?.receiveInProgress || 0) +
                          (metrics?.pendingActions?.inventory?.belowReorderLevel || 0);
                        
                        return totalPending === 0 ? (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2.5 text-center">
                            <p className="text-sm text-green-700 dark:text-green-400 font-bold">All Caught Up</p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-medium">
                              No pending sales, purchases, or inventory actions.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2.5 text-center">
                            <p className="text-sm text-orange-700 dark:text-orange-400 font-bold">{totalPending} Action{totalPending !== 1 ? 's' : ''} Pending</p>
                            <p className="text-xs text-orange-600 dark:text-orange-500 mt-1 font-medium">
                              Click on items above to take action.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
              </div>
            </div>

            {/* Highest Stock Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Highest Stock Items</h2>
                <Dropdown 
                  value={topStockedPeriod}
                  onChange={setTopStockedPeriod}
                  options={stockedPeriodOptions}
                  size="xs"
                />
              </div>
              <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Showing data for:</span> {topStockedPeriod}
                </p>
              </div>
              <div className="p-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setTopStockedView('quantity')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      topStockedView === 'quantity'
                        ? 'bg-teal-600 dark:bg-teal-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    By Quantity
                  </button>
                  <button
                    onClick={() => setTopStockedView('value')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      topStockedView === 'value'
                        ? 'bg-teal-600 dark:bg-teal-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    By Value
                  </button>
                </div>
                {topStockedView === 'quantity' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Classic Gold Ring</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">14 pcs</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gold Chain</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">8 pcs</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Silver Coin</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">5 pcs</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Classic Gold Ring</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹9,80,000</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gold Chain</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹4,20,000</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Silver Coin</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹95,000</span>
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                    Stock status: <span className="text-green-600 dark:text-green-400 font-bold">Healthy</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Top Vendors */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Top Vendors</h2>
                <Dropdown 
                  value={topVendorsPeriod}
                  onChange={setTopVendorsPeriod}
                  options={periodOptions}
                  size="xs"
                />
              </div>
              <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Showing data for:</span> {topVendorsPeriod}
                </p>
              </div>
              <div className="p-4">
                <div className="flex space-x-2 mb-4">
                  <button 
                    onClick={() => setTopVendorsView('quantity')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      topVendorsView === 'quantity'
                        ? 'bg-teal-600 dark:bg-teal-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    By Quantity
                  </button>
                  <button 
                    onClick={() => setTopVendorsView('value')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      topVendorsView === 'value'
                        ? 'bg-teal-600 dark:bg-teal-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    By Value
                  </button>
                </div>
                {topVendorsView === 'quantity' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ABC Gold Suppliers</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">5 orders</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">XYZ Silver Traders</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">3 orders</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diamond Wholesale Co</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">2 orders</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ABC Gold Suppliers</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹8,50,000</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diamond Wholesale Co</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹3,20,000</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">XYZ Silver Traders</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₹1,85,000</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Receive History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Stock Receipts</h2>
                <Dropdown 
                  value={receiveHistoryPeriod}
                  onChange={setReceiveHistoryPeriod}
                  options={periodOptions}
                  size="xs"
                />
              </div>
              <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Showing data for:</span> {receiveHistoryPeriod}
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/purchases/receive/RCV-2026-001')}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-l-4 border-green-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
                    title="Click to view receipt details"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">RCV-2026-001</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Received</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">ABC Gold Suppliers</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">12 items • ₹8,50,000</p>
                  </button>
                  <button 
                    onClick={() => navigate('/purchases/receive/RCV-2026-002')}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-l-4 border-green-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
                    title="Click to view receipt details"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">RCV-2026-002</span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Received</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">XYZ Silver Traders</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">8 items • ₹1,85,000</p>
                  </button>
                  <button 
                    onClick={() => navigate('/purchases/receive/RCV-2026-003')}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-l-4 border-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
                    title="Click to view receipt details"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">RCV-2026-003</span>
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Pending</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Diamond Wholesale Co</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 items • ₹3,20,000</p>
                  </button>
                </div>
              </div>
            </div>



          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


