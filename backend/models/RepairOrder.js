const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RepairOrder = sequelize.define('RepairOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  productSKU: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  issueDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expectedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  repairCharges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  advancePayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  balanceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  repairNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'repair_orders',
  timestamps: true
});

module.exports = RepairOrder;
