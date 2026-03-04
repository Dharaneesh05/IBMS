import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { FiArrowLeft, FiPrinter, FiDownload, FiEdit2, FiCalendar, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';

const SaleShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSale();
    }, [id]);

    const fetchSale = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/sales/${id}`);
            setSale(response.data.data);
        } catch (error) {
            console.error('Error fetching sale:', error);
            alert('Failed to load invoice');
            navigate('/sales/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!sale) {
        return null;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate GST breakdown (CGST/SGST for intrastate, IGST for interstate)
    const calculateGSTBreakdown = () => {
        const taxAmount = parseFloat(sale.taxAmount) || 0;
        // Assuming intrastate - split into CGST/SGST (9% each for 18% GST)
        const isInterstate = false; // Could be determined by state comparison
        
        if (isInterstate) {
            return { igst: taxAmount, cgst: 0, sgst: 0 };
        } else {
            return { igst: 0, cgst: taxAmount / 2, sgst: taxAmount / 2 };
        }
    };

    const gstBreakdown = sale ? calculateGSTBreakdown() : { cgst: 0, sgst: 0, igst: 0 };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 min-h-screen">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <button
                    onClick={() => navigate('/sales/invoices')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 
                             dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <FiArrowLeft /> Back to Invoices
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <FiPrinter /> Print
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <FiDownload /> Download PDF
                    </button>
                </div>
            </div>

            {/* Invoice */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-8 max-w-5xl mx-auto invoice-print">
                {/* Invoice Header with Logo */}
                <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        {/* Company Logo & Name */}
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center print:bg-gray-300">
                                <HiOfficeBuilding className="w-12 h-12 text-white print:text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Your Jewellery Shop</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Premium Gold & Diamond Jewellery</p>
                            </div>
                        </div>
                        {/* Invoice Details */}
                        <div className="text-right">
                            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">INVOICE</h1>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">#{sale.invoiceNumber}</p>
                        </div>
                    </div>
                    
                    {/* Company Details */}
                    <div className="grid grid-cols-2 gap-8 mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">Shop Address:</p>
                            <p>123 Jewellers Street, T.Nagar</p>
                            <p>Chennai, Tamil Nadu 600017</p>
                            <p className="mt-2"><strong>Phone:</strong> +91 98765 43210</p>
                            <p><strong>Email:</strong> info@yourjewellery.com</p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p><strong className="text-gray-900 dark:text-white">GST No:</strong> 33AABCU1234F1Z5</p>
                            <p><strong className="text-gray-900 dark:text-white">PAN:</strong> AABCU1234F</p>
                            <p><strong className="text-gray-900 dark:text-white">State:</strong> Tamil Nadu (33)</p>
                            <p className="mt-2"><strong className="text-gray-900 dark:text-white">Bank:</strong> HDFC Bank</p>
                            <p><strong className="text-gray-900 dark:text-white">A/C:</strong> 50100123456789</p>
                            <p><strong className="text-gray-900 dark:text-white">IFSC:</strong> HDFC0001234</p>
                        </div>
                    </div>
                </div>

                {/* Customer and Date Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Bill To:</h3>
                        <div className="text-gray-900 dark:text-gray-100">
                            <p className="font-semibold text-lg mb-1">{sale.customerName}</p>
                            {sale.customerPhone && (
                                <p className="flex items-center gap-2 text-sm">
                                    <FiPhone className="text-gray-400" /> {sale.customerPhone}
                                </p>
                            )}
                            {sale.customerEmail && (
                                <p className="flex items-center gap-2 text-sm">
                                    <FiMail className="text-gray-400" /> {sale.customerEmail}
                                </p>
                            )}
                            {sale.customerAddress && (
                                <p className="text-sm mt-2">{sale.customerAddress}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Date</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(sale.saleDate)}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 uppercase">{sale.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                                ${sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                                  sale.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-orange-100 text-orange-800'}`}>
                                {sale.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items Table with Weight Details */}
                <div className="mb-8 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Product</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Weight (g)</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">GST %</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">GST Amt</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items && sale.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-3 py-3">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.product?.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.product?.type}
                                            {item.product?.sku && ` • SKU: ${item.product.sku}`}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="text-gray-900 dark:text-gray-100 text-xs">
                                            {item.product?.grossWeight ? (
                                                <>
                                                    <div><strong>Gross:</strong> {parseFloat(item.product.grossWeight).toFixed(3)}g</div>
                                                    {item.product?.netWeight && <div><strong>Net:</strong> {parseFloat(item.product.netWeight).toFixed(3)}g</div>}
                                                    {item.product?.stoneWeight && <div><strong>Stone:</strong> {parseFloat(item.product.stoneWeight).toFixed(3)}g</div>}
                                                </>
                                            ) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center text-gray-900 dark:text-gray-100 font-medium">{item.quantity}</td>
                                    <td className="px-3 py-3 text-right text-gray-900 dark:text-gray-100">₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                                    <td className="px-3 py-3 text-center text-gray-900 dark:text-gray-100">{item.taxRate}%</td>
                                    <td className="px-3 py-3 text-right text-gray-900 dark:text-gray-100">₹{parseFloat(item.taxAmount).toFixed(2)}</td>
                                    <td className="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white">₹{parseFloat(item.lineTotal).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals with GST Breakdown */}
                <div className="flex justify-end">
                    <div className="w-80">
                        <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                            <span>Subtotal (Before Tax):</span>
                            <span className="font-semibold">₹{parseFloat(sale.subtotal).toFixed(2)}</span>
                        </div>
                        
                        {/* GST Breakdown */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-2">
                            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">GST Breakdown:</div>
                            {gstBreakdown.cgst > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                        <span>CGST @ 9%:</span>
                                        <span className="font-semibold">₹{gstBreakdown.cgst.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                        <span>SGST @ 9%:</span>
                                        <span className="font-semibold">₹{gstBreakdown.sgst.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            {gstBreakdown.igst > 0 && (
                                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                    <span>IGST @ 18%:</span>
                                    <span className="font-semibold">₹{gstBreakdown.igst.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-blue-700 dark:text-blue-300 mt-1 pt-1 border-t border-blue-200 dark:border-blue-700">
                                <span>Total GST:</span>
                                <span>₹{parseFloat(sale.taxAmount).toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {sale.discountAmount > 0 && (
                            <div className="flex justify-between mb-2 text-green-600 dark:text-green-400">
                                <span>Discount:</span>
                                <span className="font-semibold">-₹{parseFloat(sale.discountAmount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
                            <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white">
                                <span>Total Amount:</span>
                                <span className="text-blue-600 dark:text-blue-400">₹{parseFloat(sale.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {/* Amount in Words */}
                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 italic">
                            <strong>Amount in Words:</strong> 
                            <span className="ml-1">{/* Could add number-to-words conversion here */}
                                {`${Math.floor(sale.totalAmount / 1000)} Thousand ${Math.floor(sale.totalAmount % 1000)} Rupees Only`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {sale.notes && (
                    <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Notes:</h3>
                        <p className="text-gray-700 dark:text-gray-300">{sale.notes}</p>
                    </div>
                )}

                {/* Footer with Terms & Barcode */}
                <div className="mt-12 pt-6 border-t-2 border-gray-300 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Terms & Conditions:</h3>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Goods once sold cannot be returned or exchanged</li>
                                <li>• Subject to Chennai jurisdiction only</li>
                                <li>• Making charges are non-refundable</li>
                                <li>• Please verify weight and purity before purchase</li>
                            </ul>
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">For Your Jewellery Shop</p>
                                <div className="border-t border-gray-400 inline-block px-8 pt-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Barcode Section */}
                    <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="inline-block">
                            <svg className="mx-auto" width="200" height="50" xmlns="http://www.w3.org/2000/svg">
                                {/* Simple barcode representation using vertical lines based on invoice number */}
                                {sale.invoiceNumber.split('').map((char, i) => {
                                    const width = (char.charCodeAt(0) % 3) + 1;
                                    const x = i * 12;
                                    return <rect key={i} x={x} y="0" width={width} height="40" fill="#000" />;
                                })}
                            </svg>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">{sale.invoiceNumber}</p>
                        </div>
                    </div>
                    
                    <div className="text-center text-xs text-gray-600 dark:text-gray-400 mt-4">
                        <p className="font-semibold text-gray-900 dark:text-white">Thank you for your business!</p>
                        <p className="mt-1">For any queries, please contact us at info@yourjewellery.com or call +91 98765 43210</p>
                        <p className="mt-2 text-xs">This is a computer-generated invoice and does not require a signature.</p>
                    </div>
                </div>
            </div>
            
            {/* Print Styles for Thermal Printers */}
            <style jsx>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    .invoice-print {
                        border: none;
                        box-shadow: none;
                        max-width: 100%;
                        padding: 10mm;
                        page-break-inside: avoid;
                    }
                    
                    /* Thermal printer optimization (80mm width) */
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    
                    /* For A4 print */
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    
                    table {
                        page-break-inside: auto;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    
                    .print\\:bg-gray-300 {
                        background-color: #d1d5db !important;
                    }
                    
                    .print\\:text-gray-600 {
                        color: #4b5563 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SaleShow;
