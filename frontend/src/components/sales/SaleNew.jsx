import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { FiPlus, FiTrash2, FiSearch, FiShoppingCart, FiSave } from 'react-icons/fi';
import { HiOutlineQrcode, HiCamera } from 'react-icons/hi';
import CameraScanner from '../CameraScanner';

const SaleNew = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    
    // Barcode Scanning States
    const [scanInput, setScanInput] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const [scanSuccess, setScanSuccess] = useState('');
    const scanInputRef = useRef(null);
    
    // Camera Scanner State
    const [showCameraScanner, setShowCameraScanner] = useState(false);

    const [formData, setFormData] = useState({
        customerId: null,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        notes: '',
        status: 'confirmed'
    });

    const [items, setItems] = useState([]);
    const [totals, setTotals] = useState({
        subtotal: 0,
        gstTotal: 0,
        discount: 0,
        finalAmount: 0
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        calculateTotals();
    }, [items]);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            searchProducts();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers', { params: { limit: 100 } });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const searchProducts = async () => {
        try {
            setSearching(true);
            const response = await api.get('/sales/search-products', {
                params: { query: searchTerm }
            });
            setSearchResults(response.data.data);
        } catch (error) {
            console.error('Error searching products:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Barcode Scanning Handler
    const handleBarcodeScan = async (e) => {
        if (e.key === 'Enter' && scanInput.trim()) {
            e.preventDefault();
            setScanning(true);
            setScanError('');
            setScanSuccess('');

            try {
                // Lookup product by SKU
                const response = await api.get(`/products/sku/${scanInput.trim()}`);
                const product = response.data;

                // Check if product has stock
                if (product.quantity <= 0) {
                    setScanError(`${product.name} is out of stock!`);
                    setScanInput('');
                    setTimeout(() => setScanError(''), 3000);
                    return;
                }

                // Add product to invoice
                addProductToInvoice(product);
                setScanSuccess(`${product.name} added successfully!`);
                setScanInput('');

                // Clear success message after 2 seconds
                setTimeout(() => setScanSuccess(''), 2000);

                // Keep focus on scan input
                if (scanInputRef.current) {
                    scanInputRef.current.focus();
                }
            } catch (error) {
                console.error('Error scanning product:', error);
                setScanError(error.response?.data?.message || `Product not found with SKU: ${scanInput}`);
                setScanInput('');
                setTimeout(() => setScanError(''), 3000);
            } finally {
                setScanning(false);
            }
        }
    };

    // Camera Scanner Handler (for mobile/webcam scanning)
    const handleCameraScan = async (sku) => {
        setScanError('');
        setScanSuccess('');

        try {
            // Lookup product by SKU
            const response = await api.get(`/products/sku/${sku.trim()}`);
            const product = response.data;

            // Check if product has stock
            if (product.quantity <= 0) {
                setScanError(`${product.name} is out of stock!`);
                setTimeout(() => setScanError(''), 3000);
                return;
            }

            // Add product to invoice
            addProductToInvoice(product);
            setScanSuccess(`${product.name} added via camera!`);

            // Clear success message after 2 seconds
            setTimeout(() => setScanSuccess(''), 2000);
        } catch (error) {
            console.error('Error scanning product:', error);
            setScanError(error.response?.data?.message || `Product not found with SKU: ${sku}`);
            setTimeout(() => setScanError(''), 3000);
        }
    };

    const handleCustomerChange = (customerId) => {
        const customer = customers.find(c => c.id === parseInt(customerId));
        if (customer) {
            setFormData({
                ...formData,
                customerId: customer.id,
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email || '',
                customerPhone: customer.phone || '',
                customerAddress: customer.billingAddress || ''
            });
        } else {
            setFormData({
                ...formData,
                customerId: null,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                customerAddress: ''
            });
        }
    };

    const addProductToInvoice = (product) => {
        // Check if product already in items
        const existingIndex = items.findIndex(item => item.productId === product.id);
        
        if (existingIndex >= 0) {
            // Increase quantity if already exists
            const updatedItems = [...items];
            updatedItems[existingIndex].quantity += 1;
            calculateLineTotal(updatedItems[existingIndex]);
            setItems(updatedItems);
        } else {
            // Add new item
            const newItem = {
                productId: product.id,
                productName: product.name,
                productType: product.type,
                quantity: 1,
                unitPrice: parseFloat(product.price) || 0,
                netWeight: 0,
                metalRate: 0,
                makingCharge: 0,
                taxRate: 3,
                taxAmount: 0,
                lineTotal: 0
            };
            calculateLineTotal(newItem);
            setItems([...items, newItem]);
        }
        
        setSearchTerm('');
        setSearchResults([]);
    };

    const calculateLineTotal = (item) => {
        const baseAmount = item.quantity * item.unitPrice;
        const taxAmount = (baseAmount * item.taxRate) / 100;
        item.taxAmount = parseFloat(taxAmount.toFixed(2));
        item.lineTotal = parseFloat((baseAmount + taxAmount).toFixed(2));
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = parseFloat(value) || 0;
        calculateLineTotal(updatedItems[index]);
        setItems(updatedItems);
    };

    const removeItem = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const gstTotal = items.reduce((sum, item) => sum + item.taxAmount, 0);
        const finalAmount = subtotal + gstTotal - totals.discount;

        setTotals({
            subtotal: parseFloat(subtotal.toFixed(2)),
            gstTotal: parseFloat(gstTotal.toFixed(2)),
            discount: totals.discount,
            finalAmount: parseFloat(finalAmount.toFixed(2))
        });
    };

    const handleDiscountChange = (discount) => {
        const discountValue = parseFloat(discount) || 0;
        const finalAmount = totals.subtotal + totals.gstTotal - discountValue;
        setTotals({
            ...totals,
            discount: discountValue,
            finalAmount: parseFloat(finalAmount.toFixed(2))
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customerName) {
            alert('Please enter customer name');
            return;
        }

        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        try {
            setLoading(true);

            const saleData = {
                ...formData,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    netWeight: item.netWeight || 0,
                    metalRate: item.metalRate || 0,
                    makingCharge: item.makingCharge || 0,
                    taxRate: item.taxRate || 3,
                    taxAmount: item.taxAmount || 0,
                    lineTotal: item.lineTotal || 0
                })),
                subtotal: totals.subtotal || 0,
                taxAmount: totals.gstTotal || 0,
                discountAmount: totals.discount || 0,
                totalAmount: totals.finalAmount || 0,
                status: 'confirmed'
            };

            console.log('Submitting sale data:', saleData);

            const response = await api.post('/sales', saleData);
            
            console.log('Sale created successfully:', response.data);
            
            alert('Invoice created successfully!');
            navigate('/sales/invoices');
        } catch (error) {
            console.error('Error creating sale:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create invoice';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
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
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Sales Invoice</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Generate a new sales invoice</p>
                </div>

            <form onSubmit={handleSubmit}>
                {/* Invoice Header */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Invoice Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Invoice Number - Auto Generated */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Invoice No
                            </label>
                            <input
                                type="text"
                                value="Auto Generated"
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={new Date().toISOString().split('T')[0]}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                            />
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Payment Mode *
                            </label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            >
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="upi">UPI</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Customer (Optional)
                            </label>
                            <select
                                value={formData.customerId || ''}
                                onChange={(e) => handleCustomerChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.customerCode} - {customer.firstName} {customer.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                placeholder="Enter customer name"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Customer Phone
                            </label>
                            <input
                                type="text"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Customer Email
                            </label>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                placeholder="Enter email"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Item Section with Barcode Scanner & SKU Search */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <FiShoppingCart /> Invoice Items
                    </h2>

                    {/* BARCODE SCANNER - PRIMARY INPUT */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-3">
                            <HiOutlineQrcode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <label className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                BARCODE SCANNER - Scan Product Here
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    ref={scanInputRef}
                                    type="text"
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                                    onKeyDown={handleBarcodeScan}
                                    placeholder="Position cursor here and scan barcode..."
                                    autoFocus
                                    className="w-full px-4 py-3 border-2 border-blue-400 dark:border-blue-600 rounded-lg 
                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-lg
                                             focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none
                                             placeholder:text-gray-400"
                                    disabled={scanning}
                                />
                                {scanning && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Camera Scanner Button */}
                            <button
                                type="button"
                                onClick={() => setShowCameraScanner(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                                         text-white font-semibold rounded-lg shadow-md hover:shadow-lg 
                                         transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                                title="Scan using camera (mobile/webcam)"
                            >
                                <HiCamera className="w-5 h-5" />
                                <span className="hidden sm:inline">Camera</span>
                            </button>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-4">
                            <span>Tip: Use physical scanner OR click Camera button for mobile/webcam scanning</span>
                        </div>
                        
                        {/* Scan Feedback Messages */}
                        {scanSuccess && (
                            <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded text-green-800 dark:text-green-200 text-sm font-medium">
                                {scanSuccess}
                            </div>
                        )}
                        {scanError && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm font-medium">
                                {scanError}
                            </div>
                        )}
                        
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 flex items-center gap-1">
                            <strong>How to use:</strong> Click this field, scan barcode with your scanner, product will auto-add to invoice
                        </p>
                    </div>

                    {/* DIVIDER */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">OR SEARCH MANUALLY</span>
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    {/* SKU Search - Manual Fallback */}
                    <div className="mb-4 relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Product by SKU / Name (Manual)
                        </label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Type to search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 
                                          dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addProductToInvoice(product)}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b 
                                                 dark:border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Type: {product.type} | Stock: {product.quantity}
                                                </div>
                                            </div>
                                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                ₹{product.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    {items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-200 dark:bg-gray-600">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Product</th>
                                        <th className="px-4 py-2 text-center">Qty</th>
                                        <th className="px-4 py-2 text-right">Net Wt (g)</th>
                                        <th className="px-4 py-2 text-right">Metal Rate</th>
                                        <th className="px-4 py-2 text-right">Making</th>
                                        <th className="px-4 py-2 text-right">Unit Price</th>
                                        <th className="px-4 py-2 text-center">GST %</th>
                                        <th className="px-4 py-2 text-right">GST Amt</th>
                                        <th className="px-4 py-2 text-right">Line Total</th>
                                        <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="border-b dark:border-gray-600">
                                            <td className="px-4 py-2">
                                                <div className="font-medium text-gray-900 dark:text-white">{item.productName}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">{item.productType}</div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.netWeight}
                                                    onChange={(e) => updateItem(index, 'netWeight', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.metalRate}
                                                    onChange={(e) => updateItem(index, 'metalRate', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.makingCharge}
                                                    onChange={(e) => updateItem(index, 'makingCharge', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                                    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.taxRate}
                                                    onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">
                                                ₹{item.taxAmount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                                                ₹{item.lineTotal.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                            <FiShoppingCart className="mx-auto text-6xl mb-2 opacity-50" />
                            <p>No items added yet. Search and add products above.</p>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Invoice Summary</h2>
                    <div className="max-w-md ml-auto">
                        <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                            <span>Subtotal:</span>
                            <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                            <span>GST Total:</span>
                            <span className="font-semibold">₹{totals.gstTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2 items-center">
                            <span className="text-gray-700 dark:text-gray-300">Discount:</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={totals.discount}
                                onChange={(e) => handleDiscountChange(e.target.value)}
                                className="w-32 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-right"
                            />
                        </div>
                        <div className="border-t dark:border-gray-600 pt-2 mt-2">
                            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                <span>Final Amount:</span>
                                <span>₹{totals.finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                        placeholder="Any additional notes..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/sales/invoices')}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 
                                 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || items.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg 
                                 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSave /> {loading ? 'Creating...' : 'Create Invoice'}
                    </button>
                </div>
            </form>

            {/* Camera Scanner Modal */}
            {showCameraScanner && (
                <CameraScanner
                    onScan={handleCameraScan}
                    onClose={() => setShowCameraScanner(false)}
                />
            )}
            </div>
        </div>
    );
};

export default SaleNew;
