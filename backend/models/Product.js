const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a product name' }
        }
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a product type' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a description' }
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: { args: [0], msg: 'Quantity cannot be negative' }
        }
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: { args: [0], msg: 'Cost cannot be negative' }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: { args: [0], msg: 'Price cannot be negative' }
        }
    },
    designerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'designers',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    }
}, {
    tableName: 'products',
    timestamps: true,
    indexes: [
        { fields: ['type'] },
        { fields: ['designerId'] },
        { fields: ['quantity'] }
    ]
});

// Instance methods
Product.prototype.lowStock = function() {
    const LOW_QUANTITY = 5;
    return this.quantity <= LOW_QUANTITY && this.quantity > 0;
};

Product.prototype.outOfStock = function() {
    return this.quantity <= 0;
};

Product.prototype.calculateMarkup = function() {
    return parseFloat(this.price) - parseFloat(this.cost);
};

module.exports = Product;
