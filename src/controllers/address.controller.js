// src/controllers/address.controller.js

const { Address } = require('../models');

// Create a new address
exports.createAddress = async (req, res) => {
  try {
    const { street, city, zip, country } = req.body;
    const userId = req.user.userId;

    const address = await Address.create({
      userId,
      street,
      city,
      zip,
      country,
    });
    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all addresses for the authenticated user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const addresses = await Address.findAll({ where: { userId } });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single address by ID
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const address = await Address.findOne({ where: { id, userId } });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { street, city, zip, country } = req.body;
    const userId = req.user.userId;

    const address = await Address.findOne({ where: { id, userId } });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.update({ street, city, zip, country });
    res.status(200).json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const address = await Address.findOne({ where: { id, userId } });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
