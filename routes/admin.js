const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Result     = require('../models/Result');
const Settings   = require('../models/Settings');

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Multer with Cloudinary Storage ──────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'student-portal',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const semLabels = {
  'I_II':   { sem1Name: 'I SEMESTER',   sem2Name: 'II SEMESTER'  },
  'III_IV': { sem1Name: 'III SEMESTER', sem2Name: 'IV SEMESTER'  },
  'V_VI':   { sem1Name: 'V SEMESTER',   sem2Name: 'VI SEMESTER'  }
};

// ─── Add Result ───────────────────────────────────────────────────────────────
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

    const existing = await Result.findOne({ rollNumber: rollNumber.trim(), semesterPair });
    let logoPath = existing ? existing.logoPath || '' : '';
    if (req.file) logoPath = req.file.path;

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
    res.render('admin/add-result', { success: '✅ Result added successfully!', error: null });

  } catch (err) {
    console.error('❌ Admin error:', err.message);
    res.render('admin/add-result', { success: null, error: 'Something went wrong: ' + err.message });
  }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/admin/settings', async (req, res) => {
  const raw = await Settings.findOne().lean() || {};
  const settings = { siteLogo: raw.siteLogo || '', universityName: raw.universityName || '' };
  res.render('admin/settings', { success: null, error: null, settings });
});

router.post('/admin/settings', upload.single('siteLogo'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.universityName = req.body.universityName || '';
    if (req.file) settings.siteLogo = req.file.path;

    await settings.save();

    const saved = { siteLogo: settings.siteLogo || '', universityName: settings.universityName || '' };
    res.render('admin/settings', { success: '✅ Settings updated!', error: null, settings: saved });
  } catch (err) {
    console.error('❌ Settings error:', err.message);
    const raw = await Settings.findOne().lean() || {};
    const settings = { siteLogo: raw.siteLogo || '', universityName: raw.universityName || '' };
    res.render('admin/settings', { success: null, error: 'Something went wrong: ' + err.message, settings });
  }
});


// ─── List All Results ─────────────────────────────────────────────────────────
router.get('/admin/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 }).lean();
    res.render('admin/results', { results });
  } catch (err) {
    res.render('admin/results', { results: [] });
  }
});

// ─── GET Edit Result ──────────────────────────────────────────────────────────
router.get('/admin/edit-result/:id', async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).lean();
    if (!result) return res.redirect('/admin/results');
    res.render('admin/edit-result', { result, success: null, error: null });
  } catch (err) {
    res.redirect('/admin/results');
  }
});

// ─── POST Edit Result ─────────────────────────────────────────────────────────
router.post('/admin/edit-result/:id', upload.single('logoFile'), async (req, res) => {
  try {
    const {
      enrollmentNo, studentName, fatherName,
      course, studentStatus, semesterPair,
      carryOverPapers, yearLabel, maximumMarks, marksObtain,
      result: resultStatus, dateOfDeclaration
    } = req.body;

    const labels = semLabels[semesterPair] || { sem1Name: 'I SEMESTER', sem2Name: 'II SEMESTER' };

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

    const existing = await Result.findById(req.params.id);
    let logoPath = existing ? existing.logoPath || '' : '';
    if (req.file) logoPath = req.file.path;

    await Result.findByIdAndUpdate(req.params.id, {
      enrollmentNo, studentName, fatherName,
      course, studentStatus: studentStatus || 'Regular',
      semesterPair, sem1Name: labels.sem1Name, sem2Name: labels.sem2Name,
      sem1Subjects, sem2Subjects,
      carryOverPapers: carryOverPapers || '',
      yearLabel: yearLabel || 'FIRST YEAR',
      maximumMarks, marksObtain,
      result: resultStatus, dateOfDeclaration,
      logoPath
    });

    const result = await Result.findById(req.params.id).lean();
    res.render('admin/edit-result', { result, success: '✅ Result updated successfully!', error: null });
  } catch (err) {
    console.error(err);
    const result = await Result.findById(req.params.id).lean();
    res.render('admin/edit-result', { result, success: null, error: 'Something went wrong: ' + err.message });
  }
});

// ─── DELETE Result ────────────────────────────────────────────────────────────
router.post('/admin/delete-result/:id', async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.redirect('/admin/results');
  } catch (err) {
    res.redirect('/admin/results');
  }
});

module.exports = router;
