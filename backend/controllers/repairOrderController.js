const { RepairOrder } = require('../models');
const { Op } = require('sequelize');

// Generate unique repair order number
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const prefix = `RPR${year}${month}`;
  
  const lastOrder = await RepairOrder.findOne({
    where: {
      orderNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['orderNumber', 'DESC']]
  });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

exports.getAllRepairOrders = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (status && status !== 'All') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { customerName: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } },
        { productName: { [Op.like]: `%${search}%` } },
        { productSKU: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (startDate && endDate) {
      whereClause.receivedDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const repairOrders = await RepairOrder.findAll({
      where: whereClause,
      order: [['receivedDate', 'DESC']]
    });
    
    res.json(repairOrders);
  } catch (error) {
    console.error('Error fetching repair orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repair orders',
      details: error.message 
    });
  }
};

exports.getRepairOrderById = async (req, res) => {
  try {
    const repairOrder = await RepairOrder.findByPk(req.params.id);
    
    if (!repairOrder) {
      return res.status(404).json({ error: 'Repair order not found' });
    }
    
    res.json(repairOrder);
  } catch (error) {
    console.error('Error fetching repair order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repair order',
      details: error.message 
    });
  }
};

exports.createRepairOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      productName,
      productSKU,
      issueDescription,
      receivedDate,
      expectedDeliveryDate,
      repairCharges,
      advancePayment,
      repairNotes,
      assignedTo
    } = req.body;
    
    const orderNumber = await generateOrderNumber();
    
    const balanceAmount = parseFloat(repairCharges || 0) - parseFloat(advancePayment || 0);
    
    const repairOrder = await RepairOrder.create({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      productName,
      productSKU,
      issueDescription,
      receivedDate: receivedDate || new Date(),
      expectedDeliveryDate,
      repairCharges: repairCharges || 0,
      advancePayment: advancePayment || 0,
      balanceAmount,
      repairNotes,
      assignedTo,
      status: 'Pending'
    });
    
    res.status(201).json(repairOrder);
  } catch (error) {
    console.error('Error creating repair order:', error);
    res.status(500).json({ 
      error: 'Failed to create repair order',
      details: error.message 
    });
  }
};

exports.updateRepairOrder = async (req, res) => {
  try {
    const repairOrder = await RepairOrder.findByPk(req.params.id);
    
    if (!repairOrder) {
      return res.status(404).json({ error: 'Repair order not found' });
    }
    
    const {
      customerName,
      customerPhone,
      customerEmail,
      productName,
      productSKU,
      issueDescription,
      expectedDeliveryDate,
      actualDeliveryDate,
      status,
      repairCharges,
      advancePayment,
      repairNotes,
      assignedTo
    } = req.body;
    
    const balanceAmount = parseFloat(repairCharges || repairOrder.repairCharges) - 
                         parseFloat(advancePayment || repairOrder.advancePayment);
    
    await repairOrder.update({
      customerName: customerName || repairOrder.customerName,
      customerPhone: customerPhone || repairOrder.customerPhone,
      customerEmail,
      productName: productName || repairOrder.productName,
      productSKU,
      issueDescription: issueDescription || repairOrder.issueDescription,
      expectedDeliveryDate: expectedDeliveryDate || repairOrder.expectedDeliveryDate,
      actualDeliveryDate,
      status: status || repairOrder.status,
      repairCharges: repairCharges !== undefined ? repairCharges : repairOrder.repairCharges,
      advancePayment: advancePayment !== undefined ? advancePayment : repairOrder.advancePayment,
      balanceAmount,
      repairNotes,
      assignedTo
    });
    
    res.json(repairOrder);
  } catch (error) {
    console.error('Error updating repair order:', error);
    res.status(500).json({ 
      error: 'Failed to update repair order',
      details: error.message 
    });
  }
};

exports.deleteRepairOrder = async (req, res) => {
  try {
    const repairOrder = await RepairOrder.findByPk(req.params.id);
    
    if (!repairOrder) {
      return res.status(404).json({ error: 'Repair order not found' });
    }
    
    await repairOrder.destroy();
    
    res.json({ message: 'Repair order deleted successfully' });
  } catch (error) {
    console.error('Error deleting repair order:', error);
    res.status(500).json({ 
      error: 'Failed to delete repair order',
      details: error.message 
    });
  }
};

exports.getRepairOrderStats = async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      deliveredOrders
    ] = await Promise.all([
      RepairOrder.count(),
      RepairOrder.count({ where: { status: 'Pending' } }),
      RepairOrder.count({ where: { status: 'In Progress' } }),
      RepairOrder.count({ where: { status: 'Completed' } }),
      RepairOrder.count({ where: { status: 'Delivered' } })
    ]);
    
    const totalRevenue = await RepairOrder.sum('repairCharges', {
      where: { status: ['Completed', 'Delivered'] }
    });
    
    const pendingRevenue = await RepairOrder.sum('balanceAmount', {
      where: { status: { [Op.notIn]: ['Delivered', 'Cancelled'] } }
    });
    
    res.json({
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue || 0,
      pendingRevenue: pendingRevenue || 0
    });
  } catch (error) {
    console.error('Error fetching repair order stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repair order stats',
      details: error.message 
    });
  }
};
