const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const {
  BACKEND_URL,
  SMTP_USER,
  SMTP_PASS,
  JWT_SECRET,
  EMAIL_SECRET,
} = require('../utils/constants');

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    // Generate JWT token for email verification
    const verificationToken = jwt.sign({ userId: newUser.id }, EMAIL_SECRET, {
      expiresIn: '1h',
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const verifyLink = `${BACKEND_URL}/auth/verify-email/${verificationToken}`;
    const mailOptions = {
      from: SMTP_USER,
      to: newUser.email,
      subject: 'Please verify your email address',
      text: `Click this link to verify your email address: ${verifyLink}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({
          message: 'Error sending verification email',
          error: err.message,
        });
      } else {
        return res.status(201).json({
          message:
            'User registered successfully. Please check your email for verification.',
          verificationToken,
        });
      }
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: 'Please verify your email first.' });
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for the user
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error logging in user', error: err.message });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, EMAIL_SECRET);

    // Find the user and update the isVerified field
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Invalid or expired token', error: err.message });
  }
};

module.exports = { registerUser, loginUser, verifyEmail };
