const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

router.use(authenticate);

router.post('/', orderController.placeOrder);
router.get('/all', isAdmin, orderController.getAllOrders);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', isAdmin, orderController.editOrder);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;
