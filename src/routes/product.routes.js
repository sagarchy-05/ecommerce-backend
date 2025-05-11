const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');
const productController = require('../controllers/product.controller');

// Routes for products
router.post('/', authenticate, isAdmin, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.put('/:id', authenticate, isAdmin, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

module.exports = router;
