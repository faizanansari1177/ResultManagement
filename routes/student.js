const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Result  = require('../models/Result');
const isAuth    = require('../middleware/isAuth');
const Settings  = require('../models/Settings');

router.get('/dashboard', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/login');
    res.render('dashboard', { user });
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

router.get('/result', isAuth, (req, res) => {
  res.render('ask-roll', { error: null });
});

router.post('/result', isAuth, async (req, res) => {
  try {
    const { rollNumber, semester } = req.body;

    console.log('🔍 Searching for rollNumber:', rollNumber, '| semesterPair:', semester);

    // First check if roll number exists at all
    const anyResult = await Result.findOne({ rollNumber: rollNumber.trim() });
    console.log('📦 Any result found by rollNumber:', anyResult ? 'YES — semesterPair = ' + anyResult.semesterPair : 'NO');

    const result = await Result.findOne({
      rollNumber: rollNumber.trim(),
      semesterPair: semester
    });

    if (!result) {
      return res.render('ask-roll', {
        error: `No result found for Roll No: ${rollNumber} in selected semester. Please check the roll number and semester.`
      });
    }

    const rawSettings = await Settings.findOne().lean() || {};
    const settings = {
      siteLogo: rawSettings.siteLogo || '',
      universityName: rawSettings.universityName || ''
    };
    console.log('📋 Settings loaded:', settings);
    res.render('result', { result: result.toObject(), settings });

  } catch (err) {
    console.error(err);
    res.render('ask-roll', { error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
