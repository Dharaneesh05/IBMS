import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { 
  HiPlus, 
  HiSearch, 
  HiFilter, 
  HiX, 
  HiClock, 
  HiCheck, 
  HiExclamationCircle,
  HiPencil,
  HiTrash
} from 'react-icons/hi';

const RepairOrderList = () => {
  const navigate = useNavigate();
  const [repairOrders, setRepairOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'];
  
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Delivered': 'bg-teal-100 text-teal-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchRepairOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [repairOrders, searchTerm, statusFilter]);

  const fetchRepairOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/repair-orders');
      setRepairOrders(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching repair orders:', error);
      setError('Failed to load repair orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...repairOrders];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.customerPhone?.toLowerCase().includes(search) ||
        order.productName?.toLowerCase().includes(search)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this repair order?')) return;

    try {
      await api.delete(`/repair-orders/${id}`);
      fetchRepairOrders();
    } catch (error) {
      console.error('Error deleting repair order:', error);
      alert('Failed to delete repair order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (expectedDate, status) => {
    if (status === 'Delivered' || status === 'Cancelled') return false;
    return new Date(expectedDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A2E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repair orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <HiExclamationCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading data</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: 'url(/99172127-vector-jewelry-pattern-jewelry-seamless-background.jpg)',
          backgroundSize: '400px 400px'
        }}
      />
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repair Orders</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage customer repair and service requests</p>
          </div>
          <Link
            to="/services/repair-orders/new"
            className="inline-flex items-center px-4 py-2 bg-[#1F3A2E] text-white rounded-lg hover:bg-[#243d32] transition-colors"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            New Repair Order
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders, customers, products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1F3A2E] focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <HiFilter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1F3A2E] focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 mt-4">
        {statusOptions.filter(s => s !== 'All').map(status => {
          const count = repairOrders.filter(o => o.status === status).length;
          return (
            <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{status}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <HiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No repair orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your filters'
                : 'Create your first repair order to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Order #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Issue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dates
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Charges
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.receivedDate)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{order.productName}</div>
                      {order.productSKU && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {order.productSKU}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {order.issueDescription}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>Due:</span>
                          <span className={isOverdue(order.expectedDeliveryDate, order.status) ? 'text-red-600 font-medium' : ''}>
                            {formatDate(order.expectedDeliveryDate)}
                          </span>
                        </div>
                        {order.actualDeliveryDate && (
                          <div className="text-green-600 dark:text-green-400 mt-1">
                            Delivered: {formatDate(order.actualDeliveryDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      {isOverdue(order.expectedDeliveryDate, order.status) && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">Overdue</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        ₹{parseFloat(order.repairCharges).toFixed(2)}
                      </div>
                      {parseFloat(order.balanceAmount) > 0 && (
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          Balance: ₹{parseFloat(order.balanceAmount).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/services/repair-orders/${order.id}/edit`)}
                          className="text-[#1F3A2E] hover:text-[#1F3A2E] dark:text-teal-400"
                          title="Edit"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          title="Delete"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
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

export default RepairOrderList;
