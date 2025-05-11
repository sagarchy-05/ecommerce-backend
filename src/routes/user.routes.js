const express = require('express');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require('../controllers/user.controller');

const router = express.Router();

// Middleware for Protection
router.use(authenticate);

// User Profile Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/profile', deleteUserProfile);

// Admin Routes
router.get('/all', isAdmin, getAllUsers);
router.get('/:id', isAdmin, getUserById);
router.put('/:id', isAdmin, updateUserByAdmin);
router.delete('/:id', isAdmin, deleteUserByAdmin);

module.exports = router;
