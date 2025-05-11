const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// GET profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error retrieving user profile', error: err.message });
  }
};

// PUT update profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing)
        return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating profile', error: err.message });
  }
};

// DELETE user
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting account', error: err.message });
  }
};

// ──────────────────────────────────────────────
// 🛠 ADMIN ONLY FUNCTIONS

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt'],
    });
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching users', error: err.message });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching user', error: err.message });
  }
};

// PUT update user by admin
const updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing)
        return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error updating user', error: err.message });
  }
};

// DELETE user by admin
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log before deleting
    console.log('Deleting user:', user);

    const deletionResult = await user.destroy();

    if (deletionResult === 0) {
      return res.status(400).json({ message: 'User could not be deleted' });
    }

    // Log the success
    console.log('User deleted successfully');

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error deleting user', error: err.message });
  }
};

// ──────────────────────────────────────────────

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
};
