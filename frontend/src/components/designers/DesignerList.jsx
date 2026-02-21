import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const DesignerList = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [searchScopeOpen, setSearchScopeOpen] = useState(false);

  useEffect(() => {
    fetchDesigners();
  }, []);

  // Reset selections when designers change
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [designers]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setImportMenuOpen(false);
        setExportMenuOpen(false);
        setSearchScopeOpen(false);
      }
    };
    
    if (importMenuOpen || exportMenuOpen || searchScopeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [importMenuOpen, exportMenuOpen, searchScopeOpen]);

  const fetchDesigners = async () => {
    try {
      const response = await api.get('/designers');
      setDesigners(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load designers');
      setLoading(false);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm('Are you sure? This will also delete all products by this designer.')) {
  //     try {
  //       await api.delete(`/designers/${id}`);
  //       fetchDesigners();
  //     } catch (err) {
  //       alert('Failed to delete designer');
  //     }
  //   }
  // };

  const handleSelectItem = (designerId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(designerId)) {
      newSelected.delete(designerId);
    } else {
      newSelected.add(designerId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredAndSortedDesigners.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(filteredAndSortedDesigners.map(d => d.id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} selected designers?`)) {
      try {
        await Promise.all([...selectedItems].map(id => api.delete(`/designers/${id}`)));
        setSelectedItems(new Set());
        setSelectAll(false);
        fetchDesigners();
      } catch (err) {
        alert('Failed to delete some designers');
      }
    }
  };

  const exportToCSV = (data, filename) => {
    // Prepare CSV data
    const headers = ['Company Name', 'Display Name', 'Contact Person', 'Email', 'Phone', 'GSTIN', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(designer => [
        `"${designer.companyName || ''}"`,
        `"${designer.displayName || ''}"`,
        `"${designer.name || ''}"`,
        `"${designer.email || ''}"`,
        `"${designer.phone || ''}"`,
        `"${designer.gstin || ''}"`,
        `"${designer.status || ''}"`
      ].join(','))
    ].join('\\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = () => {
    exportToCSV(designers, `designers_all_${new Date().toISOString().split('T')[0]}.csv`);
    setExportMenuOpen(false);
  };

  const handleExportActive = () => {
    const activeDesigners = designers.filter(d => d.status === 'active');
    exportToCSV(activeDesigners, `designers_active_${new Date().toISOString().split('T')[0]}.csv`);
    setExportMenuOpen(false);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\\n');
        // const headers = lines[0].split(','); // Reserved for future use
        
        // Parse CSV data (simplified - in production you'd want a proper CSV parser)
        const importedDesigners = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
            return {
              companyName: values[0],
              displayName: values[1],
              name: values[2],
              email: values[3],
              phone: values[4],
              gstin: values[5],
              status: values[6] || 'active'
            };
          });

        console.log('Imported designers:', importedDesigners);
        alert(`Successfully parsed ${importedDesigners.length} designers. Import functionality coming soon!`);
        setImportMenuOpen(false);
      } catch (error) {
        console.error('Import error:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  // Status badge helper - reserved for future use
  // const getStatusBadge = (status) => {
  //   return (
  //     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
  //       status === 'active' 
  //         ? 'bg-green-100 text-green-700' 
  //         : 'bg-red-100 text-red-700'
  //     }`}>
  //       {status.charAt(0).toUpperCase() + status.slice(1)}
  //     </span>
  //   );
  // };

  const calculateStatsStats = () => {
    return {
      totalDesigners: designers.length,
      activeDesigners: designers.filter(d => d.status === 'active').length,
      withGstin: designers.filter(d => d.gstin && d.gstin.trim()).length,
      inactiveDesigners: designers.filter(d => d.status !== 'active').length
    };
  };

  const filteredAndSortedDesigners = (() => {
    let filtered = [...designers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        (d.companyName || '').toLowerCase().includes(query) ||
        (d.displayName || '').toLowerCase().includes(query) ||
        (d.name || '').toLowerCase().includes(query) ||
        (d.email || '').toLowerCase().includes(query) ||
        (d.phone || '').toLowerCase().includes(query) ||
        (d.gstin || '').toLowerCase().includes(query)
      );
    }

    // Sort designers
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.companyName || a.name || '').toLowerCase();
          bValue = (b.companyName || b.name || '').toLowerCase();
          break;
        case 'contact':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        case 'gstin':
          aValue = (a.gstin || '').toLowerCase();
          bValue = (b.gstin || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        default:
          aValue = (a.companyName || a.name || '').toLowerCase();
          bValue = (b.companyName || b.name || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading designers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-semibold text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStatsStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          {/* Top Row: Title and Main Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designers & Vendors</h1>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">Manage your supplier network and design partners</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search with Dropdown */}
              <div className="relative dropdown-container">
                <div className="relative flex items-center min-w-[280px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in All Items..."
                    className="w-full pl-3 pr-8 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Import Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setImportMenuOpen(!importMenuOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Import ▼
                </button>
                {importMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-700 rounded shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-20">
                    <label className="block px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="hidden"
                      />
                      Import from CSV
                    </label>
                  </div>
                )}
              </div>

              {/* Export Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Export ▼
                </button>
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-20">
                    <button
                      onClick={handleExportAll}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Export All Designers
                    </button>
                    <button
                      onClick={handleExportActive}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Export Active Only
                    </button>
                  </div>
                )}
              </div>

              {/* Add Designer Button */}
              <Link
                to="/designers/new"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded hover:bg-teal-700 transition-colors"
              >
                + Add Designer
              </Link>
            </div>
          </div>

          {/* View Toggle and Sort Controls */}
          <div className="flex items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Table View"
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="Grid View"
              >
                Grid
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Company Name</option>
                <option value="contact">Contact Person</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="gstin">GSTIN</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-1.5 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <div className="mb-3 bg-teal-600 text-white rounded px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs">{selectedItems.size} designer(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedItems(new Set());
                  setSelectAll(false);
                }}
                className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors font-medium"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3">
            {designers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Designers Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start building your supplier network by adding your first designer or vendor
                  </p>
                  <Link
                    to="/designers/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Designer
                  </Link>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <TableView
                designers={filteredAndSortedDesigners}
                selectedItems={selectedItems}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
              />
            ) : (
              <GridView designers={filteredAndSortedDesigners} />
            )}
          </div>

          {/* Quick Insights Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3 sticky top-24">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">QUICK INSIGHTS</h3>
              
              <div className="space-y-2">
                {/* Total Designers */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-2 border border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Designers</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDesigners}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total partners</p>
                </div>

                {/* Active Designers */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-2 border border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Status</span>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeDesigners}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Currently active</p>
                </div>

                {/* With GSTIN */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded p-2 border border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">GSTIN Registered</span>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.withGstin}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">With GSTIN registered</p>
                </div>

                {/* Stock Attention */}
                {stats.inactiveDesigners > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-semibold text-orange-900 dark:text-orange-200">Inactive Partners</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      <span className="font-bold text-lg">{stats.inactiveDesigners}</span> inactive
                    </p>
                  </div>
                )}

                {/* Top category */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Top category:</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Active Partners</p>
                </div>

                {/* Highest value */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Highest value:</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Registered Suppliers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table View Component
const TableView = ({ designers, selectedItems, selectAll, onSelectAll, onSelectItem }) => {
  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        status === 'active' 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                GSTIN
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {designers.map((designer) => (
              <tr key={designer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(designer.id)}
                    onChange={() => onSelectItem(designer.id)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Link
                    to={`/designers/${designer.id}`}
                    className="text-xs font-semibold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {designer.companyName || designer.displayName || designer.name}
                  </Link>
                  {designer.companyName && designer.displayName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{designer.displayName}</p>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-xs text-gray-700 dark:text-gray-300">{designer.name}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`mailto:${designer.email}`}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {designer.email}
                  </a>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{designer.phone || '-'}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">{designer.gstin || '-'}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  {getStatusBadge(designer.status)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/designers/${designer.id}`}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-xs transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/designers/${designer.id}/edit`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Grid View Component
const GridView = ({ designers }) => {
  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        status === 'active' 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designers.map((designer) => (
        <Link
          key={designer.id}
          to={`/designers/${designer.id}`}
          className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:-translate-y-1"
        >
          {/* Card Header with Gradient */}
          <div className="h-32 bg-gradient-to-br from-teal-500 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-2xl font-bold text-teal-600">
                  {(designer.companyName || designer.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {designer.companyName || designer.displayName || designer.name}
                  </h3>
                  {designer.companyName && designer.displayName && (
                    <p className="text-sm text-white/80 truncate">{designer.displayName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            {/* Contact Person */}
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Contact Person</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{designer.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-teal-600 dark:text-teal-400 truncate">{designer.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{designer.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* GSTIN */}
            {designer.gstin && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">GSTIN</p>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white truncate">{designer.gstin}</p>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                {getStatusBadge(designer.status)}
                <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DesignerList;


