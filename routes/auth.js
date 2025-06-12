    // routes/auth.js
    const express = require('express');
    const router = express.Router();
    const passport = require('passport');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcrypt'); // Import bcrypt (if not already)
    const User = require('../models/User'); // Import your User model
    const { body, validationResult } = require('express-validator'); // Import express-validator

    // Register route (with validation)
    router.post('/register', [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email
            });
            await user.save();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            if (error.code === 11000) { // MongoDB duplicate key error
                return res.status(400).json({ message: 'Username or email already exists' });
            }
            res.status(500).json({ message: 'Error registering user' });
        }
    });

    // Login route
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(400).json({
                    message: info ? info.message : 'Login failed',
                    user   : user
                });
            }
            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                // generate a signed json web token with the contents of the user object and return it in the response
                const token = jwt.sign({ user: { _id: user._id, username: user.username, email: user.email }, }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use a strong secret key and set expiration
                return res.json({ user, token });
            });
        })(req, res, next);
    });

    // Example protected route
    router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
        res.json({ user: req.user });
    });

    module.exports = router;
    