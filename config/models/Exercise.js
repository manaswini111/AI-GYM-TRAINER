const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  type: String, // e.g., cardio, strength
  muscleGroup: String,
  difficulty: String, // beginner, intermediate, advanced
  equipment: String,
  instructions: String
});

module.exports = mongoose.model('Exercise', exerciseSchema);
