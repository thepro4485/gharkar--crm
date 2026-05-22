const express = require('express');
const router = express.Router();
const dns = require('dns');
const crypto = require('crypto');
const User = require('../models/User');
const Lead = require('../models/Lead');
const SystemData = require('../models/SystemData');
// Get all data (initial load for the frontend)
router.get('/data', async (req, res) => {
  try {
    const users = await User.find();
    const leads = await Lead.find();
    let sysData = await SystemData.findOne({ type: 'global' });
    if (!sysData) {
      sysData = await SystemData.create({ type: 'global' });
    }
    res.json({
      users: users,
      leads: leads,
      dailyLogs: sysData.dailyLogs || {},
      escalations: sysData.escalations || [],
      portalCheckLog: sysData.portalCheckLog || {},
      externalFollowups: sysData.externalFollowups || [],
      commLogs: sysData.commLogs || {},
      notifications: sysData.notifications || [],
      tasks: sysData.tasks || [],
      dripCampaigns: sysData.dripCampaigns || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- LEADS ---
// Create a new lead
router.post('/leads', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    res.json(newLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update a lead
router.put('/leads/:id', async (req, res) => {
  try {
    const updatedLead = await Lead.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true } // upsert true just in case
    );
    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/leads/:id', async (req, res) => {
  try {
    await Lead.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- USERS ---
router.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- SYSTEM DATA ---
router.put('/system-data', async (req, res) => {
  try {
    const updatedSystemData = await SystemData.findOneAndUpdate(
      { type: 'global' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updatedSystemData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- EMAIL VERIFICATION & PASSWORD RESET ---
const disposableBlacklist = [
  'mailinator.com', 'yopmail.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'dispostable.com', 'getairmail.com', 'throwawaymail.com', 'maildrop.cc', 'temp-mail.org',
  'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.org', 'spambox.us', 'trashmail.net'
];
function checkMXRecords(domain) {
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        dns.lookup(domain, (err2) => {
          if (err2) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  });
}
router.get('/verify-email', async (req, res) => {
  try {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.json({ status: 'invalid', message: 'Email parameter is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ status: 'invalid', message: 'Invalid email syntax.' });
    }
    const domain = email.split('@')[1];
    if (disposableBlacklist.includes(domain)) {
      return res.json({ status: 'disposable', message: 'Disposable/fake email address domain.' });
    }
    const hasMX = await checkMXRecords(domain);
    if (!hasMX) {
      return res.json({ status: 'no_mx', message: 'Inactive domain. No MX records found.' });
    }
    return res.json({ status: 'valid', message: 'Real & active email address verified.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, email } = req.body;
    const cleanU = (username || '').trim().toLowerCase();
    const cleanE = (email || '').trim().toLowerCase();
    if (!cleanU || !cleanE) {
      return res.status(400).json({ error: 'Username and email are required.' });
    }
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${cleanU}$`, 'i') },
      email: { $regex: new RegExp(`^${cleanE}$`, 'i') }
    });
    if (!user) {
      return res.status(404).json({ error: 'No matching user found with those credentials.' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();
    const resetLink = `/reset-password?token=${token}`;
    res.json({
      success: true,
      message: 'Simulated password reset link generated successfully.',
      resetLink: resetLink,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required.' });
    }
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }
    user.password = password.trim();
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
