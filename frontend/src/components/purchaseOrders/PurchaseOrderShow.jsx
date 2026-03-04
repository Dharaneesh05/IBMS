import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { FiArrowLeft, FiPackage, FiPrinter, FiEdit } from 'react-icons/fi';

const PurchaseOrderShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [receiving, setReceiving] = useState(false);
    const [receiveQuantities, setReceiveQuantities] = useState({});

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/purchase-orders/${id}`);
            setOrder(response.data);
            
            // Initialize receive quantities with remaining quantities
            const quantities = {};
            response.data.PurchaseOrderItems?.forEach(item => {
                const remaining = item.quantity - (item.receivedQuantity || 0);
                quantities[item.id] = remaining > 0 ? remaining : 0;
            });
            setReceiveQuantities(quantities);
            
            setError(null);
        } catch (err) {
            console.error('Error fetching purchase order:', err);
            setError('Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    };

    const handleReceiveQuantityChange = (itemId, value) => {
        setReceiveQuantities(prev => ({
            ...prev,
            [itemId]: parseInt(value) || 0
        }));
    };

    const handleMarkAsReceived = async () => {
        if (!window.confirm('Mark this purchase order as received? This will update your inventory.')) {
            return;
        }

        try {
            setReceiving(true);
            
            // Prepare items data for receiving
            const items = order.PurchaseOrderItems.map(item => ({
                itemId: item.id,
                quantityReceived: receiveQuantities[item.id] || 0
            }));

            await api.post(`/purchase-orders/${id}/receive`, { items });
            
            alert('Purchase order received successfully!');
            fetchOrder(); // Refresh the order data
        } catch (err) {
            console.error('Error receiving purchase order:', err);
            alert('Failed to receive purchase order: ' + (err.response?.data?.message || err.message));
        } finally {
            setReceiving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            partial: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
                {status?.toUpperCase()}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 dark:text-gray-400">Loading purchase order...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                    {error || 'Purchase order not found'}
                </div>
            </div>
        );
    }

    const canReceive = order.status === 'approved' || order.status === 'partial';

    return (
        <div className="p-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <button
                    onClick={() => navigate('/purchase-orders')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <FiArrowLeft /> Back to Purchase Orders
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <FiPrinter /> Print
                    </button>
                    {canReceive && (
                        <button
                            onClick={handleMarkAsReceived}
                            disabled={receiving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiPackage /> {receiving ? 'Processing...' : 'Mark as Received'}
                        </button>
                    )}
                </div>
            </div>

            {/* Purchase Order Document */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
                {/* PO Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Purchase Order
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                {order.poNumber}
                            </p>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(order.status)}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Date: {formatDate(order.orderDate)}
                            </p>
                            {order.expectedDeliveryDate && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Expected: {formatDate(order.expectedDeliveryDate)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vendor Information */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Vendor Details
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {order.Vendor?.companyName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.Vendor?.vendorCode}
                        </p>
                        {order.Vendor?.contactPerson && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Contact: {order.Vendor.contactPerson}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.Vendor?.phone} {order.Vendor?.email && `• ${order.Vendor.email}`}
                        </p>
                        {order.Vendor?.gstNumber && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                GST: {order.Vendor.gstNumber}
                            </p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Order Items
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Ordered Qty
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Received Qty
                                    </th>
                                    {canReceive && (
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase print:hidden">
                                            Receive Now
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Unit Price
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {order.PurchaseOrderItems?.map((item) => {
                                    const remaining = item.quantity - (item.receivedQuantity || 0);
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.Product?.name}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    SKU: {item.Product?.sku}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-medium ${
                                                    item.receivedQuantity >= item.quantity
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-gray-900 dark:text-gray-100'
                                                }`}>
                                                    {item.receivedQuantity || 0}
                                                </span>
                                                {remaining > 0 && (
                                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                                        Pending: {remaining}
                                                    </div>
                                                )}
                                            </td>
                                            {canReceive && (
                                                <td className="px-4 py-3 text-center print:hidden">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={remaining}
                                                        value={receiveQuantities[item.id] || 0}
                                                        onChange={(e) => handleReceiveQuantityChange(item.id, e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                                                ₹{parseFloat(item.unitPrice).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                ₹{(item.quantity * item.unitPrice).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total Section */}
                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                ₹{parseFloat(order.subtotalAmount || 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                ₹{parseFloat(order.taxAmount || 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-t-2 border-gray-900 dark:border-gray-100">
                            <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                            <span className="font-bold text-xl text-gray-900 dark:text-white">
                                ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            Notes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                            {order.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderShow;
