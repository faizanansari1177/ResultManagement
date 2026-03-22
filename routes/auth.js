const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const User     = require('../models/User');
const Settings = require('../models/Settings');

// ─── Root → redirect to login ─────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.redirect('/login');
});

// ─── GET Register ─────────────────────────────────────────────────────────────
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// ─── POST Register ────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, fatherName, motherName } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('register', { error: 'Email is already registered. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, fatherName, motherName });
    await user.save();

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
});

// ─── GET Login ────────────────────────────────────────────────────────────────
router.get('/login', async (req, res) => {
  const settings = await Settings.findOne() || { siteLogo: '', universityName: '' };
  res.render('login', { error: null, settings });
});

// ─── POST Login ───────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const settings = await Settings.findOne() || { siteLogo: '', universityName: '' };
      return res.render('login', { error: 'Invalid email or password.', settings });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const settings = await Settings.findOne() || { siteLogo: '', universityName: '' };
      return res.render('login', { error: 'Invalid email or password.', settings });
    }

    req.session.userId   = user._id;
    req.session.userName = user.name;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    const settings = await Settings.findOne() || { siteLogo: '', universityName: '' };
    res.render('login', { error: 'Something went wrong. Please try again.', settings });
  }
});

// ─── GET Logout ───────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
