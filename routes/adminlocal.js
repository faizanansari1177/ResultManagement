const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const Result  = require('../models/Result');

// Multer setup - save logo to public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|svg|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  }
});

const semLabels = {
  'I_II':   { sem1Name: 'I SEMESTER',   sem2Name: 'II SEMESTER'  },
  'III_IV': { sem1Name: 'III SEMESTER', sem2Name: 'IV SEMESTER'  },
  'V_VI':   { sem1Name: 'V SEMESTER',   sem2Name: 'VI SEMESTER'  }
};

router.get('/admin/add-result', (req, res) => {
  res.render('admin/add-result', { success: null, error: null });
});

router.post('/admin/add-result', upload.single('logoFile'), async (req, res) => {
  try {
    const {
      rollNumber, enrollmentNo, studentName, fatherName,
      course, studentStatus, semesterPair,
      carryOverPapers, yearLabel, maximumMarks, marksObtain,
      result: resultStatus, dateOfDeclaration
    } = req.body;

    const labels = semLabels[semesterPair] || { sem1Name: 'I SEMESTER', sem2Name: 'II SEMESTER' };

    console.log('💾 Saving result for rollNumber:', rollNumber, '| semesterPair:', semesterPair);

    const toArray = val => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    };

    const sem1Subjects = toArray(req.body.s1Code).map((code, i) => ({
      subjectCode: code,
      extMM:       toArray(req.body.s1ExtMM)[i]     || '--',
      extMarks:    toArray(req.body.s1ExtMarks)[i]  || '--',
      sessMM:      toArray(req.body.s1SessMM)[i]    || '--',
      sessMarks:   toArray(req.body.s1SessMarks)[i] || '--',
      total:       toArray(req.body.s1Total)[i]     || '--'
    }));

    const sem2Subjects = toArray(req.body.s2Code).map((code, i) => ({
      subjectCode: code,
      extMM:       toArray(req.body.s2ExtMM)[i]     || '--',
      extMarks:    toArray(req.body.s2ExtMarks)[i]  || '--',
      sessMM:      toArray(req.body.s2SessMM)[i]    || '--',
      sessMarks:   toArray(req.body.s2SessMarks)[i] || '--',
      total:       toArray(req.body.s2Total)[i]     || '--'
    }));

    // Logo: use newly uploaded, or keep existing, or empty
    let logoPath = '';
    const existing = await Result.findOne({ rollNumber: rollNumber.trim(), semesterPair });
    if (req.file) {
      logoPath = '/uploads/' + req.file.filename;
    } else if (existing && existing.logoPath) {
      logoPath = existing.logoPath;
    }

    const data = {
      enrollmentNo, studentName, fatherName,
      course, studentStatus: studentStatus || 'Regular',
      semesterPair, sem1Name: labels.sem1Name, sem2Name: labels.sem2Name,
      sem1Subjects, sem2Subjects,
      carryOverPapers: carryOverPapers || '',
      yearLabel: yearLabel || 'FIRST YEAR',
      maximumMarks, marksObtain,
      result: resultStatus, dateOfDeclaration,
      logoPath
    };

    if (existing) {
      await Result.findOneAndUpdate({ rollNumber: rollNumber.trim(), semesterPair }, data);
      return res.render('admin/add-result', { success: '✅ Result updated successfully!', error: null });
    }

    await new Result({ rollNumber: rollNumber.trim(), ...data }).save();
    console.log('✅ Saved successfully!');
    res.render('admin/add-result', { success: '✅ Result added successfully!', error: null });

  } catch (err) {
    console.error('❌ Admin error:', err.message);
    res.render('admin/add-result', { success: null, error: 'Something went wrong: ' + err.message });
  }
});

module.exports = router;

// ─── GET Admin Settings ───────────────────────────────────────────────────────
const Settings = require('../models/Settings');

router.get('/admin/settings', async (req, res) => {
  const raw = await Settings.findOne().lean() || {};
  const settings = { siteLogo: raw.siteLogo || '', universityName: raw.universityName || '' };
  res.render('admin/settings', { success: null, error: null, settings });
});

router.post('/admin/settings', upload.single('siteLogo'), async (req, res) => {
  try {
    console.log('📝 req.body:', req.body);
    console.log('📁 req.file:', req.file);

    // Get existing settings first
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    // Always update universityName from form
    settings.universityName = req.body.universityName || '';

    // Only update logo if new file uploaded
    if (req.file) {
      settings.siteLogo = '/uploads/' + req.file.filename;
    }

    await settings.save();
    console.log('✅ Settings saved:', settings.toObject());

    const saved = { siteLogo: settings.siteLogo || '', universityName: settings.universityName || '' };
    res.render('admin/settings', {
      success: '✅ Settings updated successfully!',
      error: null,
      settings: saved
    });
  } catch (err) {
    console.error('❌ Settings error:', err.message);
    const raw = await Settings.findOne().lean() || {};
    const settings = { siteLogo: raw.siteLogo || '', universityName: raw.universityName || '' };
    res.render('admin/settings', { success: null, error: 'Something went wrong: ' + err.message, settings });
  }
});
