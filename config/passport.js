    // config/passport.js
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const JWTStrategy = require('passport-jwt').Strategy;
    const ExtractJWT = require('passport-jwt').ExtractJwt;
    const User = require('../models/User'); // Import your User model

    // Local Strategy (Username/Password)
    passport.use(new LocalStrategy({
            usernameField: 'username', // Use username instead of default 'username'
            passwordField: 'password'
        },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ username: username.toLowerCase() }); // Find user (case-insensitive)
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                const isMatch = await user.comparePassword(password); // Use comparePassword method
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user, { message: 'Logged In Successfully' });
            } catch (error) {
                return done(error);
            }
        }
    ));

    // JWT Strategy
    passport.use(new JWTStrategy({
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey   : process.env.JWT_SECRET
        },
        async (jwtPayload, done) => {
            try {
                const user = await User.findById(jwtPayload.user._id); // Access user ID correctly
                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));
    