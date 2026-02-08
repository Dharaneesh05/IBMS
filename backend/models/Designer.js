const mongoose = require('mongoose');

const designerSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    displayName: {
        type: String,
        required: [true, 'Please add a display name'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please add a designer name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'India' }
    },
    gstin: {
        type: String,
        trim: true,
        uppercase: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Virtual for products
designerSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'designer'
});

// Method to get detail string
designerSchema.methods.detail = function() {
    return `All products by ${this.name}. Order more by email ${this.email}.`;
};

module.exports = mongoose.model('Designer', designerSchema);
