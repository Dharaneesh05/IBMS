const Designer = require('../models/Designer');
const Product = require('../models/Product');

// @desc    Get all designers
// @route   GET /api/designers
// @access  Public
exports.getAllDesigners = async (req, res) => {
    try {
        const designers = await Designer.find().sort({ _id: 1 });
        res.json(designers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single designer
// @route   GET /api/designers/:id
// @access  Public
exports.getDesignerById = async (req, res) => {
    try {
        const designer = await Designer.findById(req.params.id);
        
        if (!designer) {
            return res.status(404).json({ message: 'Designer not found' });
        }
        
        const products = await Product.find({ designer: req.params.id });
        
        res.json({ designer, products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new designer
// @route   POST /api/designers
// @access  Public
exports.createDesigner = async (req, res) => {
    try {
        const { companyName, displayName, name, email, phone, address, gstin } = req.body;
        
        if (!companyName || !displayName || !name || !email) {
            return res.status(400).json({ message: 'Please provide company name, display name, contact person name, and email' });
        }
        
        const designer = await Designer.create({
            companyName,
            displayName,
            name,
            email,
            phone,
            address,
            gstin,
            status: 'active'
        });
        
        res.status(201).json(designer);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update designer
// @route   PUT /api/designers/:id
// @access  Public
exports.updateDesigner = async (req, res) => {
    try {
        const { companyName, displayName, name, email, phone, address, gstin, status } = req.body;
        
        if (!companyName || !displayName || !name || !email) {
            return res.status(400).json({ message: 'Please provide company name, display name, contact person name, and email' });
        }
        
        const designer = await Designer.findByIdAndUpdate(
            req.params.id,
            { 
                companyName,
                displayName,
                name,
                email,
                phone,
                address,
                gstin,
                status: status || 'active' 
            },
            { new: true, runValidators: true }
        );
        
        if (!designer) {
            return res.status(404).json({ message: 'Designer not found' });
        }
        
        res.json(designer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete designer
// @route   DELETE /api/designers/:id
// @access  Public
exports.deleteDesigner = async (req, res) => {
    try {
        const designer = await Designer.findByIdAndDelete(req.params.id);
        
        if (!designer) {
            return res.status(404).json({ message: 'Designer not found' });
        }
        
        // Delete all products associated with this designer
        await Product.deleteMany({ designer: req.params.id });
        
        res.json({ message: 'Designer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
