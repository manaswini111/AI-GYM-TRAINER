    // index.js or app.js
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    require('dotenv').config(); // Load environment variables from .env

    const app = express();
    const port = process.env.PORT || 5000; // Use environment variable for port, or default to 5000

    app.use(cors()); // Enable CORS for all routes
    app.use(express.json()); // Enable parsing of JSON request bodies

    // Import routes
    const authRoutes = require('./routes/auth');

    // Use routes
    app.use('/auth', authRoutes);

    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //useCreateIndex: true, // Deprecated in newer versions
        //useFindAndModify: false // Deprecated in newer versions
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
        // index.js
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    require('dotenv').config();

    const passport = require('passport'); // Import passport
    require('./config/passport'); // Import passport configuration

    const app = express();
    const port = process.env.PORT || 5000;

    app.use(cors());
    app.use(express.json());

    app.use(passport.initialize()); // Initialize passport

    // Import routes
    const authRoutes = require('./routes/auth');

    // Use routes
    app.use('/auth', authRoutes);

    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //useCreateIndex: true, // Deprecated in newer versions
        //useFindAndModify: false // Deprecated in newer versions
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
   const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Auth routes here...
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/diets', require('./routes/diets'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 