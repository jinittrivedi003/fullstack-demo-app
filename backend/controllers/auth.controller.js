const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return res.status(400).json({ message: `${field} already exists.` });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
