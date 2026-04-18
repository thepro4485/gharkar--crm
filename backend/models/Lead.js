const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assignedTo: { type: String },
  currentStep: { type: Number, default: 1 },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  // Keeping strict: false allows the React frontend to save any arbitrary fields
  // like stageHistory, doc statuses, FIR questionnaire answers, etc. just like it did in localStorage.
}, { strict: false, timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
