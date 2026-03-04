const { PurchaseOrder, PurchaseOrderItem, Product, Vendor, StockMovement, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Public
exports.getAllPurchaseOrders = async (req, res) => {
    try {
        const { 
            search, 
            status, 
            vendorId,
            startDate,
            endDate,
            sortBy = 'orderDate', 
            order = 'DESC',
            page = 1,
            limit = 10
        } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { poNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (vendorId) {
            where.vendorId = vendorId;
        }

        if (startDate && endDate) {
            where.orderDate = {
                [Op.between]: [startDate, endDate]
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows: purchaseOrders } = await PurchaseOrder.findAndCountAll({
            where,
            order: [[sortBy, order]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Vendor,
                    as: 'vendor',
                    attributes: ['id', 'vendorCode', 'companyName', 'contactPerson', 'phone']
                },
                {
                    model: PurchaseOrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'type', 'quantity']
                        }
                    ]
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: purchaseOrders,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch purchase orders', 
            error: error.message 
        });
    }
};

// @desc    Get single purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Public
exports.getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: Vendor,
                    as: 'vendor'
                },
                {
                    model: PurchaseOrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        if (!purchaseOrder) {
            return res.status(404).json({ 
                success: false, 
                message: 'Purchase order not found' 
            });
        }

        res.json({
            success: true,
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch purchase order', 
            error: error.message 
        });
    }
};

