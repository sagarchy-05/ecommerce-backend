// src/routes/category.route.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

// Public: Get all categories
router.get('/', categoryController.getAllCategories);

// Public: Get a single category
router.get('/:id', categoryController.getCategoryById);

// Admin only: Create category
router.post('/', authenticate, isAdmin, categoryController.createCategory);

// Admin only: Update category
router.put('/:id', authenticate, isAdmin, categoryController.updateCategory);

// Admin only: Delete category
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;
