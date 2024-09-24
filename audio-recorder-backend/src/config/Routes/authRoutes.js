const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../auth/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    username,
    password: bcrypt.hashSync(password, 10),
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      token: generateToken(user),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && bcrypt.compareSync(password, user.password)) {
    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user),
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;