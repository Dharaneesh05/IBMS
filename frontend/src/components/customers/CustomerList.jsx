import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiDollarSign, FiUser } from 'react-icons/fi';

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchCustomers();
    }, [pagination.page, searchTerm, filterType, filterStatus]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
            };

            if (filterType !== 'all') {
                params.customerType = filterType;
            }

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await api.get('/customers', { params });
            setCustomers(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert(error.response?.data?.message || 'Failed to delete customer');
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
        return statusClasses[status] || statusClasses.active;
    };

    const getTypeBadgeClass = (type) => {
        const typeClasses = {
            regular: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            wholesale: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            vip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
        return typeClasses[type] || typeClasses.regular;
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
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your customer database</p>
                </div>
                <button
                    onClick={() => navigate('/customers/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <FiPlus /> Add New Customer
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">All Types</option>
                        <option value="regular">Regular</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="vip">VIP</option>
                        <option value="other">Other</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="text-center py-10">
                    <FiUser className="mx-auto text-6xl text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No customers found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto shadow-sm rounded-lg">
                        <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
                            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2">Customer Code</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Contact</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Total Orders</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                to={`/customers/${customer.id}`}
                                                className="text-teal-600 hover:underline"
                                            >
                                                {customer.customerCode}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                                                {customer.company && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{customer.company}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <FiPhone className="text-gray-400" />
                                                    {customer.phone}
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <FiMail className="text-gray-400" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeClass(customer.customerType)}`}>
                                                {customer.customerType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(customer.status)}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <FiDollarSign className="text-gray-400" />
                                                {customer.sales?.length || 0} orders
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                                                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
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
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
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

export default CustomerList;
