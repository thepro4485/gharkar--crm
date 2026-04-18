const mongoose = require('mongoose');

const systemDataSchema = new mongoose.Schema({
  type: { type: String, default: 'global', unique: true },
  dailyLogs: { type: Object, default: {} },
  escalations: { type: Array, default: [] },
  portalCheckLog: { type: Object, default: {} },
  externalFollowups: { type: Array, default: [] },
  commLogs: { type: Object, default: {} },
  notifications: { type: Array, default: [] }
}, { strict: false, timestamps: true });

module.exports = mongoose.model('SystemData', systemDataSchema);
