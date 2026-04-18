const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Lead = require('../models/Lead');

// Get all data (initial load for the frontend)
router.get('/data', async (req, res) => {
  try {
    const users = await User.find();
    const leads = await Lead.find();
    
    // We can add DailyLogs, Escalations, etc. later if needed
    res.json({
      users: users,
      leads: leads,
      dailyLogs: {},
      escalations: [],
      portalCheckLog: {},
      externalFollowups: [],
      commLogs: {},
      notifications: []
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

module.exports = router;
