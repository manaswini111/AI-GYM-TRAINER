const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');

// GET all exercises
router.get('/', async (req, res) => {
  const data = await Exercise.find();
  res.json(data);
});

// POST new exercise
router.post('/', async (req, res) => {
  const newExercise = new Exercise(req.body);
  await newExercise.save();
  res.status(201).json(newExercise);
});

module.exports = router;
