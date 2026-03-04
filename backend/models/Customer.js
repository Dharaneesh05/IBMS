const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique customer code/ID'
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'First name is required' }
        }
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Last name is required' }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: {
            isEmail: { msg: 'Invalid email format' }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Phone number is required' }
        }
    },
    alternatePhone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    company: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    gstNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'GST/Tax identification number'
    },
    billingAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    billingCity: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    billingState: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    billingPincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    billingCountry: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'India'
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shippingCity: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    shippingState: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    shippingPincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    shippingCountry: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'India'
    },
    customerType: {
        type: DataTypes.ENUM('regular', 'wholesale', 'vip', 'other'),
        defaultValue: 'regular',
        allowNull: false
    },
    creditLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Credit limit for the customer'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active',
        allowNull: false
    }
}, {
    tableName: 'customers',
    timestamps: true,
    indexes: [
        { fields: ['customerCode'], unique: true },
        { fields: ['email'], unique: true },
        { fields: ['phone'] },
        { fields: ['customerType'] },
        { fields: ['status'] }
    ]
});

// Instance methods
Customer.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

Customer.prototype.getFullBillingAddress = function() {
    const parts = [
        this.billingAddress,
        this.billingCity,
        this.billingState,
        this.billingPincode,
        this.billingCountry
    ].filter(Boolean);
    return parts.join(', ');
};

Customer.prototype.getFullShippingAddress = function() {
    const parts = [
        this.shippingAddress,
        this.shippingCity,
        this.shippingState,
        this.shippingPincode,
        this.shippingCountry
    ].filter(Boolean);
    return parts.join(', ');
};

module.exports = Customer;
