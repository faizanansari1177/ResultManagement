// // const mongoose = require('mongoose');

// // const subjectSchema = {
// //   subjectCode: { type: String, default: '' },
// //   extMM:       { type: String, default: '--' },
// //   extMarks:    { type: String, default: '--' },
// //   sessMM:      { type: String, default: '--' },
// //   sessMarks:   { type: String, default: '--' },
// //   total:       { type: String, default: '--' }
// // };

// // const resultSchema = new mongoose.Schema({
// //   rollNumber:        { type: String, required: true, trim: true },
// //   enrollmentNo:      { type: String, required: true, trim: true },
// //   studentName:       { type: String, required: true, trim: true },
// //   fatherName:        { type: String, required: true, trim: true },
// //   instituteName:     { type: String, required: true, trim: true },
// //   course:            { type: String, required: true, trim: true },
// //   studentStatus:     { type: String, default: 'Regular', trim: true },
// //   semesterPair:      { type: String, required: true }, // I_II, III_IV, V_VI
// //   sem1Name:          { type: String, default: 'I SEMESTER' },
// //   sem2Name:          { type: String, default: 'II SEMESTER' },
// //   sem1Subjects:      [subjectSchema],
// //   sem2Subjects:      [subjectSchema],
// //   carryOverPapers:   { type: String, default: '' },
// //   yearLabel:         { type: String, default: 'FIRST YEAR' },
// //   maximumMarks:      { type: String, required: true },
// //   marksObtain:       { type: String, required: true },
// //   result:            { type: String, required: true },
// //   dateOfDeclaration: { type: String, required: true }
// // }, { timestamps: true });

// // // Unique per student + semester pair
// // resultSchema.index({ rollNumber: 1, semesterPair: 1 }, { unique: true });

// // module.exports = mongoose.model('Result', resultSchema);






// const mongoose = require('mongoose');

// const subjectSchema = {
//   subjectCode: { type: String, default: '' },
//   extMM:       { type: String, default: '--' },
//   extMarks:    { type: String, default: '--' },
//   sessMM:      { type: String, default: '--' },
//   sessMarks:   { type: String, default: '--' },
//   total:       { type: String, default: '--' }
// };

// const resultSchema = new mongoose.Schema({
//   rollNumber:        { type: String, required: true, trim: true },
//   enrollmentNo:      { type: String, required: true, trim: true },
//   studentName:       { type: String, required: true, trim: true },
//   fatherName:        { type: String, required: true, trim: true },
//   course:            { type: String, required: true, trim: true },
//   studentStatus:     { type: String, default: 'Regular', trim: true },
//   semesterPair:      { type: String, required: true }, // I_II, III_IV, V_VI
//   sem1Name:          { type: String, default: 'I SEMESTER' },
//   sem2Name:          { type: String, default: 'II SEMESTER' },
//   sem1Subjects:      [subjectSchema],
//   sem2Subjects:      [subjectSchema],
//   carryOverPapers:   { type: String, default: '' },
//   yearLabel:         { type: String, default: 'FIRST YEAR' },
//   maximumMarks:      { type: String, required: true },
//   marksObtain:       { type: String, required: true },
//   result:            { type: String, required: true },
//   dateOfDeclaration: { type: String, required: true }
// }, { timestamps: true });

// // Unique per student + semester pair
// resultSchema.index({ rollNumber: 1, semesterPair: 1 }, { unique: true });

// module.exports = mongoose.model('Result', resultSchema);




const mongoose = require('mongoose');

const subjectSchema = {
  subjectCode: { type: String, default: '' },
  extMM:       { type: String, default: '--' },
  extMarks:    { type: String, default: '--' },
  sessMM:      { type: String, default: '--' },
  sessMarks:   { type: String, default: '--' },
  total:       { type: String, default: '--' }
};

const resultSchema = new mongoose.Schema({
  rollNumber:        { type: String, required: true, trim: true },
  enrollmentNo:      { type: String, required: true, trim: true },
  studentName:       { type: String, required: true, trim: true },
  fatherName:        { type: String, required: true, trim: true },
  course:            { type: String, required: true, trim: true },
  studentStatus:     { type: String, default: 'Regular', trim: true },
  semesterPair:      { type: String, required: true }, // I_II, III_IV, V_VI
  sem1Name:          { type: String, default: 'I SEMESTER' },
  sem2Name:          { type: String, default: 'II SEMESTER' },
  sem1Subjects:      [subjectSchema],
  sem2Subjects:      [subjectSchema],
  carryOverPapers:   { type: String, default: '' },
  yearLabel:         { type: String, default: 'FIRST YEAR' },
  maximumMarks:      { type: String, required: true },
  marksObtain:       { type: String, required: true },
  result:            { type: String, required: true },
  dateOfDeclaration: { type: String, required: true },
  logoPath: { type: String, default: '' }
}, { timestamps: true });

// Unique per student + semester pair
resultSchema.index({ rollNumber: 1, semesterPair: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);