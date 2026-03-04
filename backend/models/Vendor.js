const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vendor = sequelize.define('Vendor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vendorCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique vendor code/ID'
    },
    companyName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Company name is required' }
        }
    },
    contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
    gstNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'GST/Tax identification number'
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'India'
    },
    vendorType: {
        type: DataTypes.ENUM('manufacturer', 'wholesaler', 'distributor', 'other'),
        defaultValue: 'wholesaler',
        allowNull: false
    },
    paymentTerms: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Payment terms (e.g., Net 30, COD, etc.)'
    },
    creditLimit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    outstandingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Current outstanding balance'
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
    tableName: 'vendors',
    timestamps: true,
    indexes: [
        { fields: ['vendorCode'], unique: true },
        { fields: ['companyName'] },
        { fields: ['vendorType'] },
        { fields: ['status'] }
    ]
});

module.exports = Vendor;
