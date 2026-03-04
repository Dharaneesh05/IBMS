const { Vendor, PurchaseOrder } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getAllVendors = async (req, res) => {
    try {
        const { 
            search, 
            vendorType, 
            status, 
            sortBy = 'createdAt', 
            order = 'DESC',
            page = 1,
            limit = 10
        } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { companyName: { [Op.like]: `%${search}%` } },
                { vendorCode: { [Op.like]: `%${search}%` } },
                { contactPerson: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (vendorType) {
            where.vendorType = vendorType;
        }

        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: vendors } = await Vendor.findAndCountAll({
            where,
            order: [[sortBy, order]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: PurchaseOrder,
                    as: 'purchaseOrders',
                    attributes: ['id', 'poNumber', 'totalAmount', 'status', 'orderDate'],
                    required: false
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: vendors,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch vendors', 
            error: error.message 
        });
    }
};

// @desc    Get single vendor by ID
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendorById = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findByPk(id, {
            include: [
                {
                    model: PurchaseOrder,
                    as: 'purchaseOrders',
                    order: [['orderDate', 'DESC']]
                }
            ]
        });

        if (!vendor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vendor not found' 
            });
        }

        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch vendor', 
            error: error.message 
        });
    }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Public
exports.createVendor = async (req, res) => {
    try {
        const vendorData = req.body;

        // Generate vendor code if not provided
        if (!vendorData.vendorCode) {
            const count = await Vendor.count();
            vendorData.vendorCode = `VEN${String(count + 1).padStart(5, '0')}`;
        }

        // Check if vendor code already exists
        const existingVendor = await Vendor.findOne({ 
            where: { vendorCode: vendorData.vendorCode } 
        });
        if (existingVendor) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vendor code already exists' 
            });
        }

        const vendor = await Vendor.create(vendorData);

        res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: vendor
        });
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create vendor', 
            error: error.message 
        });
    }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Public
exports.updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vendor not found' 
            });
        }

        // Check if vendor code is being changed and if it already exists
        if (updateData.vendorCode && updateData.vendorCode !== vendor.vendorCode) {
            const existingVendor = await Vendor.findOne({ 
                where: { 
                    vendorCode: updateData.vendorCode,
                    id: { [Op.ne]: id }
                } 
            });
            if (existingVendor) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Vendor code already exists' 
                });
            }
        }

        await vendor.update(updateData);

        res.json({
            success: true,
            message: 'Vendor updated successfully',
            data: vendor
        });
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update vendor', 
            error: error.message 
        });
    }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Public
exports.deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vendor not found' 
            });
        }

        // Check if vendor has any purchase orders
        const poCount = await PurchaseOrder.count({ where: { vendorId: id } });
        if (poCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete vendor with existing purchase orders. Consider deactivating instead.' 
            });
        }

        await vendor.destroy();

        res.json({
            success: true,
            message: 'Vendor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete vendor', 
            error: error.message 
        });
    }
};
