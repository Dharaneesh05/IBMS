import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Dropdown from './Dropdown';
import { HiShoppingBag, HiShoppingCart, HiCube } from 'react-icons/hi';

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
  
  // Period filters
  const [salesOrderPeriod, setSalesOrderPeriod] = useState('This Month');
  const [receiveHistoryPeriod, setReceiveHistoryPeriod] = useState('This Month');
  // View mode for Sales Trend chart
  const [salesOrderView, setSalesOrderView] = useState('quantity');
  
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A2E] mx-auto"></div>
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
    <div className="min-h-full dark:bg-gray-900" style={{ background: '#f7f9fb' }}>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top 4 Business Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Profit Today</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {todaySummary ? formatCurrency(todaySummary.today?.profit || 0) : '₹0'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Net earnings</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Sales Today</p>
                <p className="text-2xl font-bold text-[#1F3A2E] dark:text-emerald-400">
                  {todaySummary ? formatCurrency(todaySummary.today?.revenue || 0) : '₹0'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Total revenue</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Invoices Generated</p>
                <p className="text-2xl font-bold text-[#D4AF37] dark:text-yellow-400">
                  {todaySummary?.today?.invoices || 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Bills raised today</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Ornaments Sold</p>
                <p className="text-2xl font-bold text-[#1F3A2E] dark:text-emerald-400">
                  {todaySummary?.today?.itemsSold || 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Units dispatched</p>
              </div>
            </div>

            {/* Jewellery Sales Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Jewellery Sales Trend</h2>
                <Dropdown
                  value={salesOrderPeriod}
                  onChange={setSalesOrderPeriod}
                  options={periodOptions}
                  size="xs"
                />
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Showing data for:</span>{' '}
                  <span className="font-medium">{salesOrderPeriod}</span>
                </p>
              </div>
              <div className="p-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setSalesOrderView('quantity')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      salesOrderView === 'quantity'
                        ? 'bg-[#1F3A2E] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    By Quantity
                  </button>
                  <button
                    onClick={() => setSalesOrderView('value')}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      salesOrderView === 'value'
                        ? 'bg-[#1F3A2E] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    By Value
                  </button>
                </div>
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
                <div className="relative h-48 border border-gray-200 dark:border-gray-700 rounded bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 p-4">
                  <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                    <line x1="0" y1="30" x2="300" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <line x1="0" y1="90" x2="300" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <line x1="0" y1="120" x2="300" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                    <polyline fill="none" stroke="#1F3A2E" strokeWidth="2.5" points="0,120 37.5,100 75,85 112.5,95 150,70 187.5,60 225,75 262.5,50 300,45"/>
                    <polygon fill="url(#salesGradient)" opacity="0.3" points="0,120 37.5,100 75,85 112.5,95 150,70 187.5,60 225,75 262.5,50 300,45 300,150 0,150"/>
                    <defs>
                      <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#1F3A2E', stopOpacity: 0.5 }} />
                        <stop offset="100%" style={{ stopColor: '#1F3A2E', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    {salesDataPoints.map((point, idx) => (
                      <g key={idx}>
                        <circle
                          cx={point.x} cy={point.y}
                          r={hoveredPoint === idx ? '5' : '3'}
                          fill="#1F3A2E"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => navigate(`/sales?date=${point.date}`)}
                          style={{ pointerEvents: 'all' }}
                        />
                      </g>
                    ))}
                  </svg>
                  {hoveredPoint !== null && (
                    <div
                      className="absolute bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg z-50 pointer-events-none"
                      style={{
                        left: `${(salesDataPoints[hoveredPoint].x / 300) * 100}%`,
                        top: `${(salesDataPoints[hoveredPoint].y / 150) * 100 - 20}%`,
                        transform: 'translate(-50%, -100%)',
                      }}
                    >
                      <div className="font-semibold">{salesDataPoints[hoveredPoint].date}</div>
                      <div>Sales: ₹{salesDataPoints[hoveredPoint].sales.toLocaleString()}</div>
                      <div>Invoices: {salesDataPoints[hoveredPoint].invoices}</div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 px-2">
                  <span>01 Feb</span><span>05 Feb</span><span>09 Feb</span><span>13 Feb</span>
                  <span>17 Feb</span><span>21 Feb</span><span>25 Feb</span><span>27 Feb</span>
                </div>
              </div>
            </div>

            {/* Dead Stock / Slow Moving Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Dead Stock / Slow Moving Items</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Items not sold in 60+ days — review for discount, redesign, or melt
                  </p>
                </div>
                <button
                  onClick={() => navigate('/inventory/stock-levels?view=dead-stock')}
                  className="text-xs font-medium text-white px-3 py-1.5 rounded transition-opacity hover:opacity-80"
                  style={{ background: '#1F3A2E' }}
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                {(deadStock && deadStock.length > 0) || (slowMoving && slowMoving.length > 0) ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Item</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Days Unsold</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stock</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {[...(deadStock || []), ...(slowMoving || [])].slice(0, 6).map((item, idx) => {
                        const daysUnsold = item.daysSinceLastSale || item.daysUnsold || 90;
                        const stock = item.currentStock ?? item.quantity ?? item.stock ?? 0;
                        const name = item.name || item.product?.name || 'N/A';
                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{name}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-semibold ${daysUnsold >= 90 ? 'text-red-600 dark:text-red-400' : daysUnsold >= 60 ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {daysUnsold} days
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{stock} pcs</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                daysUnsold >= 90
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {daysUnsold >= 90 ? 'Melt / Sell' : 'Discount'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Item</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Days Unsold</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stock</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {[
                        { name: 'Gold Chain Necklace', days: 120, stock: 2, critical: true },
                        { name: 'Pearl Earrings',       days: 90,  stock: 5, critical: true },
                        { name: 'Platinum Ring',        days: 80,  stock: 3, critical: false },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-semibold ${item.critical ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {item.days} days
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{item.stock} pcs</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              item.critical
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {item.critical ? 'Melt / Sell' : 'Discount'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            

            {/* Today's Sales */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Today's Sales</h2>
                <button
                  onClick={() => navigate('/sales/invoices')}
                  className="text-xs font-medium text-white px-3 py-1.5 rounded transition-opacity hover:opacity-80"
                  style={{ background: '#1F3A2E' }}
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Invoice</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Item</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Weight</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {todaySummary?.today?.invoices > 0 ? (
                      <tr>
                        <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs" colSpan={4}>
                          Today's invoice details will appear here once sales are recorded.
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={4}>
                          No sales recorded today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales vs Purchases Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales vs Purchases Analysis</h2>
              </div>
              <div className="p-6">
                {salesVsPurchases.length > 0 ? (
                  <>
                    <div className="relative h-64 border border-gray-200 dark:border-gray-700 rounded bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 p-4">
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                        {[20, 60, 100, 140, 180].map((y, idx) => (
                          <line key={idx} x1="40" y1={y} x2="400" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="2,2"/>
                        ))}
                        <line x1="40" y1="10" x2="40" y2="190" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600"/>
                        <line x1="35" y1="180" x2="400" y2="180" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600"/>
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
                                <rect x={xBase} y={180 - salesHeight} width={barWidth} height={salesHeight} fill="#1F3A2E" rx="2" className="cursor-pointer hover:opacity-80 transition-opacity" onMouseEnter={() => setHoveredSalesVsPurchase(idx)} onMouseLeave={() => setHoveredSalesVsPurchase(null)}/>
                                <rect x={xBase + barWidth + 3} y={180 - purchasesHeight} width={barWidth} height={purchasesHeight} fill="#D4AF37" rx="2" className="cursor-pointer hover:opacity-80 transition-opacity" onMouseEnter={() => setHoveredSalesVsPurchase(idx)} onMouseLeave={() => setHoveredSalesVsPurchase(null)}/>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                      {hoveredSalesVsPurchase !== null && salesVsPurchases[hoveredSalesVsPurchase] && (
                        <div
                          className="absolute bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-2 px-3 shadow-lg z-50"
                          style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}
                        >
                          <div className="font-semibold mb-1">{formatMonth(salesVsPurchases[hoveredSalesVsPurchase].month)}</div>
                          <div className="text-green-400">Sales: {formatCurrency(salesVsPurchases[hoveredSalesVsPurchase].sales)}</div>
                          <div style={{ color: '#D4AF37' }}>Purchases: {formatCurrency(salesVsPurchases[hoveredSalesVsPurchase].purchases)}</div>
                          <div className="mt-1 pt-1 border-t border-gray-600">
                            Margin: {formatCurrency(salesVsPurchases[hoveredSalesVsPurchase].sales - salesVsPurchases[hoveredSalesVsPurchase].purchases)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-around mt-3 text-xs text-gray-600 dark:text-gray-400">
                      {salesVsPurchases.map((data, idx) => (
                        <span key={idx} className="font-medium">{formatMonth(data.month)}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#1F3A2E' }}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Sales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: '#D4AF37' }}></div>
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






          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide">JEWELLERY STOCK SUMMARY</h3>
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
                className="mt-4 block w-full text-center bg-[#1F3A2E] dark:bg-[#1F3A2E] hover:opacity-90 text-white text-sm font-medium py-2 rounded transition-opacity"
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


