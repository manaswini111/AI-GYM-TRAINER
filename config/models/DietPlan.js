const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  title: String,
  goal: String, // e.g., weight loss, muscle gain
  meals: [
    {
      name: String,
      calories: Number,
      time: String
    }
  ],
  recommendedFor: [String] // e.g., ["vegetarian", "keto"]
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
