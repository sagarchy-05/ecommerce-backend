// src/routes/productImage.routes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');
const { ProductImage } = require('../models'); // Assuming you've set up the ProductImage model

const router = express.Router();

// Multer Setup: handling file upload (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images') // 'product-images' is your Supabase bucket name
      .upload(
        `products/${Date.now()}_${req.file.originalname}`,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          upsert: false, // prevent overwriting
        }
      );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const publicUrl = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path).publicURL;

    // Save the URL to ProductImage table
    await ProductImage.create({
      productId: req.body.productId, // Assuming you have a productId in your request body
      url: publicUrl,
    });

    return res
      .status(200)
      .json({ message: 'Image uploaded successfully', url: publicUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
