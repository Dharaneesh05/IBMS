import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const DesignerList = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompactView, setIsCompactView] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchDesigners();
  }, []);

  // Reset selections when designers change
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [designers]);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will also delete all products by this designer.')) {
      try {
        await api.delete(`/designers/${id}`);
        fetchDesigners();
      } catch (err) {
        alert('Failed to delete designer');
      }
    }
  };

  const handleSelectItem = (designerId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(designerId)) {
      newSelected.delete(designerId);
    } else {
      newSelected.add(designerId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === sortedDesigners.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(sortedDesigners.map(d => d.id)));
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

  const calculateStatsStats = () => {
    return {
      totalDesigners: designers.length,
      activeDesigners: designers.filter(d => d.status === 'active').length,
      withGstin: designers.filter(d => d.gstin && d.gstin.trim()).length,
      inactiveDesigners: designers.filter(d => d.status !== 'active').length
    };
  };

  const sortedDesigners = (() => {
    const sorted = [...designers].sort((a, b) => {
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

    return sorted;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0d9488] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designers...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Designers Table View</h1>
              <p className="text-gray-600">Manage your designer network and partnerships</p>
            </div>
            {designers.length > 0 && (
              <div className="flex flex-col items-end gap-3">
                <Link 
                  to="/designers/new" 
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a1d2e] text-white rounded-lg hover:bg-[#2a2e42] transition-colors shadow-md"
                  title="Add New Designer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Add Designer</span>
                </Link>
                
                {/* View Controls */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={() => setIsCompactView(false)}
                    className={`p-2 rounded-l-lg transition-colors ${
                      !isCompactView
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Comfortable View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsCompactView(true)}
                    className={`p-2 rounded-r-lg transition-colors border-l border-gray-300 ${
                      isCompactView
                        ? 'bg-[#1a1d2e] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Compact View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sort Controls */}
          {sortedDesigners.length > 0 && (
            <div className="mt-4 flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#1a1d2e]/20 focus:border-[#1a1d2e]"
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
                  className="p-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          )}

          {/* Summary Stats - Moved to top */}
          {sortedDesigners.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Designers</p>
                <p className="text-3xl font-bold text-gray-900">{calculateStatsStats().totalDesigners}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Active Designers</p>
                <p className="text-3xl font-bold text-green-600">{calculateStatsStats().activeDesigners}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">With GSTIN</p>
                <p className="text-3xl font-bold text-[#0d9488]">{calculateStatsStats().withGstin}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{calculateStatsStats().inactiveDesigners}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <div className="mb-4 bg-[#1a1d2e] text-white rounded-lg px-4 py-2 flex items-center justify-between shadow-lg">
            <span className="text-sm font-medium">{selectedItems.size} designer(s) selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
        <div className="card overflow-hidden">
          {designers.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Designers Found</h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first designer to the system
              </p>
              <Link to="/designers/new" className="inline-flex items-center px-6 py-3 bg-[#1a1d2e] text-white font-medium rounded-lg hover:bg-[#2a2e42] transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Designer
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#1a1d2e] focus:ring-[#1a1d2e]/20"
                      />
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Company / Display Name
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Contact Person
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Email
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Phone
                    </th>
                    <th className={`text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      GSTIN
                    </th>
                    <th className={`text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Status
                    </th>
                    <th className={`text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${isCompactView ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedDesigners.map((designer) => (
                    <tr key={designer.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(designer.id)}
                          onChange={() => handleSelectItem(designer.id)}
                          className="rounded border-gray-300 text-[#1a1d2e] focus:ring-[#1a1d2e]/20"
                        />
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <div>
                          <Link 
                            to={`/designers/${designer.id}`}
                            className={`${isCompactView ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 hover:text-[#0d9488] transition-colors`}
                          >
                            {designer.companyName || designer.displayName || designer.name}
                          </Link>
                          {designer.companyName && designer.displayName && (
                            <p className="text-xs text-gray-500 mt-1">{designer.displayName}</p>
                          )}
                        </div>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-600`}>{designer.name}</span>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <a 
                          href={`mailto:${designer.email}`}
                          className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-600 hover:text-[#0d9488] transition-colors`}
                        >
                          {designer.email}
                        </a>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-600`}>
                          {designer.phone || '-'}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <span className={`${isCompactView ? 'text-xs' : 'text-sm'} text-gray-600 font-mono`}>
                          {designer.gstin || '-'}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        {getStatusBadge(designer.status)}
                      </td>
                      <td className={`whitespace-nowrap text-center ${isCompactView ? 'px-4 py-2' : 'px-6 py-4'}`}>
                        <Link 
                          to={`/designers/${designer.id}/edit`}
                          className={`text-[#1a1d2e] hover:text-[#2a2e42] font-medium transition-colors ${isCompactView ? 'text-xs' : 'text-sm'}`}
                          title="Edit designer"
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
  );
};

export default DesignerList;


