const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SaleItem = sequelize.define('SaleItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sales',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Snapshot of product name at time of sale'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: 'Quantity must be at least 1' }
        }
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Price per unit at time of sale'
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total price for this line item (quantity * unitPrice)'
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Discount applied to this item'
    }
}, {
    tableName: 'sale_items',
    timestamps: true,
    indexes: [
        { fields: ['saleId'] },
        { fields: ['productId'] }
    ]
});

module.exports = SaleItem;
