const express = require('express');
const {
  registerUser,
  loginUser,
  verifyEmail,
} = require('../controllers/auth.controller');
const router = express.Router();

// Register and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Email verification route
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