// @desc    Create new purchase order
// @route   POST /api/purchase-orders
// @access  Public
exports.createPurchaseOrder = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const {
            vendorId,
            items,
            expectedDeliveryDate,
            subtotal,
            taxAmount,
            shippingCost,
            discountAmount,
            totalAmount,
            notes,
            status = 'pending'
        } = req.body;

        // Validate required fields
        if (!vendorId || !items || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Vendor and items are required' 
            });
        }

        // Check if vendor exists
        const vendor = await Vendor.findByPk(vendorId, { transaction: t });
        if (!vendor) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Vendor not found' 
            });
        }

        // Generate PO number
        const count = await PurchaseOrder.count();
        const poNumber = `PO${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;

        // Create purchase order
        const purchaseOrder = await PurchaseOrder.create({
            poNumber,
            vendorId,
            orderDate: new Date(),
            expectedDeliveryDate,
            subtotal,
            taxAmount,
            shippingCost,
            discountAmount,
            totalAmount,
            notes,
            status
        }, { transaction: t });

        // Create purchase order items
        for (const item of items) {
            const { productId, quantity, unitPrice, taxRate = 18, taxAmount: itemTax, lineTotal } = item;

            // Check if product exists
            const product = await Product.findByPk(productId, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: `Product with ID ${productId} not found` 
                });
            }

            await PurchaseOrderItem.create({
                purchaseOrderId: purchaseOrder.id,
                productId,
                quantity,
                receivedQuantity: 0,
                unitPrice,
                taxRate,
                taxAmount: itemTax,
                lineTotal
            }, { transaction: t });
        }

        // Update vendor outstanding balance
        await vendor.update({
            outstandingBalance: parseFloat(vendor.outstandingBalance) + parseFloat(totalAmount)
        }, { transaction: t });

        await t.commit();

        // Fetch complete purchase order with items
        const completePO = await PurchaseOrder.findByPk(purchaseOrder.id, {
            include: [
                {
                    model: Vendor,
                    as: 'vendor'
                },
                {
                    model: PurchaseOrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Purchase order created successfully',
            data: completePO
        });
    } catch (error) {
        await t.rollback();
        console.error('Error creating purchase order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create purchase order', 
            error: error.message 
        });
    }
};

// @desc    Mark purchase order as received (Complete receive logic)
// @route   POST /api/purchase-orders/:id/receive
// @access  Public
exports.receivePurchaseOrder = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { items, receivedBy } = req.body;

        const purchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: PurchaseOrderItem,
                    as: 'items'
                },
                {
                    model: Vendor,
                    as: 'vendor'
                }
            ]
        }, { transaction: t });

        if (!purchaseOrder) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Purchase order not found' 
            });
        }

        if (purchaseOrder.status === 'received' || purchaseOrder.status === 'cancelled') {
            await t.rollback();
            return res.status(400).json({ 
                success: false, 
                message: `Cannot receive purchase order with status: ${purchaseOrder.status}` 
            });
        }

        // Process each item received
        let allItemsFullyReceived = true;

        for (const receivedItem of items) {
            const { itemId, quantityReceived } = receivedItem;

            // Find the purchase order item
            const poItem = await PurchaseOrderItem.findByPk(itemId, { transaction: t });
            
            if (!poItem) {
                await t.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: `Purchase order item with ID ${itemId} not found` 
                });
            }

            // Calculate new received quantity
            const newReceivedQuantity = poItem.receivedQuantity + quantityReceived;

            if (newReceivedQuantity > poItem.quantity) {
                await t.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot receive more than ordered quantity for item ID ${itemId}` 
                });
            }

            // Update received quantity
            await poItem.update({
                receivedQuantity: newReceivedQuantity
            }, { transaction: t });

            // INCREASE STOCK
            const product = await Product.findByPk(poItem.productId, { transaction: t });
            const previousStock = product.quantity;
            const newStock = previousStock + quantityReceived;

            await product.update({
                quantity: newStock
            }, { transaction: t });

            // Create stock movement record
            await StockMovement.create({
                productId: poItem.productId,
                movementType: 'purchase',
                quantity: quantityReceived,  // Positive for stock in
                previousStock,
                newStock,
                referenceType: 'purchase_order',
                referenceId: purchaseOrder.id,
                referenceNumber: purchaseOrder.poNumber,
                unitPrice: poItem.unitPrice,
                totalValue: quantityReceived * parseFloat(poItem.unitPrice),
                notes: `Purchase from ${purchaseOrder.vendor.companyName}`,
                performedBy: receivedBy,
                movementDate: new Date()
            }, { transaction: t });

            // Check if this item is fully received
            if (newReceivedQuantity < poItem.quantity) {
                allItemsFullyReceived = false;
            }
        }

        // Update purchase order status
        const newStatus = allItemsFullyReceived ? 'received' : 'partial';
        await purchaseOrder.update({
            status: newStatus,
            actualDeliveryDate: allItemsFullyReceived ? new Date() : null,
            receivedBy: receivedBy || 'Admin'
        }, { transaction: t });

        await t.commit();

        // Fetch updated purchase order
        const updatedPO = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: Vendor,
                    as: 'vendor'
                },
                {
                    model: PurchaseOrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        res.json({
            success: true,
            message: 'Purchase order received successfully and stock updated',
            data: updatedPO
        });
    } catch (error) {
        await t.rollback();
        console.error('Error receiving purchase order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to receive purchase order', 
            error: error.message 
        });
    }
};

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
// @access  Public
exports.updatePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const purchaseOrder = await PurchaseOrder.findByPk(id);

        if (!purchaseOrder) {
            return res.status(404).json({ 
                success: false, 
                message: 'Purchase order not found' 
            });
        }

        // Don't allow updating items through this endpoint
        delete updateData.items;

        await purchaseOrder.update(updateData);

        const updatedPO = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: Vendor,
                    as: 'vendor'
                },
                {
                    model: PurchaseOrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        res.json({
            success: true,
            message: 'Purchase order updated successfully',
            data: updatedPO
        });
    } catch (error) {
        console.error('Error updating purchase order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update purchase order', 
            error: error.message 
        });
    }
};

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Public
exports.deletePurchaseOrder = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                {
                    model: PurchaseOrderItem,
                    as: 'items'
                }
            ]
        }, { transaction: t });

        if (!purchaseOrder) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Purchase order not found' 
            });
        }

        // Check if any items have been received
        const hasReceivedItems = purchaseOrder.items.some(item => item.receivedQuantity > 0);
        
        if (hasReceivedItems) {
            await t.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete purchase order with received items. Consider cancelling instead.' 
            });
        }

        await purchaseOrder.destroy({ transaction: t });
        await t.commit();

        res.json({
            success: true,
            message: 'Purchase order deleted successfully'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting purchase order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete purchase order', 
            error: error.message 
        });
    }
};
