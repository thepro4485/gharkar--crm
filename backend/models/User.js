const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true }, // 'admin', 'staff', 'executive', 'field', 'partner', 'developer', 'agent'
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Plain text for simplicity as per original code, but normally hashed
  email: { type: String, required: false },
  resetToken: { type: String, required: false },
  resetTokenExpiry: { type: Date, required: false },
  active: { type: Boolean, default: true },
  createdAt: { type: String, required: true }
});
module.exports = mongoose.model('User', userSchema);
