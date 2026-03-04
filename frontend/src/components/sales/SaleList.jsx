import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiDollarSign, FiCalendar } from 'react-icons/fi';

const SaleList = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchSales();
    }, [pagination.page, searchTerm, filterPaymentStatus, filterStatus]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
            };

            if (filterPaymentStatus !== 'all') {
                params.paymentStatus = filterPaymentStatus;
            }

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await api.get('/sales', { params });
            setSales(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice? Stock will be restored.')) {
            try {
                await api.delete(`/sales/${id}`);
                fetchSales();
                alert('Invoice deleted successfully');
            } catch (error) {
                console.error('Error deleting sale:', error);
                alert(error.response?.data?.message || 'Failed to delete invoice');
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const getPaymentStatusBadge = (status) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            refunded: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
        return statusClasses[status] || statusClasses.pending;
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
        return statusClasses[status] || statusClasses.confirmed;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen relative">
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Invoices</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your sales invoices</p>
                </div>
                <button
                    onClick={() => navigate('/sales/invoices/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiPlus /> Create New Invoice
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Payment Status Filter */}
                    <select
                        value={filterPaymentStatus}
                        onChange={(e) => setFilterPaymentStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">All Payment Status</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Sales Table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : sales.length === 0 ? (
                <div className="text-center py-10">
                    <FiDollarSign className="mx-auto text-6xl text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No invoices found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
                            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Invoice No</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Payment Status</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium">
                                            <Link
                                                to={`/sales/invoices/${sale.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {sale.invoiceNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <FiCalendar className="text-gray-400" />
                                                {formatDate(sale.saleDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium">{sale.customerName}</div>
                                                {sale.customerPhone && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{sale.customerPhone}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{sale.items?.length || 0} items</td>
                                        <td className="px-6 py-4 font-semibold">₹{parseFloat(sale.totalAmount).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadge(sale.paymentStatus)}`}>
                                                {sale.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sale.status)}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/sales/invoices/${sale.id}`)}
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                    title="View"
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sale.id)}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} invoices
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    {pagination.page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            </div>
        </div>
    );
};

export default SaleList;
