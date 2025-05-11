// src/routes/address.route.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const addressController = require('../controllers/address.controller');

// All routes require authentication
router.use(authenticate);

// Create a new address
router.post('/', addressController.createAddress);

// Get all addresses of the logged-in user
router.get('/', addressController.getAddresses);

// Get a specific address by ID (owned by user)
router.get('/:id', addressController.getAddressById);

// Update a specific address
router.put('/:id', addressController.updateAddress);

// Delete a specific address
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
