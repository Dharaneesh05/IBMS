const { sequelize } = require('../config/db');
const Designer = require('./Designer');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Payment = require('./Payment');
const InventoryChange = require('./InventoryChange');
const UserActivity = require('./UserActivity');

// Define relationships

// Designer -> Products (One-to-Many)
Designer.hasMany(Product, {
    foreignKey: 'designerId',
    as: 'products',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Product.belongsTo(Designer, {
    foreignKey: 'designerId',
    as: 'designer'
});

// Sale -> SaleItems (One-to-Many)
Sale.hasMany(SaleItem, {
    foreignKey: 'saleId',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

SaleItem.belongsTo(Sale, {
    foreignKey: 'saleId',
    as: 'sale'
});

// Product -> SaleItems (One-to-Many)
Product.hasMany(SaleItem, {
    foreignKey: 'productId',
    as: 'saleItems',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

SaleItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// Sale -> Payments (One-to-Many)
Sale.hasMany(Payment, {
    foreignKey: 'saleId',
    as: 'payments',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Payment.belongsTo(Sale, {
    foreignKey: 'saleId',
    as: 'sale'
});

// Product -> InventoryChanges (One-to-Many)
Product.hasMany(InventoryChange, {
    foreignKey: 'productId',
    as: 'inventoryChanges',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

InventoryChange.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// Export all models and sequelize instance
module.exports = {
    sequelize,
    Designer,
    Product,
    Sale,
    SaleItem,
    Payment,
    InventoryChange,
    UserActivity
};
