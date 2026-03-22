const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteLogo:       { type: String, default: '' },
  universityName: { type: String, default: '' }
});

module.exports = mongoose.model('Settings', settingsSchema);
