const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');

// GET all diet plans
router.get('/', async (req, res) => {
  const plans = await DietPlan.find();
  res.json(plans);
});

// POST a new diet plan
router.post('/', async (req, res) => {
  const newPlan = new DietPlan(req.body);
  await newPlan.save();
  res.status(201).json(newPlan);
});

module.exports = router;
