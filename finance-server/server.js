// We ask the computer to read our secret .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// We bring in the map for User Login/Register
const authRoutes = require('./src/routes/authRoutes');

/* OLD CODE:
// We didn't have the group routes before
// const groupRoutes = require('./src/routes/groupRoutes');
*/

// NEW CODE:
// We bring in the new map for Group related things
const groupRoutes = require('./src/routes/groupRoutes');

const app = express();
// This helper allows us to read the messages sent by users
app.use(express.json());

// If the address starts with /auth, look at the authRoutes map
app.use('/auth', authRoutes);

/* OLD CODE:
// We didn't have a route for groups
*/

// NEW CODE:
[cite_start]// If the address starts with /groups, look at the groupRoutes map [cite: 1153-1176]
app.use('/groups', groupRoutes);

// We connect to the MongoDB database house using the key from our secret file
mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log('Error Connecting to Database:', error));

// We start the server shop on port 5001
app.listen(5001, () => {
    console.log('Server is running on port 5001');
});