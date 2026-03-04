const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    getProductsByType,
    getProductsByDesigner,
    getProductTypes,
    createProduct,
    updateProduct,
    deleteProduct,
    generateSKUSuggestion,
    getProductBySKU
} = require('../controllers/productController');

// Special routes first
router.post('/generate-sku', generateSKUSuggestion);
router.get('/sku/:sku', getProductBySKU);
router.get('/types/all', getProductTypes);
router.get('/type/:type', getProductsByType);
router.get('/designer/:designerId', getProductsByDesigner);

// Standard CRUD routes
router.route('/')
    .get(getAllProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
