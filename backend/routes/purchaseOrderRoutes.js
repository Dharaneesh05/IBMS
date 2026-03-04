const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

// Purchase Order CRUD routes
router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrderById);
router.post('/', purchaseOrderController.createPurchaseOrder);
router.put('/:id', purchaseOrderController.updatePurchaseOrder);
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

// Mark as received
router.post('/:id/receive', purchaseOrderController.receivePurchaseOrder);

module.exports = router;
