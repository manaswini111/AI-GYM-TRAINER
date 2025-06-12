    // models/User.js
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const bcrypt = require('bcrypt'); // Import bcrypt

    const userSchema = new Schema({
        username: { type: String, required: true, unique: true, trim: true, lowercase: true }, // Added trim and lowercase
        password: { type: String, required: true }, // Store hashed passwords!
        email: { type: String, required: true, unique: true, trim: true, lowercase: true }, // Added trim and lowercase
        fitnessGoals: { type: String },
        dietaryRestrictions: { type: [String] } // Array of restrictions
    });

    // Hash the password before saving the user
    userSchema.pre('save', async function(next) {
        if (!this.isModified('password')) return next(); // Only hash if password is changed

        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            return next();
        } catch (error) {
            return next(error);
        }
    });

    // Method to compare passwords for login
    userSchema.methods.comparePassword = async function(candidatePassword) {
        try {
            return await bcrypt.compare(candidatePassword, this.password);
        } catch (error) {
            throw error;
        }
    };

    module.exports = mongoose.model('User', userSchema);
    