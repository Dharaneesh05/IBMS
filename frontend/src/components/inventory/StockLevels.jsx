import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

function StockLevels() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [adjustingStock, setAdjustingStock] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filterByStatus, setFilterByStatus] = useState(null);

  const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Anklets', 'Pendants', 'Others'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, reorderLevel = 10) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= reorderLevel) return 'low-stock';
    return 'in-stock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-stock': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return 'Low Stock';
      case 'in-stock': return 'In Stock';
      default: return 'Unknown';
    }
  };

  // Get category counts
  const getCategoryCount = (category) => {
    if (category === 'All') return products.length;
    return products.filter(p => p.type === category).length;
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id?.toString().includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || product.type === selectedCategory;
    
    // Apply status filter if active
    if (filterByStatus) {
      const status = getStockStatus(product.quantity, product.reorderLevel);
      if (filterByStatus !== status) return false;
    }
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Calculate summary statistics
  const activeItems = products.filter(p => p.quantity > 0).length;
  const totalPieces = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const lowStockItems = products.filter(p => {
    const status = getStockStatus(p.quantity, p.reorderLevel);
    return status === 'low-stock';
  }).length;
  const outOfStockItems = products.filter(p => p.quantity === 0).length;

  // Get lowest and highest stock items
  const lowestStockItem = products.length > 0 ? products.reduce((min, p) => 
    (p.quantity || 0) < (min.quantity || 0) ? p : min
  ) : null;

  const highestStockItem = products.length > 0 ? products.reduce((max, p) => 
    (p.quantity || 0) > (max.quantity || 0) ? p : max
  ) : null;

  const mostRecentUpdate = products.length > 0 ? products.reduce((latest, p) => 
    new Date(p.updatedAt) > new Date(latest.updatedAt) ? p : latest
  ) : null;

  const handleAdjustStock = async (productId) => {
    if (!adjustmentAmount || adjustmentAmount === '0') {
      alert('Please enter a valid adjustment amount');
      return;
    }

    try {
      const product = products.find(p => p.id === productId);
      const newQuantity = Math.max(0, (product.quantity || 0) + parseInt(adjustmentAmount));
      
      await api.put(`/products/${productId}`, {
        ...product,
        quantity: newQuantity
      });

      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, quantity: newQuantity }
          : p
      ));

      setAdjustingStock(null);
      setAdjustmentAmount('');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Failed to adjust stock. Please try again.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Product Name', 'Type', 'Item Code', 'Stock on Hand', 'Reorder Level', 'Status', 'Last Updated'];
    const rows = sortedProducts.map(product => [
      product.name,
      product.type,
      product.id,
      product.quantity || 0,
      product.reorderLevel || 10,
      getStatusLabel(getStockStatus(product.quantity, product.reorderLevel)),
      product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Never'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-levels-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleCardClick = (status) => {
    setFilterByStatus(filterByStatus === status ? null : status);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Loading stock levels...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.02] pointer-events-none bg-repeat"
        style={{
          backgroundImage: 'url(/99172127-vector-jewelry-pattern-jewelry-seamless-background.jpg)',
          backgroundSize: '400px 400px'
        }}
      />

      {/* Header */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Levels</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track available stock, reorder needs, and item availability</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by product name, ID, or type"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="relative bg-gray-50 dark:bg-gray-900 px-5 py-3">
        <div className="grid grid-cols-4 gap-3">
          <div 
            onClick={() => handleCardClick('in-stock')}
            className={`bg-white dark:bg-gray-800 rounded border p-3 cursor-pointer transition-all ${
              filterByStatus === 'in-stock' 
                ? 'border-teal-500 ring-2 ring-teal-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-teal-400'
            }`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Items</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-0.5">{activeItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Items available for sale</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Pieces</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-0.5">{totalPieces}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Combined quantity across all items</div>
          </div>
          <div 
            onClick={() => handleCardClick('low-stock')}
            className={`bg-white dark:bg-gray-800 rounded border p-3 cursor-pointer transition-all ${
              filterByStatus === 'low-stock' 
                ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-yellow-400'
            }`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">Low Stock</div>
            <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mt-0.5">{lowStockItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Need reordering soon</div>
          </div>
          <div 
            onClick={() => handleCardClick('out-of-stock')}
            className={`bg-white dark:bg-gray-800 rounded border p-3 cursor-pointer transition-all ${
              filterByStatus === 'out-of-stock' 
                ? 'border-red-500 ring-2 ring-red-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-red-400'
            }`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">Out of Stock</div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-0.5">{outOfStockItems}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reorder immediately</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-2">
        <div className="flex gap-2">
          {categories.map(category => {
            const count = getCategoryCount(category);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Table */}
      <div className="relative flex-1 overflow-auto">
        <div className="bg-white dark:bg-gray-800">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <div className="text-base font-medium text-gray-900 dark:text-white mb-2">No inventory items found</div>
                <div className="text-xs mb-4">Start by adding jewellery items to track their stock levels and availability</div>
                <Link
                  to="/products/new"
                  className="inline-block px-4 py-2 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                >
                  Add Product
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                <tr>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('name')}
                  >
                    Product Name{getSortIndicator('name')}
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('type')}
                  >
                    Type{getSortIndicator('type')}
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('id')}
                  >
                    Item Code{getSortIndicator('id')}
                  </th>
                  <th
                    className="px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('quantity')}
                  >
                    Stock on Hand{getSortIndicator('quantity')}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                    Reorder Level
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                    Last Updated
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedProducts.map((product) => {
                  const status = getStockStatus(product.quantity, product.reorderLevel);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">
                        {product.type}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        #{product.id}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {adjustingStock === product.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={adjustmentAmount}
                              onChange={(e) => setAdjustmentAmount(e.target.value)}
                              placeholder="+10 or -5"
                              className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                              autoFocus
                            />
                            <button
                              onClick={() => handleAdjustStock(product.id)}
                              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setAdjustingStock(null);
                                setAdjustmentAmount('');
                              }}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {product.quantity || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-gray-500 dark:text-gray-400">
                        {product.reorderLevel || 10}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        {product.updatedAt 
                          ? new Date(product.updatedAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${product.id}`}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setAdjustingStock(product.id)}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                            disabled={adjustingStock === product.id}
                          >
                            Adjust Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stock Health Summary - Bottom Panel */}
      {products.length > 0 && (
        <div className="relative bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-5 py-3">
          <div className="grid grid-cols-3 gap-3">
            {/* Lowest Stock Item */}
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
              <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Lowest Stock Item</div>
              {lowestStockItem && (
                <div className="space-y-0.5">
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{lowestStockItem.name}</div>
                  <div className="text-xs font-medium text-red-600 dark:text-red-400">
                    Only {lowestStockItem.quantity || 0} {lowestStockItem.quantity === 1 ? 'piece' : 'pieces'} remaining
                  </div>
                </div>
              )}
            </div>

            {/* Highest Stock Item */}
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
              <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Highest Stock Item</div>
              {highestStockItem && (
                <div className="space-y-0.5">
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{highestStockItem.name}</div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    {highestStockItem.quantity || 0} {highestStockItem.quantity === 1 ? 'piece' : 'pieces'} in stock
                  </div>
                </div>
              )}
            </div>

            {/* Last Stock Update */}
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
              <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Recent Update</div>
              {mostRecentUpdate && (
                <div className="space-y-0.5">
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{mostRecentUpdate.name}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    Updated {new Date(mostRecentUpdate.updatedAt).toLocaleDateString()} at {new Date(mostRecentUpdate.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockLevels;
